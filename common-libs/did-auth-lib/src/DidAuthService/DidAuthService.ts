import { Affinidi, JwtService, KeysService, KeyVault, DidDocumentService, LocalKeyVault } from '@affinidi/common'
import { parse } from 'did-resolver'
import base64url from 'base64url'
import { DidAuthResponseToken } from './DidAuthResponseToken'
import { DidAuthRequestToken } from './DidAuthRequestToken'

let fetch: any

if (!fetch) {
  fetch = require('node-fetch')
}

const ONE_MINUTE_IN_MS = 60 * 1000
const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60
const DEFAULT_MAX_TOKEN_VALID_IN_MS = ONE_HOUR_IN_MS * 12

export type AffinidiDidAuthServiceOptions = OptionsWithSeed | OptionsWithKeyVault

/**
 * DidAuthService options based on a known seed
 */
export interface OptionsWithSeed {
  encryptedSeed: string
  encryptionKey: string
}

/**
 * DidAuthService options based on a `KeyVault`
 */
export interface OptionsWithKeyVault {
  /**
   * did of the local entity
   */
  did: string

  /**
   * Optional key id used for signing, defaults to `<did>#primary`
   */
  keyId?: string

  /**
   * KeyVault holding signing keys
   */
  keyVault: KeyVault
}

export interface VerifierOptions {
  environment: string
  accessApiKey: string
}

type CreateResponseTokenOptions = {
  maxTokenValidInMs?: number
}

export default class AffinidiDidAuthService {
  private readonly _did: string
  private readonly _keyId: string
  private readonly _keyVault: KeyVault

  /**
   * Construct a DidAuthService based on the given options
   *
   * @param options auth service options
   */
  constructor(options: OptionsWithSeed | OptionsWithKeyVault) {
    const optionsWithKeyVault = AffinidiDidAuthService.convertToKeyVaultOptions(options)

    this._did = optionsWithKeyVault.did
    this._keyId = AffinidiDidAuthService.computeKeyId(optionsWithKeyVault)
    this._keyVault = optionsWithKeyVault.keyVault
  }

  /**
   * Convert the given options to be KeyVault based if needed
   *
   * @param options OptionsWithSeed | OptionsWithKeyVault
   * @return options OptionsWithKeyVault
   */
  private static convertToKeyVaultOptions(options: OptionsWithSeed | OptionsWithKeyVault): OptionsWithKeyVault {
    if (this.isOptionsWithKeyVault(options)) {
      return options
    }

    const { encryptedSeed, encryptionKey } = options
    const keyService = new KeysService(encryptedSeed, encryptionKey)
    const documentService = new DidDocumentService(keyService)

    return {
      did: documentService.getMyDid(),
      keyId: documentService.getKeyId(),
      keyVault: new LocalKeyVault(keyService),
    }
  }

  private static isOptionsWithKeyVault(options: OptionsWithSeed | OptionsWithKeyVault): options is OptionsWithKeyVault {
    return 'did' in options && 'keyVault' in options
  }

  async createDidAuthRequestToken(audienceDid: string, expiresAt?: number): Promise<string> {
    const jwtType = 'DidAuthRequest'
    const NOW = Date.now()

    const jwtObject: any = await JwtService.buildJWTInteractionToken(null, jwtType, null)
    jwtObject.payload.aud = parse(audienceDid).did
    jwtObject.payload.exp = expiresAt > NOW ? expiresAt : NOW + ONE_MINUTE_IN_MS
    jwtObject.payload.createdAt = NOW

    await this.fillSignature(jwtObject)

    return Affinidi.encodeObjectToJWT(jwtObject)
  }

  async createDidAuthResponseToken(
    didAuthRequestTokenStr: string,
    options?: CreateResponseTokenOptions,
  ): Promise<string> {
    const didAuthRequestToken = DidAuthRequestToken.fromString(didAuthRequestTokenStr)
    const maxTokenValidityPeriod = options?.maxTokenValidInMs ?? DEFAULT_MAX_TOKEN_VALID_IN_MS

    // the token expiration date here is checked with the client clock
    // this means if client clock diverges from the server clock;
    //   - if the client clock is ahead of the server; client may allow tokens that are valid for more than 'maxTokenValidityPeriod'
    //   - if the client clock is behind the server; client may not sign tokens that are valid for less then 'maxTokenValidityPeriod'
    if (!didAuthRequestToken.exp || didAuthRequestToken.exp > Date.now() + maxTokenValidityPeriod) {
      throw new Error(
        `request token can not be valid more than max token validity period of ${maxTokenValidityPeriod}ms`,
      )
    }

    const jwtObject = await AffinidiDidAuthService.buildResponseJwtObject(didAuthRequestTokenStr)

    await this.fillSignature(jwtObject)

    return Affinidi.encodeObjectToJWT(jwtObject)
  }

