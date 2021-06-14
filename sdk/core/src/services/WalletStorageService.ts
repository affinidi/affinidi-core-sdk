import { toRpcSig, ecsign } from 'ethereumjs-util'
import { validate as uuidValidate } from 'uuid'
import CognitoService from './CognitoService'
import API from './ApiService'
import SdkError from '../shared/SdkError'
import { profile } from '@affinidi/common'
import { JwtService, KeysService } from '@affinidi/common'

import { Env, FetchCredentialsPaginationOptions } from '../dto/shared.dto'
import { isW3cCredential } from '../_helpers'

import { FreeFormObject } from '../shared/interfaces'

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

const sha256 = (data: any) => {
  return createHash('sha256').update(data).digest()
}

import {
  STAGING_KEY_STORAGE_URL,
  STAGING_VAULT_URL,
  STAGING_COGNITO_CLIENT_ID,
  STAGING_COGNITO_USER_POOL_ID,
} from '../_defaultConfig'

import { SignedCredential } from '../dto/shared.dto'
import { ParametersValidator } from '../shared'

@profile()
export default class WalletStorageService {
  _keyStorageUrl: string
  _vaultUrl: string
  _clientId: string
  _userPoolId: string
  _storageRegion: string
  _keysService: KeysService
  _api: API
  _accessApiKey: string

