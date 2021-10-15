import { KeysService, KeyVault, DidDocumentService, LocalKeyVault } from '@affinidi/common'
import { JwtService } from '@affinidi/tools-common'
import { parse } from 'did-resolver'
import { CreateResponseTokenOptions, VerifierOptions } from '../shared/types'
import Signer from '../shared/Signer'
import AffinidiDidAuthClientService from './DidAuthClientService'
import AffinidiDidAuthServerService from './DidAuthServerService'
import AffinidiDidAuthCloudService from './DidAuthCloudService'

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
   * key id used for signing, defaults to `<did>#primary`
   */
  keyId?: string

  /**
   * KeyVault holding signing keys
   */
  keyVault: KeyVault
}

/**
 * @deprecated use AffinidiDidAuthClientService, CloudService or ServerService
 */
export default class AffinidiDidAuthService {
  private readonly _did: string
  private readonly _keyId: string
  private readonly _keyVault: KeyVault

  /**
   * Construct a DidAuthService based on the given options
   *
   * @param options auth service options
   */
  constructor(options: AffinidiDidAuthServiceOptions) {
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
  private static convertToKeyVaultOptions(options: AffinidiDidAuthServiceOptions): OptionsWithKeyVault {
    if (this.isOptionsWithKeyVault(options)) {
      return options
    }

    const { encryptedSeed, encryptionKey } = options
    const keyService = new KeysService(encryptedSeed, encryptionKey)
    const documentService = DidDocumentService.createDidDocumentService(keyService)

    return {
      did: documentService.getMyDid(),
      keyId: documentService.getKeyId(),
      keyVault: new LocalKeyVault(keyService),
    }
  }

  private static isOptionsWithKeyVault(options: AffinidiDidAuthServiceOptions): options is OptionsWithKeyVault {
    return 'did' in options && 'keyVault' in options
  }

  private createSigner() {
    const signerOptions = {
      did: this._did,
      keyId: this._keyId,
      keyVault: this._keyVault,
    }

    return new Signer(signerOptions)
  }

  async createDidAuthRequestToken(audienceDid: string, expiresAt?: number): Promise<string> {
    const serverService = new AffinidiDidAuthServerService(this._did, this.createSigner())
    return serverService.createDidAuthRequestToken(audienceDid, expiresAt)
  }

  async createDidAuthResponseToken(
    didAuthRequestTokenStr: string,
    options?: CreateResponseTokenOptions,
  ): Promise<string> {
    const clientService = new AffinidiDidAuthClientService(this.createSigner())
    return clientService.createDidAuthResponseToken(didAuthRequestTokenStr, options)
  }

  async createDidAuthResponseTokenThroughCloudWallet(
    didAuthRequestToken: string,
    apiKey: string,
    cloudWalletAccessToken: string,
    environment: string,
  ): Promise<string> {
    const cloudService = new AffinidiDidAuthCloudService()
    return cloudService.createDidAuthResponseTokenThroughCloudWallet(
      didAuthRequestToken,
      apiKey,
      cloudWalletAccessToken,
      environment,
    )
  }

  async verifyDidAuthResponseToken(didAuthResponseTokenStr: string, options: VerifierOptions): Promise<boolean> {
    const serverService = new AffinidiDidAuthServerService(this._did, this.createSigner())
    return serverService.verifyDidAuthResponseToken(didAuthResponseTokenStr, options)
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

  private static computeKeyId(options: OptionsWithKeyVault): string {
    if (options.keyId) {
      return options.keyId
    }

    const { did } = parse(options.did)
    return `${did}#primary`
  }
}
