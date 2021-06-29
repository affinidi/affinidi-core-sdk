import { toRpcSig, ecsign } from 'ethereumjs-util'
import SdkError from '../shared/SdkError'
import { profile } from '@affinidi/common'
import { JwtService, KeysService } from '@affinidi/common'

import { Env, FetchCredentialsPaginationOptions } from '../dto/shared.dto'
import { isW3cCredential } from '../_helpers'

import { IPlatformEncryptionTools } from '../shared/interfaces'

const keccak256 = require('keccak256')
const createHash = require('create-hash')
const secp256k1 = require('secp256k1')
const bip32 = require('bip32')

const jolocomIdentityKey = "m/73'/0'/0'/0" // eslint-disable-line

/* istanbul ignore next */
const hashPersonalMessage = (message: Buffer): Buffer => {
  const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${message.length.toString()}`, 'utf-8')
  return keccak256(Buffer.concat([prefix, message]))
}

/* istanbul ignore next */
const privateToPublic = (privateKey: Buffer): Buffer => {
  privateKey = Buffer.from(privateKey)
  return secp256k1.publicKeyCreate(privateKey, false).slice(1)
}

/* istanbul ignore next */
const publicToAddress = (publicKey: Buffer): Buffer => {
  publicKey = Buffer.from(publicKey)
  return keccak256(publicKey).slice(-20)
}

const sha256 = (data: unknown) => {
  return createHash('sha256').update(data).digest()
}

import { STAGING_KEY_STORAGE_URL } from '../_defaultConfig'

import { SignedCredential } from '../dto/shared.dto'
import { ParametersValidator } from '../shared'
import KeyStorageApiService from './KeyStorageApiService'
import BloomVaultApiService, { BlobType } from './BloomVaultApiService'

type ConstructorOptions = {
  vaultUrl: string
  storageRegion: string
  accessApiKey: string
}

@profile()
export default class WalletStorageService {
  private _storageRegion: string
  private _keysService: KeysService
  private _platformEncryptionTools: IPlatformEncryptionTools
  private _bloomVaultApiService

  constructor(
    keysService: KeysService,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: ConstructorOptions,
  ) {
    this._keysService = keysService
    this._platformEncryptionTools = platformEncryptionTools
    this._bloomVaultApiService = new BloomVaultApiService(options)
    this._storageRegion = options.storageRegion
  }

  static hashFromString(data: string): string {
    const buffer = sha256(Buffer.from(data))

    return buffer.toString('hex')
  }

  /* istanbul ignore next: private function */
  private getVaultKeys() {
    const { seed } = this._keysService.decryptSeed()

    const privateKey = bip32.fromSeed(seed).derivePath(jolocomIdentityKey).privateKey
    const privateKeyHex = privateKey.toString('hex')

    const publicKey = privateToPublic(privateKey)
    const addressHex = publicToAddress(publicKey).toString('hex')

    return { addressHex, privateKeyHex }
  }

  /* istanbul ignore next: ethereumjs-util */
  signByVaultKeys(message: string, privateKey: string) {
    const sig = ecsign(hashPersonalMessage(Buffer.from(message)), Buffer.from(privateKey, 'hex'))

    return toRpcSig(sig.v, sig.r, sig.s)
  }

  async authorizeVcVault(region?: string) {
    const storageRegion = region || this._storageRegion

    const { addressHex, privateKeyHex } = this.getVaultKeys()
    const didEth = `did:ethr:0x${addressHex}`

    const {
      body: { token },
    } = await this._bloomVaultApiService.requestAuthToken({
      storageRegion,
      did: didEth,
    })

    const signature = this.signByVaultKeys(token, privateKeyHex)

    await this._bloomVaultApiService.validateAuthToken({
      storageRegion,
      accessToken: token,
      signature,
      did: didEth,
    })

    return token
  }

  async saveCredentials(data: string[], region?: string) {
    const responses = []
    const accessToken = await this.authorizeVcVault(region)
    const storageRegion = region || this._storageRegion

    for (const cyphertext of data) {
      const { body } = await this._bloomVaultApiService.postCredential({ accessToken, storageRegion, cyphertext })
      responses.push(body)
    }

    return responses
  }

  /* istanbul ignore next: private method */
  private isTypeMatchRequirements(credentialType: string[], requirementType: string[]): boolean {
    return requirementType.every((value: string) => credentialType.includes(value))
  }

  /* istanbul ignore next: there is test with NULL, but that did not count */
  filterCredentials(credentialShareRequestToken: string, credentials: any[]) {
    if (credentialShareRequestToken) {
      const request = JwtService.fromJWT(credentialShareRequestToken)

      const {
        payload: {
          interactionToken: { credentialRequirements },
        },
      } = request

      // prettier-ignore
      const requirementTypes =
        credentialRequirements.map((credentialRequirement: any) => credentialRequirement.type)

      return credentials.filter((credential) => {
        if (isW3cCredential(credential)) {
          for (const requirementType of requirementTypes) {
            const isTypeMatchRequirements = this.isTypeMatchRequirements(credential.type, requirementType)

            if (isTypeMatchRequirements) {
              return credential
            }
          }
        }
      })
    }

    return credentials
  }

  async deleteAllCredentials(): Promise<void> {
    const accessToken = await this.authorizeVcVault()
    const storageRegion = this._storageRegion

    try {
      await this._bloomVaultApiService.deleteCredentials({ accessToken, storageRegion, start: 0, end: 99 })
    } catch (error) {
      throw new SdkError('COR-0', {}, error)
    }
  }

  public async deleteCredentialByIndex(index: number): Promise<void> {
    const accessToken = await this.authorizeVcVault()
    const storageRegion = this._storageRegion

    try {
      // NOTE: deletes the data objects associated with the included access token
      //       and the included IDs starting with :start and ending with :end inclusive
      //       https://github.com/hellobloom/bloom-vault#delete-datastartend
      await this._bloomVaultApiService.deleteCredentials({ accessToken, storageRegion, start: index, end: index })
    } catch (error) {
      throw new SdkError('COR-0', {}, error)
    }
  }

  private _filterDeletedCredentials(blobs: BlobType[]): BlobType[] {
    return blobs.filter((blob) => blob.cyphertext !== null)
  }

  async fetchEncryptedCredentials(
    fetchCredentialsPaginationOptions?: FetchCredentialsPaginationOptions,
  ): Promise<BlobType[]> {
    await ParametersValidator.validate([
      {
        isArray: false,
        type: FetchCredentialsPaginationOptions,
        isRequired: false,
        value: fetchCredentialsPaginationOptions,
      },
    ])

    const paginationOptions = WalletStorageService._getPaginationOptionsWithDefault(fetchCredentialsPaginationOptions)

    const token = await this.authorizeVcVault()
    const blobs = await this._fetchEncryptedCredentialsWithPagination(paginationOptions, token)
    return this._filterDeletedCredentials(blobs)
  }

  /**
   * Start fetching all credentials inside the vault page by page
   * @param fetchCredentialsPaginationOptions starting and batch count for the credentials
   */
  private async *fetchAllEncryptedCredentialsInBatches(): AsyncIterable<BlobType[]> {
    const paginationOptions = WalletStorageService._getPaginationOptionsWithDefault()
    let lastCount = 0

    const token = await this.authorizeVcVault()

    do {
      let blobs: BlobType[] = []

      try {
        blobs = await this._fetchEncryptedCredentialsWithPagination(paginationOptions, token)
      } catch (err) {
        if (err.code === 'COR-14') {
          break
        }

        throw err
      }

      yield this._filterDeletedCredentials(blobs)

      paginationOptions.skip += paginationOptions.limit
      lastCount = blobs.length
    } while (lastCount === paginationOptions.limit)
  }

  public async fetchAllBlobs() {
    let allBlobs: BlobType[] = []
    for await (const blobs of this.fetchAllEncryptedCredentialsInBatches()) {
      allBlobs = [...allBlobs, ...blobs]
    }

    return allBlobs
  }

  private async _fetchEncryptedCredentialsWithPagination(
    paginationOptions: PaginationOptions,
    accessToken: string,
  ): Promise<BlobType[]> {
    try {
      const { body: blobs } = await this._bloomVaultApiService.getCredentials({
        accessToken,
        storageRegion: this._storageRegion,
        start: paginationOptions.skip,
        end: paginationOptions.skip + paginationOptions.limit - 1,
      })

      return blobs
    } catch (error) {
      if (error.httpStatusCode === 404) {
        throw new SdkError('COR-14', {}, error)
      } else {
        throw error
      }
    }
  }

  static async getCredentialOffer(
    accessToken: string,
    keyStorageUrl: string,
    options: { env: Env; accessApiKey: string },
  ): Promise<string> {
    keyStorageUrl = keyStorageUrl || STAGING_KEY_STORAGE_URL
    const { accessApiKey, env } = options
    const service = new KeyStorageApiService({ keyStorageUrl, accessApiKey })
    const { body } = await service.getCredentialOffer({ accessToken, env })
    const { offerToken } = body
    return offerToken
  }

  static async getSignedCredentials(
    accessToken: string,
    credentialOfferResponseToken: string,
    options: { keyStorageUrl?: string; issuerUrl?: string; accessApiKey?: string; apiKey?: string } = {},
  ): Promise<SignedCredential[]> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL
    const { issuerUrl, accessApiKey, apiKey } = options
    const service = new KeyStorageApiService({ keyStorageUrl, accessApiKey })
    const { body } = await service.getSignedCredential(accessToken, {
      credentialOfferResponseToken,
      options: { issuerUrl, accessApiKey, apiKey },
    })

    const { signedCredentials } = body

    return signedCredentials as SignedCredential[]
  }

  private static _getPaginationOptionsWithDefault(
    fetchCredentialsPaginationOptions?: FetchCredentialsPaginationOptions,
  ): PaginationOptions {
    const { skip, limit } = fetchCredentialsPaginationOptions || {}

    return {
      skip: skip || 0,
      limit: limit || 100,
    }
  }

  async encryptAndSaveCredentials(data: unknown[], storageRegion?: string) {
    const publicKeyBuffer = this._keysService.getOwnPublicKey()
    const encryptedCredentials = []

    for (const item of data) {
      const cyphertext = await this._platformEncryptionTools.encryptByPublicKey(publicKeyBuffer, item)
      encryptedCredentials.push(cyphertext)
    }

    return await this.saveCredentials(encryptedCredentials, storageRegion)
  }

  async fetchAllDecryptedCredentials() {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const allBlobs = await this.fetchAllBlobs()
    const allCredentials = []
    for (const blob of allBlobs) {
      const credential = await this._platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)
      allCredentials.push(credential)
    }

    return allCredentials
  }

  async fetchDecryptedCredentials(fetchCredentialsPaginationOptions: FetchCredentialsPaginationOptions) {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const blobs = await this.fetchEncryptedCredentials(fetchCredentialsPaginationOptions)
    const credentials = []
    for (const blob of blobs) {
      const credential = await this._platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)
      credentials.push(credential)
    }

    return credentials
  }

  async getCredentialByIndex(credentialIndex: number): Promise<any> {
    const paginationOptions: FetchCredentialsPaginationOptions = { skip: credentialIndex, limit: 1 }
    const credentials = await this.fetchDecryptedCredentials(paginationOptions)

    if (!credentials[0]) {
      throw new SdkError('COR-14')
    }

    return credentials[0]
  }

  private async findCredentialIndexById(id: string) {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const allBlobs = await this.fetchAllBlobs()
    for (const blob of allBlobs) {
      const credential = await this._platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)

      let credentialId = credential.id

      if (!isW3cCredential(credential) && credential.data) {
        credentialId = credential.data.id
      }

      if (credentialId && credentialId === id) {
        return blob.id
      }
    }

    throw new SdkError('COR-23', { id })
  }

  async deleteCredential(id?: string, credentialIndex?: number): Promise<void> {
    if ((credentialIndex !== undefined && id) || (!id && credentialIndex === undefined)) {
      throw new SdkError('COR-1', {
        errors: [{ message: 'should pass either id or credentialIndex and not both at the same time' }],
      })
    }

    const credentialIndexToDelete = credentialIndex ?? (await this.findCredentialIndexById(id))
    return this.deleteCredentialByIndex(credentialIndexToDelete)
  }
}

type PaginationOptions = {
  skip: number
  limit: number
}
