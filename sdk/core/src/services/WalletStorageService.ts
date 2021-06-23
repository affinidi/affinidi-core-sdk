import { toRpcSig, ecsign } from 'ethereumjs-util'
import CognitoService from './CognitoService'
import SdkError from '../shared/SdkError'
import { profile } from '@affinidi/common'
import { JwtService, KeysService } from '@affinidi/common'

import { Env, FetchCredentialsPaginationOptions } from '../dto/shared.dto'
import { isW3cCredential } from '../_helpers'

import { FreeFormObject, IPlatformEncryptionTools } from '../shared/interfaces'

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
import GenericApiService from './GenericApiService'

type ConstructorOptions = {
  keyStorageUrl: string
  vaultUrl: string
  clientId: string
  userPoolId: string
  storageRegion: string
  accessApiKey: string
}

type AdminOptions = { keyStorageUrl: string; accessApiKey: string }

@profile()
export default class WalletStorageService {
  private _keyStorageUrl: string
  private _vaultUrl: string
  private _clientId: string
  private _userPoolId: string
  private _storageRegion: string
  private _keysService: KeysService
  private _platformEncryptionTools: IPlatformEncryptionTools
  private _accessApiKey: string

  constructor(
    keysService: KeysService,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: ConstructorOptions,
  ) {
    this._keysService = keysService
    this._platformEncryptionTools = platformEncryptionTools

    this._keyStorageUrl = options.keyStorageUrl
    this._vaultUrl = options.vaultUrl
    this._clientId = options.clientId
    this._userPoolId = options.userPoolId
    this._storageRegion = options.storageRegion
    this._accessApiKey = options.accessApiKey
  }

  async pullEncryptedSeed(username: string, password: string, token: string = undefined): Promise<string> {
    let accessToken = token

    /* istanbul ignore else: code simplicity */
    if (!token) {
      const cognitoService = new CognitoService({ clientId: this._clientId, userPoolId: this._userPoolId })
      const response = await cognitoService.signIn(username, password)

      accessToken = response.accessToken
    }

    const accessApiKey = this._accessApiKey

    const keyStorageUrl = this._keyStorageUrl
    const encryptedSeed = await WalletStorageService.pullEncryptedSeed(accessToken, keyStorageUrl, { accessApiKey })

    return encryptedSeed
  }

  static async pullEncryptedSeed(
    accessToken: string,
    keyStorageUrl: string,
    options: { accessApiKey: string },
  ): Promise<string> {
    const headers = { authorization: accessToken }
    const { accessApiKey } = options

    const {
      body: { encryptedSeed },
    } = await GenericApiService.executeByOptions(accessApiKey, `${keyStorageUrl}/api/v1/keys/readMyKey`, {
      headers,
      method: 'GET',
    })

    return encryptedSeed
  }

  static hashFromString(data: string): string {
    const buffer = sha256(Buffer.from(data))

    return buffer.toString('hex')
  }

  static async pullEncryptionKey(accessToken: string): Promise<string> {
    // TODO: must use key provider, its just a mock at this point
    const { payload } = JwtService.fromJWT(accessToken)
    const userId = payload.sub

    const encryptionKey = WalletStorageService.hashFromString(userId)

    return encryptionKey
  }

  async storeEncryptedSeed(accessToken: string, seedHex: string, encryptionKey: string): Promise<void> {
    const encryptionKeyBuffer = Buffer.from(encryptionKey, 'hex')
    const encryptedSeed = await KeysService.encryptSeed(seedHex, encryptionKeyBuffer)

    const headers = {
      authorization: accessToken,
    }

    await GenericApiService.executeByOptions(this._accessApiKey, `${this._keyStorageUrl}/api/v1/keys/storeMyKey`, {
      headers,
      params: { encryptedSeed },
      method: 'POST',
    })
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
    const headers = {
      ...(storageRegion && { 'X-DST-REGION': storageRegion }),
    }

    const { addressHex, privateKeyHex } = this.getVaultKeys()

    const didEth = `did:ethr:0x${addressHex}`

    const {
      body: { token },
    } = await GenericApiService.executeByOptions(
      this._accessApiKey,
      `${this._vaultUrl}/auth/request-token?did=${didEth}`,
      { params: {}, method: 'POST', headers },
    )

    const signature = this.signByVaultKeys(token, privateKeyHex)

    await GenericApiService.executeByOptions(this._accessApiKey, `${this._vaultUrl}/auth/validate-token`, {
      params: { accessToken: token, signature, did: didEth },
      method: 'POST',
      headers,
    })

    return token
  }

  async saveCredentials(data: unknown[], region?: string) {
    const responses = []
    const token = await this.authorizeVcVault(region)

    const storageRegion = region || this._storageRegion

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(storageRegion ? { ['X-DST-REGION']: storageRegion } : {}),
    }

    for (const cyphertext of data) {
      const params = { cyphertext }
      const { body } = await GenericApiService.executeByOptions(this._accessApiKey, `${this._vaultUrl}/data`, {
        headers,
        params,
        method: 'POST',
      })

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
    const token = await this.authorizeVcVault()

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(this._storageRegion ? { ['X-DST-REGION']: this._storageRegion } : {}),
    }

    const url = `${this._vaultUrl}/data/0/99`