  constructor(encryptedSeed: string, password: string, options: any = {}) {
    this._keysService = new KeysService(encryptedSeed, password)

    this._keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL
    this._vaultUrl = options.vaultUrl || STAGING_VAULT_URL
    this._clientId = options.clientId || STAGING_COGNITO_CLIENT_ID
    this._userPoolId = options.userPoolId || STAGING_COGNITO_USER_POOL_ID

    const { registryUrl, issuerUrl, verifierUrl, storageRegion } = options

    this._storageRegion = storageRegion

    this._accessApiKey = options.accessApiKey

    const isApiKeyAValidUuid = options.apiKey && uuidValidate(options.apiKey)

    if (isApiKeyAValidUuid) {
      const apiKeyBuffer = KeysService.sha256(Buffer.from(options.apiKey))
      this._accessApiKey = apiKeyBuffer.toString('hex')
    }

    this._api = new API(registryUrl, issuerUrl, verifierUrl, options)
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

  static async pullEncryptedSeed(accessToken: string, keyStorageUrl?: string, options: any = {}): Promise<string> {
    keyStorageUrl = keyStorageUrl || STAGING_KEY_STORAGE_URL

    const url = `${keyStorageUrl}/api/v1/keys/readMyKey`

    const headers = {
      authorization: accessToken,
    }

    const api = new API(null, null, null, options)

    const { body } = await api.execute(null, {
      url,
      headers,
      method: 'GET',
    })

    const { encryptedSeed } = body

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
    const url = `${this._keyStorageUrl}/api/v1/keys/storeMyKey`

    const encryptionKeyBuffer = Buffer.from(encryptionKey, 'hex')
    const encryptedSeed = await KeysService.encryptSeed(seedHex, encryptionKeyBuffer)

    const headers = {
      authorization: accessToken,
    }

    await this._api.execute(null, {
      url,
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
    const headers: any = {}

    const storageRegion = region || this._storageRegion

    if (storageRegion) {
      headers['X-DST-REGION'] = storageRegion
    }

    const { addressHex, privateKeyHex } = this.getVaultKeys()

    const didEth = `did:ethr:0x${addressHex}`
    const tokenChallengeUrl = `${this._vaultUrl}/auth/request-token?did=${didEth}`

    const {
      body: { token },
    } = await this._api.execute(null, {
      url: tokenChallengeUrl,
      params: {},
      method: 'POST',
      headers,
    })

    const signature = this.signByVaultKeys(token, privateKeyHex)
    const tokenChallengeValidationUrl = `${this._vaultUrl}/auth/validate-token`

    await this._api.execute(null, {
      url: tokenChallengeValidationUrl,
      params: { accessToken: token, signature, did: didEth },
      method: 'POST',
      headers,
    })

    return token
  }

  async saveCredentials(data: any, region?: string) {
    const responses = []
    const token = await this.authorizeVcVault(region)

    const storageRegion = region || this._storageRegion

    const headers: any = {
      Authorization: `Bearer ${token}`,
      ...(storageRegion ? { ['X-DST-REGION']: storageRegion } : {}),
    }

    const url = `${this._vaultUrl}/data`

    /* istanbul ignore else: code simplicity */
    if (data.length && data.length > 0) {
      for (const cyphertext of data) {
        const params = { cyphertext }
        const { body } = await this._api.execute(null, {
          url,
          headers,
          params,
          method: 'POST',
        })

        responses.push(body)
      }
    }

    return responses
  }

  /* istanbul ignore next: private method */
  private isTypeMatchRequirements(credentialType: string[], requirementType: string[]): boolean {
    return requirementType.every((value: string) => credentialType.includes(value))
  }

  /* istanbul ignore next: there is test with NULL, but that did not count */
  filterCredentials(credentialShareRequestToken: string = null, credentials: any) {
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

      return credentials.filter((credential: any) => {
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

    const headers: any = {
      Authorization: `Bearer ${token}`,
      ...(this._storageRegion ? { ['X-DST-REGION']: this._storageRegion } : {}),
    }

    const url = `${this._vaultUrl}/data/0/99`

    try {
      const response = await this._api.execute(null, {
        url,
        headers,
        method: 'DELETE',
      })

      return response
    } catch (error) {
      throw new SdkError('COR-0', {}, error)
    }
  }

  async deleteCredentialByIndex(index: string): Promise<void> {
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
    const url = `${this._vaultUrl}/data/${start}/${end}`

    try {
      const response = await this._api.execute(null, {
        url,
        headers,
        method: 'DELETE',
      })

      return response
    } catch (error) {
      throw new SdkError('COR-0', {}, error)
    }
  }

  private _filterDeletedCredentials(blobs: any[]): any[] {
    return blobs.filter((blob) => blob.cyphertext !== null)
  }

  async fetchEncryptedCredentials(fetchCredentialsPaginationOptions?: FetchCredentialsPaginationOptions): Promise<any> {
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
    const headers: any = {
      Authorization: `Bearer ${token}`,
      ...(this._storageRegion ? { ['X-DST-REGION']: this._storageRegion } : {}),
    }

    const url = this._buildVaultFetchEncryptedCredentialsUrl(paginationOptions)

    try {
      const { body: blobs } = await this._api.execute(null, {
        url,
        headers,
        method: 'GET',
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

  private _buildVaultFetchEncryptedCredentialsUrl(paginationOptions: PaginationOptions): string {
    const { skip, limit } = paginationOptions

    return `${this._vaultUrl}/data/${skip}/${skip + limit - 1}`
  }

  static async adminConfirmUser(username: string, options: any = {}): Promise<void> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL

    const url = `${keyStorageUrl}/api/v1/userManagement/adminConfirmUser`

    const api = new API(null, null, null, options)

    await api.execute(null, {
      url,
      params: { username },
      method: 'POST',
    })
  }

  static async adminDeleteUnconfirmedUser(username: string, options: any = {}): Promise<void> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL

    const url = `${keyStorageUrl}/api/v1/userManagement/adminDeleteUnconfirmedUser`

    const api = new API(null, null, null, options)

    await api.execute(null, {
      url,
      params: { username },
      method: 'POST',
    })
  }

  static async getCredentialOffer(idToken: string, keyStorageUrl?: string, options: any = {}): Promise<string> {
    keyStorageUrl = keyStorageUrl || STAGING_KEY_STORAGE_URL

    const env: Env = options.env

    const url = `${keyStorageUrl}/api/v1/issuer/getCredentialOffer?env=${env}`

    const headers = {
      authorization: idToken,
    }

    const api = new API(null, null, null, options)
    const { body } = await api.execute(null, {
      url,
      headers,
      method: 'GET',
    })

    const { offerToken } = body
    return offerToken
  }

  static async getSignedCredentials(
    idToken: string,
    credentialOfferResponseToken: string,
    options: any = {},
  ): Promise<SignedCredential[]> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL

    const url = `${keyStorageUrl}/api/v1/issuer/getSignedCredential`
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

    const api = new API(null, null, null, options)
    const { body } = await api.execute(null, { url, headers, params, method })

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
}

type PaginationOptions = {
  skip: number
  limit: number
}
