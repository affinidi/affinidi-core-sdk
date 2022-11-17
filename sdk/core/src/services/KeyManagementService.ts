import { JwtService, KeysService } from '@affinidi/common'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import { profile } from '@affinidi/tools-common'
import retry from 'async-retry'
import { extractSDKVersion } from '../_helpers'
const createHash = require('create-hash')

import { KeyParams } from '../dto/shared.dto'
import { withDidData } from '../shared/getDidData'
import SdkErrorFromCode from '../shared/SdkErrorFromCode'

type ConstructorOptions = {
  keyStorageUrl: string
  accessApiKey: string
}

const sha256 = (data: unknown) => {
  return createHash('sha256').update(data).digest()
}

const hashFromString = (data: string): string => {
  const buffer = sha256(Buffer.from(data))

  return buffer.toString('hex')
}

@profile()
export default class KeyManagementService {
  private _keyStorageApiService

  constructor(options: ConstructorOptions) {
    this._keyStorageApiService = new KeyStorageApiService({
      keyStorageUrl: options.keyStorageUrl,
      accessApiKey: options.accessApiKey,
      sdkVersion: extractSDKVersion(),
    })
  }

  private async _pullEncryptedSeed(accessToken: string) {
    const {
      body: { encryptedSeed },
    } = await this._keyStorageApiService.readMyKey({ accessToken })

    return encryptedSeed
  }

  private async _pullEncryptionKey(accessToken: string): Promise<string> {
    // TODO: must use key provider, its just a mock at this point
    const { payload } = JwtService.fromJWT(accessToken)
    const userId = payload.sub

    const encryptionKey = hashFromString(userId)

    return encryptionKey
  }

  private async _pullUserInfo(accessToken: string): Promise<string> {
    const { userCreateDate } = await this._keyStorageApiService.adminGetUserInfo({ accessToken })
    return userCreateDate
  }

  private async _storeEncryptedSeed(accessToken: string, seedHex: string, encryptionKey: string): Promise<void> {
    const encryptionKeyBuffer = Buffer.from(encryptionKey, 'hex')
    const encryptedSeed = await KeysService.encryptSeed(seedHex, encryptionKeyBuffer)

    await this._keyStorageApiService.storeMyKey(accessToken, { encryptedSeed })
  }

  public async pullKeyAndSeed(accessToken: string) {
    const encryptionKey = await this._pullEncryptionKey(accessToken)
    const encryptedSeed = await this._pullEncryptedSeed(accessToken)
    return { encryptionKey, encryptedSeed }
  }

  public async pullUserData(accessToken: string) {
    const { encryptionKey, encryptedSeed } = await this.pullKeyAndSeed(accessToken)
    return withDidData({ encryptedSeed, password: encryptionKey })
  }

  public async pullEncryptionKeyAndStoreEncryptedSeed(accessToken: string, seedHexWithMethod: string) {
    const encryptionKey = await this._pullEncryptionKey(accessToken)
    await this.storeEncryptedSeed(accessToken, seedHexWithMethod, encryptionKey)
  }

  private async storeEncryptedSeed(accessToken: string, seedHexWithMethod: string, encryptionKey: string) {
    await retry(
      async (bail) => {
        const errorCodes = ['COR-1', 'WAL-2']

        try {
          await this._storeEncryptedSeed(accessToken, seedHexWithMethod, encryptionKey)
        } catch (error) {
          if (errorCodes.indexOf(error.code) >= 0) {
            // If it's a known error we can bail out of the retry and that error will be what's thrown
            bail(error)
            return
          } else {
            // Otherwise we wrap the error and throw that,
            // this will trigger a retry until "retries" count is met
            throw new SdkErrorFromCode('COR-18', { accessToken }, error)
          }
        }
      },
      { retries: 3 },
    )
  }

  /* To cover scenario when registration failed and private key is not saved:
   *    1. seed is generated before user is confirmed in Cognito
   *    2. encrypt seed with user's password
   *    3. confirm user in Cognito, if registration is successful
   *    4. get user's encryptionKey
   *    5. re-encrypt user's seed with encryptionKey
   */
  public async reencryptSeed(accessToken: string, keyParams: KeyParams, backupUpdatedSeed: boolean) {
    const encryptionKey = await this._pullEncryptionKey(accessToken)
    const { fullSeedHex } = KeysService.decryptSeed(keyParams.encryptedSeed, keyParams.password)
    const encryptionKeyBuffer = KeysService.normalizePassword(encryptionKey)
    const updatedEncryptedSeed = await KeysService.encryptSeed(fullSeedHex, encryptionKeyBuffer)

    if (backupUpdatedSeed) {
      const { fullSeedHex } = KeysService.decryptSeed(updatedEncryptedSeed, encryptionKey)
      await this.storeEncryptedSeed(accessToken, fullSeedHex, encryptionKey)
    }

    return { encryptionKey, updatedEncryptedSeed }
  }
}
