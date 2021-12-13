import { JwtService, KeysService } from '@affinidi/common'
import { DidAuthAdapterType, KeyStorageApiService } from '@affinidi/internal-api-clients'
import { profile } from '@affinidi/tools-common'
import { extractSDKVersion } from '../_helpers'
import { Env, SignedCredential } from '../dto/shared.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'
import SdkErrorFromCode from '../shared/SdkErrorFromCode'
import AffinidiVaultStorageService from './AffinidiVaultStorageService'
import BloomVaultStorageService from './BloomVaultStorageService'
import AffinidiVaultEncryptionService from './AffinidiVaultEncryptionService'

const createHash = require('create-hash')

const sha256 = (data: unknown) => {
  return createHash('sha256').update(data).digest()
}

type ConstructorOptions = {
  bloomVaultUrl: string
  affinidiVaultUrl: string
  migrationUrl: string
  storageRegion: string
  accessApiKey: string
  didAuthAdapter: DidAuthAdapterType
}

@profile()
export default class WalletStorageService {
  private _storageRegion
  private _bloomVaultStorageService
  private _affinidiVaultStorageService

  constructor(
    keysService: KeysService,
    platformCryptographyTools: IPlatformCryptographyTools,
    options: ConstructorOptions,
  ) {
    this._storageRegion = options.storageRegion

    const encryptionService = new AffinidiVaultEncryptionService(keysService, platformCryptographyTools)

    this._affinidiVaultStorageService = new AffinidiVaultStorageService(encryptionService, {
      didAuthAdapter: options.didAuthAdapter,
      accessApiKey: options.accessApiKey,
      vaultUrl: options.affinidiVaultUrl,
    })

    this._bloomVaultStorageService = new BloomVaultStorageService(keysService, platformCryptographyTools, {
      accessApiKey: options.accessApiKey,
      vaultUrl: options.bloomVaultUrl,
      didAuthAdapter: options.didAuthAdapter,
      encryptionService,
      migrationUrl: options.migrationUrl,
    })
  }

  static hashFromString(data: string): string {
    const buffer = sha256(Buffer.from(data))

    return buffer.toString('hex')
  }

  static async getCredentialOffer(
    accessToken: string,
    keyStorageUrl: string,
    options: { env: Env; accessApiKey: string },
  ): Promise<string> {
    const { accessApiKey, env } = options
    const service = new KeyStorageApiService({
      keyStorageUrl,
      accessApiKey,
      sdkVersion: extractSDKVersion(),
    })
    const { body } = await service.getCredentialOffer({ accessToken, env })
    const { offerToken } = body
    return offerToken
  }

  static async getSignedCredentials(
    accessToken: string,
    credentialOfferResponseToken: string,
    options: { env?: Env; keyStorageUrl?: string; issuerUrl?: string; accessApiKey?: string; apiKey?: string },
  ): Promise<SignedCredential[]> {
    const keyStorageUrl = options.keyStorageUrl
    const { env, issuerUrl, accessApiKey, apiKey } = options
    const service = new KeyStorageApiService({ keyStorageUrl, accessApiKey, sdkVersion: extractSDKVersion() })
    const { body } = await service.getSignedCredential(accessToken, {
      credentialOfferResponseToken,
      options: { env, issuerUrl, accessApiKey, apiKey },
    })

    const { signedCredentials } = body

    return signedCredentials as SignedCredential[]
  }

  private async _getCredentialsByTypes(storageRegion?: string, types?: string[][]) {
    storageRegion = storageRegion || this._storageRegion

    const credentials = await this._affinidiVaultStorageService.searchCredentials(storageRegion, types)

    // should be deleted during migration to affinidi-vault Phase #2
    const bloomCredentials = await this._bloomVaultStorageService.searchCredentials(storageRegion, types)

    return this._uniqueCredentials([...credentials, ...bloomCredentials])
  }

  private async _uniqueCredentials(credentials: any[]) {
    const uniqueMap = new Map()
    const uniqueCredentials = credentials.filter((credential) => {
      const jsonCredentials = JSON.stringify(credential)
      if (uniqueMap.has(jsonCredentials)) {
        return false
      }

      uniqueMap.set(jsonCredentials, {})
      return true
    })

    return uniqueCredentials
  }

  public async saveCredentials(credentials: any[], storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    const responses = await this._affinidiVaultStorageService.saveCredentials(credentials, storageRegion)

    return responses
  }

  public async getAllCredentials(storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    const credentials = await this._affinidiVaultStorageService.searchCredentials(storageRegion)

    // should be deleted during migration to affinidi-vault Phase #2
    const bloomCredentials = await this._bloomVaultStorageService.searchCredentials(storageRegion)

    return this._uniqueCredentials([...credentials, ...bloomCredentials])
  }

  public async getCredentialsByShareToken(token: string, storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    if (!token) {
      return this.getAllCredentials()
    }

    const request = JwtService.fromJWT(token)
    const {
      payload: {
        interactionToken: { credentialRequirements },
      },
    } = request

    if (!credentialRequirements) {
      return this.getAllCredentials()
    }

    const requirementTypes = credentialRequirements.map(
      (credentialRequirement: { type: string[] }) => credentialRequirement.type,
    )

    return this._getCredentialsByTypes(storageRegion, requirementTypes)
  }

  public async getCredentialById(credentialId: string, storageRegion?: string): Promise<any> {
    storageRegion = storageRegion || this._storageRegion

    try {
      return await this._affinidiVaultStorageService.getCredentialById(credentialId, storageRegion)
    } catch (error) {
      if (error.code !== 'AVT-2') {
        throw error
      }

      // should be deleted during migration to affinidi-vault Phase #2
      return await this._bloomVaultStorageService.getCredentialById(credentialId, storageRegion)
    }
  }

  public async deleteCredentialById(credentialId: string, storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    try {
      await this._affinidiVaultStorageService.deleteCredentialById(credentialId, storageRegion)
    } catch (error) {
      if (error.code !== 'AVT-2') {
        throw error
      }

      // should be deleted during migration to affinidi-vault Phase #2
      await this._bloomVaultStorageService.deleteCredentialById(credentialId, storageRegion)
    }
  }

  public async deleteAllCredentials(storageRegion?: string): Promise<void> {
    storageRegion = storageRegion || this._storageRegion

    try {
      await this._affinidiVaultStorageService.deleteAllCredentials(storageRegion)
    } catch (error) {
      throw new SdkErrorFromCode('COR-0', {}, error)
    }

    try {
      await this._bloomVaultStorageService.deleteAllCredentials(storageRegion)
    } catch (error) {
      throw new SdkErrorFromCode('COR-0', {}, error)
    }
  }
}

type PaginationOptions = {
  skip: number
  limit: number
}