  private static async buildResponseJwtObject(didAuthRequestToken: string) {
    const didAuthRequestTokenDecoded = JwtService.fromJWT(didAuthRequestToken)
    const jwtType = 'DidAuthResponse'
    const NOW = Date.now()

    const jwtObject: any = await JwtService.buildJWTInteractionToken(null, jwtType, didAuthRequestTokenDecoded)
    jwtObject.payload.requestToken = didAuthRequestToken
    jwtObject.payload.aud = parse(didAuthRequestTokenDecoded.payload.iss).did
    jwtObject.payload.exp = undefined
    jwtObject.payload.createdAt = NOW
    return jwtObject
  }

  async createDidAuthResponseTokenThroughCloudWallet(
    didAuthRequestToken: string,
    apiKey: string,
    cloudWalletAccessToken: string,
    environment: string,
  ): Promise<string> {
    const jwtObject = await AffinidiDidAuthService.buildResponseJwtObject(didAuthRequestToken)
    const cloudWalletSignJwt = `https://cloud-wallet-api.${environment}.affinity-project.org/api/v1/utilities/sign-jwt`
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
      Authorization: cloudWalletAccessToken,
    }
    const options = {
      headers,
      method: 'POST',
      body: JSON.stringify({ jwtObject }),
    }
    const response = await fetch(cloudWalletSignJwt, options)
    const jwtSigned = await response.json()

    return Affinidi.encodeObjectToJWT(jwtSigned.jwtObject)
  }

  async verifyDidAuthResponseToken(didAuthResponseTokenStr: string, options: VerifierOptions): Promise<boolean> {
    const affinidiOptions = {
      registryUrl: `https://affinity-registry.${options.environment}.affinity-project.org`,
      apiKey: options.accessApiKey,
    }
    const affinidi = new Affinidi(affinidiOptions)

    const didAuthResponseToken = DidAuthResponseToken.fromString(didAuthResponseTokenStr)
    const didAuthRequestToken = didAuthResponseToken.requestToken

    await affinidi.validateJWT(didAuthRequestToken.toString())
    await affinidi.validateJWT(didAuthResponseToken.toString(), didAuthRequestToken.toString())

    const verifierDid = parse(this._did).did

    if (didAuthRequestToken.iss !== verifierDid) {
      throw new Error('Issuer of request is not valid')
    }

    return true
  }

  /**
   * @deprecated please use LocalExpiringDidAuthResponseToken
   * Legacy token expiration check method that checks any given tokens expiry date
   * @param token
   */
  isTokenExpired(token: string): boolean {
    let isExpired = false
    let tokenExpiration

    try {
      const tokenDecoded = JwtService.fromJWT(token)
      tokenExpiration = tokenDecoded.payload.exp
    } catch (error) {
      throw new Error(`Token can't be decoded`)
    }

    if (!tokenExpiration) {
      throw new Error(`Token doesn't have 'exp' field`)
    }

    tokenExpiration = new Date(tokenExpiration).getTime()
    if (tokenExpiration < Date.now()) {
      isExpired = true
    }

    return isExpired
  }

  private async fillSignature(jwtObject: any) {
    jwtObject.payload.kid = this._keyId
    jwtObject.payload.iss = this._did
    jwtObject.signature = (await this.sign(jwtObject)).toString('hex')
  }

  private async sign(jwtObject: any): Promise<Buffer> {
    const toSign = [
      base64url.encode(JSON.stringify(jwtObject.header)),
      base64url.encode(JSON.stringify(jwtObject.payload)),
    ].join('.')

    const digest = KeysService.sha256(Buffer.from(toSign))

    return this._keyVault.signAsync(digest)
  }

  private static computeKeyId(options: OptionsWithKeyVault): string {
    if (options.keyId) {
      return options.keyId
    }

    const { did } = parse(options.did)
    return `${did}#primary`
  }
}
