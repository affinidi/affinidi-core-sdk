import { KeysService, DidDocumentService, LocalKeyVault, Affinidi } from '@affinidi/common'
import { JwtService } from '@affinidi/tools-common'
import { parse } from 'did-resolver'
import { CreateResponseTokenOptions, VerifierOptions } from '../shared/types'
import Signer, { KeyVault } from '../shared/Signer'
import DidAuthClientService from './DidAuthClientService'
import DidAuthServerService from './DidAuthServerService'
import DidAuthCloudService from './DidAuthCloudService'
import { CloudWalletApiService } from '@affinidi/internal-api-clients'
import { Env, resolveUrl, Service } from '@affinidi/url-resolver'

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
 * Wrapper for DidAuthServerService, DidAuthClientService and DidAuthCloudService
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

  async createDidAuthRequestToken(audienceLongDid: string, expiresAt?: number): Promise<string> {
    const audienceDid = parse(audienceLongDid).did
    const verifierDid = parse(this._did).did
    const serverService = new DidAuthServerService(verifierDid, this.createSigner(), null as any)
    return serverService.createDidAuthRequestToken(audienceDid, expiresAt)
  }

  async createDidAuthResponseToken(
    didAuthRequestTokenStr: string,
    options?: CreateResponseTokenOptions,
    exp?: number
  ): Promise<string> {
    const clientService = new DidAuthClientService(this.createSigner())
    return clientService.createDidAuthResponseToken(didAuthRequestTokenStr, options, exp)
  }

  async createDidAuthResponseTokenThroughCloudWallet(
    didAuthRequestToken: string,
    apiKey: string,
    cloudWalletAccessToken: string,
    environment: Env,
  ): Promise<string> {
    const cloudWallet = new CloudWalletApiService({
      accessApiKey: apiKey,
      cloudWalletUrl: resolveUrl(Service.CLOUD_WALLET_API, environment) + '/api/v1/utilities/sign-jwt',
    })
    const cloudService = new DidAuthCloudService(cloudWallet, cloudWalletAccessToken)
    return cloudService.createDidAuthResponseToken(didAuthRequestToken)
  }

  async verifyDidAuthResponseToken(didAuthResponseTokenStr: string, options: VerifierOptions): Promise<boolean> {
    const affinidiOptions = {
      registryUrl: resolveUrl(Service.REGISTRY, options.environment),
      apiKey: options.accessApiKey,
    }
    const affinidi = new Affinidi(affinidiOptions, null as any)
    const verifierDid = parse(this._did).did
    const serverService = new DidAuthServerService(verifierDid, this.createSigner(), affinidi)
    return serverService.verifyDidAuthResponseToken(didAuthResponseTokenStr)
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