    try {
      await GenericApiService.executeByOptions(this._accessApiKey, `${this._vaultUrl}/data/0/99`, {
        url,
        headers,
        method: 'DELETE',
      })
    } catch (error) {
      throw new SdkError('COR-0', {}, error)
    }
  }

  public async deleteCredentialByIndex(index: string): Promise<void> {
    const token = await this.authorizeVcVault()

    const headers: any = {
      Authorization: `Bearer ${token}`,
      ...(this._storageRegion ? { ['X-DST-REGION']: this._storageRegion } : {}),
    }

    // NOTE: deletes the data objects associated with the included access token
    //       and the included IDs starting with :start and ending with :end inclusive
    //       https://github.com/hellobloom/bloom-vault#delete-datastartend
    const start = index
    const end = index

    try {
      await GenericApiService.executeByOptions(this._accessApiKey, `${this._vaultUrl}/data/${start}/${end}`, {
        headers,
        method: 'DELETE',
      })
    } catch (error) {
      throw new SdkError('COR-0', {}, error)
    }
  }

  private _filterDeletedCredentials(blobs: any[]): any[] {
    return blobs.filter((blob) => blob.cyphertext !== null)
  }

  async fetchEncryptedCredentials(
    fetchCredentialsPaginationOptions?: FetchCredentialsPaginationOptions,
  ): Promise<any[]> {
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
  private async *fetchAllEncryptedCredentialsInBatches(): AsyncIterable<any[]> {
    const paginationOptions = WalletStorageService._getPaginationOptionsWithDefault()
    let lastCount = 0

    const token = await this.authorizeVcVault()

    do {
      let blobs: any[] = []

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
    let allBlobs: any[] = []
    for await (const blobs of this.fetchAllEncryptedCredentialsInBatches()) {
      allBlobs = [...allBlobs, ...blobs]
    }

    return allBlobs
  }

  private async _fetchEncryptedCredentialsWithPagination(
    paginationOptions: PaginationOptions,
    token: string,
  ): Promise<any[]> {
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(this._storageRegion ? { ['X-DST-REGION']: this._storageRegion } : {}),
    }

    try {
      const { body: blobs } = await GenericApiService.executeByOptions<any[]>(
        this._accessApiKey,
        this._buildVaultFetchEncryptedCredentialsUrl(paginationOptions),
        { headers, method: 'GET' },
      )

      return blobs
    } catch (error) {
      if (error.httpStatusCode === 404) {
        throw new SdkError('COR-14', {}, error)
      } else {
        throw error
      }
    }
  }

  private _buildVaultFetchEncryptedCredentialsUrl(paginationOptions: PaginationOptions): string {
    const { skip, limit } = paginationOptions

    return `${this._vaultUrl}/data/${skip}/${skip + limit - 1}`
  }

  static async adminConfirmUser(username: string, options: AdminOptions): Promise<void> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL
    await GenericApiService.executeByOptions(
      options.accessApiKey,
      `${keyStorageUrl}/api/v1/userManagement/adminConfirmUser`,
      { params: { username }, method: 'POST' },
    )
  }

  static async adminDeleteUnconfirmedUser(username: string, options: AdminOptions): Promise<void> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL

    await GenericApiService.executeByOptions(
      options.accessApiKey,
      `${keyStorageUrl}/api/v1/userManagement/adminDeleteUnconfirmedUser`,
      { params: { username }, method: 'POST' },
    )
  }

  static async getCredentialOffer(
    idToken: string,
    keyStorageUrl: string,
    options: { env: Env; accessApiKey: string },
  ): Promise<string> {
    keyStorageUrl = keyStorageUrl || STAGING_KEY_STORAGE_URL

    const env: Env = options.env

    const headers = {
      authorization: idToken,
    }

    const { body } = await GenericApiService.executeByOptions<any>(
      options.accessApiKey,
      `${keyStorageUrl}/api/v1/issuer/getCredentialOffer?env=${env}`,
      { headers, method: 'GET' },
    )

    const { offerToken } = body
    return offerToken
  }

  static async getSignedCredentials(
    idToken: string,
    credentialOfferResponseToken: string,
    options: any = {},
  ): Promise<SignedCredential[]> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL

    const headers = {
      authorization: idToken,
    }

    const params: FreeFormObject = { credentialOfferResponseToken }
    const method = 'POST'

    /* istanbul ignore next: manual test */
    if (Object.entries(options).length !== 0) {
      delete options.cognitoUser // not required
      delete options.cognitoUserTokens // not required
      delete options.skipBackupEncryptedSeed // not required
      delete options.skipBackupCredentials // not required
      delete options.issueSignupCredential // not required
      delete options.metricsUrl // not required
      delete options.apiKey // not required
      delete options.storageRegion // not required
      delete options.clientId // not required
      delete options.userPoolId // not required

      params.options = options
    }

    const { body } = await GenericApiService.executeByOptions<any>(
      options.accessApiKey,
      `${keyStorageUrl}/api/v1/issuer/getSignedCredential`,
      { headers, params, method },
    )

    const { signedCredentials } = body

    return signedCredentials
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
    return this.deleteCredentialByIndex(credentialIndexToDelete.toString())
  }
}

type PaginationOptions = {
  skip: number
  limit: number
}
