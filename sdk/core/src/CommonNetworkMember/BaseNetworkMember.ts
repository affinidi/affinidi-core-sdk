import { DidDocumentService, JwtService, KeysService, Affinity } from '@affinidi/common'
import { fetch } from '@affinidi/platform-fetch'
import { DidAuthClientService, Signer } from '@affinidi/affinidi-did-auth-lib'
import {
  IssuerApiService,
  RegistryApiService,
  RevocationApiService,
  VerifierApiService,
} from '@affinidi/internal-api-clients'
import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { profile } from '@affinidi/tools-common'
import {
  buildVCV1Skeleton,
  buildVCV1Unsigned,
  buildVPV1Unsigned,
  VCV1,
  VCV1SubjectBaseMA,
  VCV1Unsigned,
  VPV1,
  VPV1Unsigned,
} from '@affinidi/vc-common'
import { parse } from 'did-resolver'

import { extractSDKVersion, isW3cCredential } from '../_helpers'
import { DEFAULT_DID_METHOD, ELEM_DID_METHOD, SUPPORTED_DID_METHODS } from '../_defaultConfig'

import {
  ClaimMetadata,
  SignedCredential,
  SignCredentialOptionalInput,
  OfferedCredential,
  CredentialRequirement,
  JwtOptions,
  KeyParams,
  KeyAlgorithmType,
  KeyOptions,
  DidMethod,
  StaticValidateOptions,
} from '../dto/shared.dto'

import {
  CredentialShareResponseOutput,
  CredentialOfferResponseOutput,
  PresentationValidationOutput,
} from '../dto/verifier.dto'

import { DidAuthAdapter } from '../shared/DidAuthAdapter'
import { ParsedOptions } from '../shared/getOptionsFromEnvironment'
import { IPlatformCryptographyTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
import SdkErrorFromCode from '../shared/SdkErrorFromCode'

import { anchorDid } from '../services/anchoringHandler'
import HolderService from '../services/HolderService'
import KeyManagementService from '../services/KeyManagementService'
import { register } from '../services/registeringHandler'
import WalletStorageService from '../services/WalletStorageService'

import { getBasicOptionsFromEnvironment } from '../shared/getOptionsFromEnvironment'

import { Util } from './Util'

export const createKeyManagementService = ({ basicOptions, accessApiKey, otherOptions }: ParsedOptions) => {
  return new KeyManagementService({ ...basicOptions, accessApiKey, tenantToken: otherOptions.tenantToken })
}

export type StaticDependencies = {
  platformCryptographyTools: IPlatformCryptographyTools
  eventComponent: EventComponent
}

export type ConstructorUserData = {
  didDocument?: any
  did: string
  didDocumentKeyId: string
  encryptedSeed: string
  password: string
  accountNumber?: number
}

@profile()
export abstract class BaseNetworkMember {
  readonly didDocument?: any
  readonly accountNumber?: number
  private readonly _did: string
  private readonly _encryptedSeed: string
  private readonly _password: string
  protected readonly _walletStorageService: WalletStorageService
  private readonly _holderService: HolderService
  private readonly _issuerApiService
  private readonly _verifierApiService
  private readonly _registryApiService
  private readonly _revocationApiService
  protected readonly _keyManagementService
  protected readonly _affinity
  protected readonly _options
  private readonly _didDocumentKeyId: string
  protected readonly _component: EventComponent
  protected readonly _platformCryptographyTools

  constructor(
    { didDocument, did, didDocumentKeyId, encryptedSeed, password, accountNumber }: ConstructorUserData,
    { platformCryptographyTools, eventComponent }: StaticDependencies,
    options: ParsedOptions,
  ) {
    const isKeyManagerExternal = !!options.otherOptions.keyManager
    const isSeedLocal = did && didDocumentKeyId && encryptedSeed && password
    if (!did || !didDocumentKeyId || (!isSeedLocal && !isKeyManagerExternal)) {
      // TODO: implement appropriate error wrapper
      throw new Error(
        '`did`, `didDocumentKeyId`, `encryptedSeed` and `password` OR `did`, `didDocumentKeyId`, `keyManager` must be provided!',
      )
    }

    const { accessApiKey, basicOptions, storageRegion } = options
    const { issuerUrl, revocationUrl, metricsUrl, registryUrl, verifierUrl, affinidiVaultUrl } = basicOptions
    const keysService = new KeysService(encryptedSeed, password, accountNumber)
    this._affinity = new Affinity(
      {
        apiKey: accessApiKey,
        registryUrl: registryUrl,
        metricsUrl: metricsUrl,
        component: eventComponent,
        resolveLegacyElemLocally: options.otherOptions?.resolveLocallyElemMethod,
        resolveKeyLocally: options.otherOptions?.resolveKeyLocally,
        beforeDocumentLoader: options.otherOptions?.beforeDocumentLoader,
        keyManager: options.otherOptions?.keyManager,
        keysService: keysService,
      },
      platformCryptographyTools,
    )
    const signer = new Signer({ did, keyId: didDocumentKeyId, keyVault: this._affinity })
    const didAuthService = new DidAuthClientService(signer)
    const didAuthAdapter = new DidAuthAdapter(did, didAuthService)

    const sdkVersion = extractSDKVersion()

    this._registryApiService = new RegistryApiService({ registryUrl, accessApiKey, sdkVersion })
    this._issuerApiService = new IssuerApiService({ issuerUrl, accessApiKey, sdkVersion })
    this._verifierApiService = new VerifierApiService({ verifierUrl, accessApiKey, sdkVersion })
    this._keyManagementService = createKeyManagementService(options)
    this._revocationApiService = new RevocationApiService({
      revocationUrl,
      accessApiKey,
      sdkVersion,
      didAuthAdapter,
    })
    this._walletStorageService = new WalletStorageService(this._affinity.getKeyManager(), {
      affinidiVaultUrl,
      accessApiKey,
      storageRegion,
      didAuthAdapter,
    })
    this._holderService = new HolderService(
      {
        registryUrl,
        metricsUrl,
        accessApiKey,
        keyManager: options.otherOptions?.keyManager,
        keysService: keysService,
      },
      platformCryptographyTools,
      eventComponent,
      options.otherOptions?.resolveLocallyElemMethod,
      options.otherOptions?.beforeDocumentLoader,
    )

    this._options = options
    this._component = eventComponent
    this._encryptedSeed = encryptedSeed
    this._password = password
    this._did = did
    this._didDocumentKeyId = didDocumentKeyId
    this._platformCryptographyTools = platformCryptographyTools

    this.accountNumber = accountNumber
    this.didDocument = didDocument
  }

  /**
   * @description Returns user's encrypted seed
   * @returns encrypted seed
   */
  get encryptedSeed(): string {
    return this._encryptedSeed
  }

  /**
   * @description Returns user's password
   * @returns encrypted seed
   */
  get password(): string {
    return this._password
  }

  /**
   * @description Creates DID and anchors it
   * 1. generate seed/keys
   * 2. build DID document
   * 3. sign DID document
   * 4. store DID document in IPFS
   * 5. anchor DID with DID document ID from IPFS
   * @param dependencies
   * @param password - encryption key which will be used to encrypt randomly created seed/keys pair
   * @param options - optional parameter { registryUrl: 'https://affinity-registry.apse1.dev.affinidi.io' }
   * @param keyOptions
   * @returns
   *
   * did - hash from public key (your decentralized ID)
   *
   * encryptedSeed - seed is encrypted by provided password. Seed - it's a source to derive your keys
   */
  protected static async _register(
    dependencies: StaticDependencies,
    options: ParsedOptions,
    password: string,
    keyOptions?: KeyOptions,
  ) {
    const {
      basicOptions: { registryUrl },
      accessApiKey,
    } = options
    const api = new RegistryApiService({ registryUrl, accessApiKey, sdkVersion: extractSDKVersion() })
    const didMethod = options.otherOptions.didMethod || DEFAULT_DID_METHOD
    return register(
      api,
      didMethod,
      dependencies.platformCryptographyTools,
      password,
      keyOptions,
      options.origin,
      options.otherOptions.skipAnchoringForElemMethod,
      options.otherOptions.webDomain,
    )
  }

  protected static async _anchorDid(
    encryptedSeed: string,
    password: string,
    didDocument: any,
    nonce: number,
    {
      basicOptions: { registryUrl },
      accessApiKey,
      origin,
      otherOptions: { skipAnchoringForElemMethod },
    }: ParsedOptions,
  ) {
    const registry = new RegistryApiService({ registryUrl, accessApiKey, sdkVersion: extractSDKVersion() })
    const keysService = new KeysService(encryptedSeed, password)
    const { seed, didMethod } = keysService.decryptSeed()
    const didService = DidDocumentService.createDidDocumentService(keysService)
    return didMethod == ELEM_DID_METHOD && skipAnchoringForElemMethod
      ? { did: didService.getMyDid() }
      : anchorDid({
          registry,
          anchoredDidElem: false,
          did: didService.getMyDid(),
          didMethod: didMethod as DidMethod,
          keysService,
          nonce,
          additionalJoloParams: {
            didDocument,
            seedHex: seed.toString('hex'),
          },
          origin: origin || '',
        })
  }

  /**
   * @description Resolves DID
   * @param did - decentralized ID
   * @returns DID document
   */
  async resolveDid(did: string) {
    await ParametersValidator.validate([{ isArray: false, type: 'did', isRequired: true, value: did }])

    return this._affinity.resolveDid(did)
  }

  /**
   * @description Update DidDocument , supporting only jolo method at this point
   * @param didDocument - updated did document
   * @returns void
   */
  async updateDidDocument(didDocument: any) {
    // TODO: validate didDocument structure
    await ParametersValidator.validate([{ isArray: false, type: 'object', isRequired: true, value: didDocument }])

    const did = didDocument.id
    const isJoloMethod = did.startsWith('did:jolo')
    if (!isJoloMethod) {
      throw new SdkErrorFromCode('COR-20', { did })
    }

    const instanceDid = this.did
    if (instanceDid !== did) {
      throw new SdkErrorFromCode('COR-21', { did, instanceDid })
    }

    const ethereumPublicKeyHex = await this._affinity.getAnchorTransactionPublicKey()

    const {
      body: { transactionCount },
    } = await this._registryApiService.transactionCount({ ethereumPublicKeyHex })

    const nonce = transactionCount

    await BaseNetworkMember._anchorDid(this._encryptedSeed, this._password, didDocument, nonce, this._options)
  }

  getShareCredential(
    credentialShareRequestToken: string,
    options: { credentials: SignedCredential[] },
  ): SignedCredential[] {
    const { credentials } = options
    const credentialShareRequest = Util.fromJWT(credentialShareRequestToken)
    const types = this.getCredentialTypes(credentialShareRequest)

    const filteredCredentials = credentials.filter((cred: SignedCredential) => {
      return types.includes(cred.type[1])
    })

    return filteredCredentials
  }

  protected static _validateKeys(keyParams: KeyParams) {
    const { encryptedSeed, password } = keyParams

    let didMethod: DidMethod
    try {
      const keysService = new KeysService(encryptedSeed, password)
      didMethod = keysService.decryptSeed().didMethod as DidMethod
    } catch (error) {
      throw new SdkErrorFromCode('COR-24', {}, error)
    }

    if (!SUPPORTED_DID_METHODS.includes(didMethod)) {
      const supportedDidMethods = SUPPORTED_DID_METHODS.join(', ')
      throw new SdkErrorFromCode('COR-25', { didMethod, supportedDidMethods })
    }
  }

  /* istanbul ignore next: protected method */
  protected async saveEncryptedCredentials(data: any, storageRegion?: string): Promise<any[]> {
    return this._walletStorageService.saveCredentials(data, storageRegion)
  }

  /**
   * @description Creates JWT of credential offer request
   * @param offeredCredentials - array of credentials to be offered
   * @param options - optional, JwtOptions containing:
   *
   *   audienceDid (string) - audience of generated token
   *
   *   expiresAt (isoString) - expire date-time of generated token
   *
   *   nonce (string) - nonce/jti of generated token
   *
   *   callbackUrl (string)
   * @returns JWT
   */
  async generateCredentialOfferRequestToken(
    offeredCredentials: OfferedCredential[],
    options?: JwtOptions,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: true, type: OfferedCredential, isRequired: true, value: offeredCredentials },
      { isArray: false, type: JwtOptions, isRequired: false, value: options },
    ])

    const { audienceDid, expiresAt, nonce, callbackUrl } = options ?? {}
    const params = {
      offeredCredentials,
      audienceDid,
      expiresAt,
      nonce,
      callbackUrl,
    }

    const {
      body: { credentialOffer },
    } = await this._issuerApiService.buildCredentialOffer(params)

    const signedObject = await this._affinity.signJWTObject(credentialOffer as any, this.didDocumentKeyId)

    return JwtService.encodeObjectToJWT(signedObject)
  }

  async generateDidAuthRequest(options?: JwtOptions): Promise<string> {
    await ParametersValidator.validate([{ isArray: false, type: JwtOptions, isRequired: false, value: options }])

    return this.generateCredentialShareRequestToken([], null, options)
  }

  /**
   * @description Creates JWT of credential share request
   * @param credentialRequirements - array of credential requirements with credential types
   * @param issuerDid - DID of the issuer
   * @param options - optional, JwtOptions containing:
   *
   *   audienceDid (string) - audience of generated token
   *
   *   expiresAt (isoString) - expire date-time of generated token
   *
   *   nonce (number) - nonce/jti of generated token
   * @returns JWT
   */
  async generateCredentialShareRequestToken(
    credentialRequirements: CredentialRequirement[],
    issuerDid: string = undefined,
    options?: JwtOptions,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: true, type: CredentialRequirement, isRequired: true, value: credentialRequirements },
      { isArray: false, type: 'did', isRequired: false, value: issuerDid },
      { isArray: false, type: JwtOptions, isRequired: false, value: options },
    ])

    const { audienceDid, expiresAt, nonce, callbackUrl } = options ?? {}
    const params = {
      credentialRequirements,
      issuerDid,
      audienceDid,
      expiresAt,
      nonce,
      callbackUrl,
    }

    const {
      body: { credentialShareRequest },
    } = await this._verifierApiService.buildCredentialRequest(params)

    const signedObject = await this._affinity.signJWTObject(credentialShareRequest as any, this.didDocumentKeyId)

    return JwtService.encodeObjectToJWT(signedObject)
  }

  /**
   * @description Creates JWT of credential offer response
   * @param credentialOfferToken - JWT with offered credentials
   * @returns JWT
   */
  async createCredentialOfferResponseToken(credentialOfferToken: string): Promise<string> {
    await ParametersValidator.validate([{ isArray: false, type: 'jwt', isRequired: true, value: credentialOfferToken }])

    const credentialOfferResponse = await this._holderService.buildCredentialOfferResponse(credentialOfferToken)

    const signedObject = await this._affinity.signJWTObject(credentialOfferResponse, this.didDocumentKeyId)

    return JwtService.encodeObjectToJWT(signedObject)
  }

  async createDidAuthResponse(didAuthRequestToken: string, expiresAt?: string): Promise<string> {
    await ParametersValidator.validate([{ isArray: false, type: 'jwt', isRequired: true, value: didAuthRequestToken }])

    return this.createCredentialShareResponseToken(didAuthRequestToken, [], expiresAt)
  }

  // NOTE: to be removed after support of legacy credentials is dropped
  /* istanbul ignore next: private method */
  private _validateSignedCredentialsSupportedStructures(credentials: SignedCredential[]) {
    const errors: string[] = []

    for (const credential of credentials) {
      const hasIssuedDate = typeof credential.issued !== 'undefined'
      const hasIssuanceDate = typeof credential.issuanceDate !== 'undefined'
      const isLegacyCredential = typeof credential.claim !== 'undefined'
      const hasCredentialSubject = typeof credential.credentialSubject !== 'undefined'

      if (isLegacyCredential) {
        if (!hasIssuedDate) {
          const error = 'Parameter "issued" is missing for SignedCredential'

          errors.push(error)
        }

        continue
      }

      if (!hasIssuanceDate) {
        const error = 'Parameter "issuanceDate" is missing for SignedCredential'

        errors.push(error)
      }

      if (!hasCredentialSubject) {
        const error = 'Parameter "credentialSubject" is missing for SignedCredential'

        errors.push(error)
      }
    }

    const areCredentialsValid = errors.length === 0

    if (!areCredentialsValid) {
      throw new SdkErrorFromCode('COR-1', { errors, credentials })
    }
  }

  /**
   * @description Creates JWT of credential share response
   * @param credentialShareRequestToken - JWT with the requested VCs
   * @param suppliedCredentials - array of signed credentials
   * @param expiresAt (isoString) - optional, expire date-time of generated token
   * @returns JWT
   */
  async createCredentialShareResponseToken(
    credentialShareRequestToken: string,
    suppliedCredentials: SignedCredential[],
    expiresAt?: string,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'jwt', isRequired: true, value: credentialShareRequestToken },
      { isArray: true, type: SignedCredential, isRequired: true, value: suppliedCredentials },
      { isArray: false, type: 'string', isRequired: false, value: expiresAt },
    ])

    this._validateSignedCredentialsSupportedStructures(suppliedCredentials)
    let tokenDecoded: any
    try {
      tokenDecoded = JwtService.fromJWT(credentialShareRequestToken)
    } catch (error) {
      throw new Error(`Token can't be decoded`)
    }

    const { exp } = tokenDecoded.payload
    if (!exp || (expiresAt && exp > new Date(expiresAt).getTime())) {
      throw new Error('expiresAt of response token should be greater than expiresAt of request token.')
    }

    const credentialResponse = await this._holderService.buildCredentialResponse(
      credentialShareRequestToken,
      suppliedCredentials,
      expiresAt,
    )

    const signedObject = await this._affinity.signJWTObject(credentialResponse, this.didDocumentKeyId)

    return JwtService.encodeObjectToJWT(signedObject)
  }

  /**
   * @description Returns user's DID
   * @returns DID
   */
  get did() {
    return this._did
  }

  /**
   * @description Returns user's DID document key ID
   * @returns key ID
   */
  get didDocumentKeyId() {
    return this._didDocumentKeyId
  }

  /**
   * @description Returns credential types credential request token
   * @param credentialRequest - object with credential requirements
   * @returns array of credential types
   */
  getCredentialTypes(credentialRequest: any): any[] {
    // await ParametersValidator.validateSync(
    //   [
    //     { isArray: false, type: 'object', isRequired: true, value: credentialRequest }
    //   ]
    // )

    const { interactionToken } = credentialRequest.payload
    const { credentialRequirements } = interactionToken
    const credentialTypes = []

    for (const credential of credentialRequirements) {
      if (isW3cCredential(credential)) {
        const type = credential.type[1] // seems its always next structure type: ['Credential', 'ProofOfEmailCredential|....']
        credentialTypes.push(type)
      }
    }

    return credentialTypes
  }

  async buildRevocationListStatus(unsignedCredential: any): Promise<any> {
    const credentialId = unsignedCredential.id
    const subjectDid = unsignedCredential.holder?.id

    const {
      body: { credentialStatus, revocationListCredential },
    } = await this._revocationApiService.buildRevocationListStatus({
      credentialId,
      subjectDid,
    })

    const revokableUnsignedCredential = Object.assign({}, unsignedCredential, { credentialStatus })
    revokableUnsignedCredential['@context'].push('https://w3id.org/vc-revocation-list-2020/v1')

    if (revocationListCredential) {
      const revocationSignedListCredential = await this._affinity.signCredential(revocationListCredential as any)
      revocationSignedListCredential.issuanceDate = new Date().toISOString()

      await this._revocationApiService.publishRevocationListCredential(revocationSignedListCredential)
    }

    return revokableUnsignedCredential
  }

  async revokeCredential(credentialId: string, revocationReason: string): Promise<void> {
    const {
      body: { revocationListCredential },
    } = await this._revocationApiService.revokeCredential({ id: credentialId, revocationReason })

    const revocationSignedListCredential = await this._affinity.signCredential(revocationListCredential)
    revocationSignedListCredential.issuanceDate = new Date().toISOString()

    await this._revocationApiService.publishRevocationListCredential(revocationSignedListCredential)
  }

  /**
   * @description Signs credentials
   * @param credentialOfferResponseToken - credential offer response JWT
   * @param credentialParams - params for credentials
   * @returns array of SignedCredential
   */
  async signCredentials(credentialOfferResponseToken: string, credentialParams: VCV1Unsigned[]): Promise<VCV1[]> {
    await ParametersValidator.validate([
      { isArray: false, type: 'jwt', isRequired: true, value: credentialOfferResponseToken },
      { isArray: true, type: 'object', isRequired: true, value: credentialParams },
    ])

    const signedCredentials = []
    const credentialOfferResponse = Util.fromJWT(credentialOfferResponseToken)
    const { selectedCredentials } = credentialOfferResponse.payload.interactionToken

    const credentialTypesThatCanBeSigned: string[] = selectedCredentials.map(({ type }: any) => type)

    for (const unsignedCredential of credentialParams) {
      const isCredentialOffered = unsignedCredential.type.some((type) => credentialTypesThatCanBeSigned.includes(type))

      if (!isCredentialOffered) {
        continue
      }

      const { credentialSubject, type, '@context': context, expirationDate } = unsignedCredential

      const credentialMetadata = { type, context }
      const signedCredential = await this.signCredential(
        credentialSubject,
        credentialMetadata,
        { credentialOfferResponseToken },
        expirationDate,
      )

      signedCredentials.push(signedCredential)
    }

    if (signedCredentials.length === 0) {
      throw new SdkErrorFromCode('COR-22', { credentialOfferResponseToken, credentialParams })
    }

    return signedCredentials
  }

  async signUnsignedCredential(unsignedCredential: VCV1Unsigned, keyType?: KeyAlgorithmType) {
    return this._affinity.signCredential(unsignedCredential, keyType)
  }

  /**
   * @description Signs credential
   * @param claim - data which should be present in VC according to VC schema,
   * e.g. const claim = { ageOver: 18 }
   * @param claimMetadata - schema of credential
   * @param signCredentialOptionalInput - object with optional
   * credential offer response JWT and requester DID
   * @param expiresAt - optional, date-time when VC is to be expired
   * @returns signed credential object
   */
  async signCredential<Subject extends VCV1SubjectBaseMA>(
    credentialSubject: Subject,
    claimMetadata: ClaimMetadata,
    signCredentialOptionalInput: SignCredentialOptionalInput,
    expiresAt?: string,
    keyType?: KeyAlgorithmType,
  ): Promise<VCV1> {
    await ParametersValidator.validate([
      { isArray: false, type: 'object', isRequired: true, value: credentialSubject },
      { isArray: false, type: ClaimMetadata, isRequired: true, value: claimMetadata },
      { isArray: false, type: SignCredentialOptionalInput, isRequired: true, value: signCredentialOptionalInput },
      { isArray: false, type: 'isoString', isRequired: false, value: expiresAt },
    ])

    if (typeof expiresAt !== 'undefined' && new Date().getTime() > new Date(expiresAt).getTime()) {
      throw new Error('Expiry date should be greater than current date')
    }

    let { requesterDid } = signCredentialOptionalInput
    const { credentialOfferResponseToken } = signCredentialOptionalInput

    /* istanbul ignore else: code simplicity */
    if (credentialOfferResponseToken) {
      const credentialOfferResponse = JwtService.fromJWT(credentialOfferResponseToken)
      requesterDid = credentialOfferResponse.payload.iss
    }

    const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton({
        id: `claimId:${randomBytes(8).toString('hex')}`,
        credentialSubject,
        holder: { id: parse(requesterDid).did },
        type: claimMetadata.type,
        context: claimMetadata.context as any,
      }),
      issuanceDate: new Date().toISOString(),
      expirationDate: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    })

    return this.signUnsignedCredential(unsignedCredential, keyType)
  }

  async validateCredential(signedCredential: SignedCredential, holderKey?: string, didDocument?: any) {
    return this._affinity.validateCredential(signedCredential, holderKey, didDocument)
  }

  static async validateCredential(
    platformCryptographyTools: IPlatformCryptographyTools,
    options: StaticValidateOptions,
    signedCredential: SignedCredential,
    holderKey?: string,
    didDocument?: any,
  ) {
    const { accessApiKey, resolveLegacyElemLocally, resolveKeyLocally } = options
    const { registryUrl } = getBasicOptionsFromEnvironment({ registryUrl: options.registryUrl, env: 'prod' })
    const affinity = new Affinity(
      {
        apiKey: accessApiKey,
        registryUrl,
        resolveLegacyElemLocally,
        resolveKeyLocally,
      },
      platformCryptographyTools,
    )

    return affinity.validateCredential(signedCredential, holderKey, didDocument)
  }

  async verifyDidAuthResponse(
    didAuthResponseToken: string,
    didAuthRequestToken?: string,
  ): Promise<CredentialShareResponseOutput> {
    await ParametersValidator.validate([
      { isArray: false, type: 'jwt', isRequired: true, value: didAuthResponseToken },
      { isArray: false, type: 'jwt', isRequired: false, value: didAuthRequestToken },
    ])

    return this.verifyCredentialShareResponseToken(didAuthResponseToken, didAuthRequestToken)
  }

  /**
   * @description Validates response token, verifies signature on provided VCs
   * and expiration date of VCs
   * @param credentialShareResponseToken - optional, used if need to check
   * response against request (when request have constrains)
   * @param credentialShareRequestToken - JWT with requested VC
   * @param shouldOwn - optional (boolean), can be passed as true,
   * when needed to verify if holder is a subject of VC
   * @returns { isValid, did, jti, suppliedCredentials, errors }
   *
   * isValid - boolean, result of the verification
   *
   * did - DID of the issuer
   *
   * jti - unique identifier for the JWT
   *
   * suppliedCredentials - array of supplied credentials
   */
  async verifyCredentialShareResponseToken(
    credentialShareResponseToken: string,
    credentialShareRequest?: any,
    shouldOwn: boolean = true,
  ): Promise<CredentialShareResponseOutput> {
    let credentialShareRequestToken
    const isFunction = credentialShareRequest instanceof Function
    if (!isFunction) {
      credentialShareRequestToken = credentialShareRequest
    }

    const paramsToValidate = [
      { isArray: false, type: 'jwt', isRequired: true, value: credentialShareResponseToken },
      { isArray: false, type: 'jwt', isRequired: false, value: credentialShareRequestToken },
      { isArray: false, type: 'boolean', isRequired: false, value: shouldOwn },
    ]

    await ParametersValidator.validate(paramsToValidate)

    if (isFunction) {
      const credentialShareResponse = Util.fromJWT(credentialShareResponseToken)
      const requestNonce: string = credentialShareResponse.payload.jti
      credentialShareRequestToken = await credentialShareRequest(requestNonce)

      if (!credentialShareRequestToken) {
        throw new SdkErrorFromCode('COR-15', { credentialShareRequestToken })
      }

      try {
        Util.fromJWT(credentialShareRequestToken)
      } catch (error) {
        throw new SdkErrorFromCode('COR-15', { credentialShareRequestToken })
      }
    }

    const response = await this._holderService.verifyCredentialShareResponse(
      credentialShareResponseToken,
      credentialShareRequestToken,
      shouldOwn,
    )

    const { isValid, did, jti, suppliedCredentials, errors } = response

    return { isValid, did, nonce: jti, suppliedCredentials, errors }
  }

  /**
   * @description Validates offer response against offer request
   * @param credentialOfferResponseToken - JWT with credential offer response
   * @param credentialOfferRequestToken - JWT with credential offer request
   * @returns { isValid, did, jti, selectedCredentials, errors }
   *
   * isValid - boolean, result of the verification
   *
   * did - DID of the issuer
   *
   * jti - unique identifier for the JWT
   *
   * selectedCredentials - array of selected credentials
   */
  async verifyCredentialOfferResponseToken(
    credentialOfferResponseToken: string,
    credentialOfferRequestToken?: string,
  ): Promise<CredentialOfferResponseOutput> {
    await ParametersValidator.validate([
      { isArray: false, type: 'jwt', isRequired: true, value: credentialOfferResponseToken },
      { isArray: false, type: 'jwt', isRequired: false, value: credentialOfferRequestToken },
    ])

    const params = { credentialOfferResponseToken, credentialOfferRequestToken }

    const res = await this._issuerApiService.verifyCredentialOfferResponse(params)

    const { isValid, issuer, jti, selectedCredentials, errors } = res.body

    const did = DidDocumentService.keyIdToDid(issuer)

    return { isValid, did, nonce: jti, selectedCredentials, errors }
  }

  /*
   * W3C-spec VP methods
   */

  /**
   * @description Creates JWT of presentation challenge
   * @param credentialRequirements - array of credential requirements with credential types
   * @param issuerDid - DID of the issuer
   * @param options - optional, JwtOptions containing:
   *
   *   audienceDid (string) - audience of generated token
   *
   *   expiresAt (isoString) - expire date-time of generated token
   *
   *   nonce (number) - nonce/jti of generated token

   *   callbackUrl (string)
   * @returns JWT
   */
  async generatePresentationChallenge(
    credentialRequirements: CredentialRequirement[],
    issuerDid: string = undefined,
    options?: JwtOptions,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: true, type: CredentialRequirement, isRequired: true, value: credentialRequirements },
      { isArray: false, type: 'did', isRequired: false, value: issuerDid },
      { isArray: false, type: JwtOptions, isRequired: false, value: options },
    ])

    const { audienceDid, expiresAt, nonce, callbackUrl } = options ?? {}
    const params = {
      credentialRequirements,
      issuerDid,
      audienceDid,
      expiresAt,
      nonce,
      callbackUrl,
    }

    const {
      body: { credentialShareRequest },
    } = await this._verifierApiService.buildCredentialRequest(params)

    const signedObject = await this._affinity.signJWTObject(credentialShareRequest as any)

    return JwtService.encodeObjectToJWT(signedObject)
  }

  async signUnsignedPresentation(vp: VPV1Unsigned, challenge: string, domain: string) {
    return this._affinity.signPresentation({
      vp,
      purpose: {
        challenge,
        domain,
      },
    })
  }

  /**
   * @description Creates VP from VP challenge and credentials
   * @param challenge - challenge with the requested VCs
   * @param vcs - array of signed credentials
   * @returns VPV1
   */
  async createPresentationFromChallenge(challenge: string, vcs: VCV1[], domain: string): Promise<VPV1> {
    await ParametersValidator.validate([
      { isArray: false, type: 'jwt', isRequired: true, value: challenge },
      { isArray: true, type: 'VCV1', isRequired: true, value: vcs },
    ])

    const requestedTypes = this.getCredentialTypes(Util.fromJWT(challenge))

    return this.signUnsignedPresentation(
      buildVPV1Unsigned({
        id: `presentationId:${randomBytes(8).toString('hex')}`,
        vcs: vcs.filter((vc) => requestedTypes.includes(vc.type[1])),
        holder: { id: this.did },
      }),
      challenge,
      domain,
    )
  }

  /**
   * @description Validate status of provided VC
   * @param credential - the W3c VC
   * @returns { verified, error }
   *
   * verified - boolean, result of the verification
   *
   * error - validation error
   */
  async checkCredentialStatus(credential: any): Promise<{ verified: boolean; error?: string }> {
    const result = await this._affinity.checkCredentialStatus(credential)
    return result
  }

  /**
   * @description Validates a VP, and the contained VCs
   * @param vp - the presentation to be validated
   * when needed to verify if holder is a subject of VC
   * @param challenge (optional) - challenge from VP requester to
   * be compared with challenge in presentation
   * @returns { isValid, did, challenge, suppliedPresentation, errors }
   *
   * isValid - boolean, result of the verification
   *
   * did - DID of the VP issuer (holder of the shared VCs)
   *
   * challenge - unique identifier for the presentation.
   * You are responsible for checking this to protect against replay attacks
   *
   * suppliedPresentation - the validated presentation
   *
   * errors - array of validation errors
   */
  async verifyPresentation(vp: unknown, challenge?: string, didDocuments?: any): Promise<PresentationValidationOutput> {
    const response = await this._affinity.validatePresentation(vp, null, challenge, didDocuments)

    if (response.result === true) {
      const vpChallenge = response.data.proof.challenge
      // After validating the VP we need to validate the VP's challenge token
      // to ensure that it was issued from the correct DID and that it hasn't expired.
      try {
        Util.isJWT(vpChallenge) && (await this._holderService.verifyPresentationChallenge(vpChallenge, this.did))
      } catch (error) {
        return {
          isValid: false,
          suppliedPresentation: response.data,
          errors: [error],
        }
      }

      return {
        isValid: true,
        did: response.data.holder.id,
        challenge: vpChallenge,
        suppliedPresentation: response.data,
      }
    } else {
      return {
        isValid: false,
        suppliedPresentation: vp,
        errors: [response.error],
      }
    }
  }

  static async verifyPresentation(
    platformCryptographyTools: IPlatformCryptographyTools,
    options: StaticValidateOptions,
    vp: unknown,
    verifierDid?: string,
    challenge?: string,
    didDocuments?: any,
  ): Promise<PresentationValidationOutput> {
    const { accessApiKey, resolveLegacyElemLocally, resolveKeyLocally } = options
    const { registryUrl } = getBasicOptionsFromEnvironment({ registryUrl: options.registryUrl, env: 'prod' })
    const affinity = new Affinity(
      {
        apiKey: accessApiKey,
        registryUrl,
        resolveLegacyElemLocally,
        resolveKeyLocally,
      },
      platformCryptographyTools,
    )

    const response = await affinity.validatePresentation(vp, null, challenge, didDocuments)

    if (response.result === true) {
      const vpChallenge = response.data.proof.challenge

      if (verifierDid) {
        // After validating the VP we need to validate the VP's challenge token
        // to ensure that it was issued from the correct DID and that it hasn't expired.
        try {
          Util.isJWT(vpChallenge) &&
            (await HolderService.verifyPresentationChallenge(affinity, vpChallenge, verifierDid))
        } catch (error) {
          return {
            isValid: false,
            suppliedPresentation: response.data,
            errors: [error],
          }
        }
      }

      return {
        isValid: true,
        did: response.data.holder.id,
        challenge: vpChallenge,
        suppliedPresentation: response.data,
      }
    } else {
      return {
        isValid: false,
        suppliedPresentation: vp,
        errors: [response.error],
      }
    }
  }

  /**
   * Wrapper for Affinity class validateJWT method.
   * @param token
   */
  async validateJWT(token: string): Promise<void> {
    return this._affinity.validateJWT(token)
  }

  /**
   * @description Save's encrypted VCs in Affinity Guardian Wallet
   * 1. encrypt VCs
   * 2. store encrypted VCs in Affinity Guardian Wallet
   * @param data - array of VCs
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   * @returns array of ids for corelated records
   */
  async saveCredentials(data: any[], storageRegion?: string): Promise<any> {
    const result = await this._walletStorageService.saveCredentials(data, storageRegion)
    // NOTE: what if creds actually were not saved in the vault?
    //       follow up with Isaak/Dustin on this - should we parse the response
    //       to define if we need to send the metrics
    return result
  }

  /**
   * @description Retrieve only the credential
   * @param credentialId (string) - id for the VC in vault
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   * @returns a single VC
   */
  async getCredentialById(credentialId: string, storageRegion?: string): Promise<any> {
    return this._walletStorageService.getCredentialById(credentialId, storageRegion)
  }

  /**
   * @description Retrieve all credentials
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   * @returns  array of VC
   */
  async getAllCredentials(storageRegion?: string): Promise<any[]> {
    return this._walletStorageService.getAllCredentials(storageRegion)
  }

  /**
   * @description Retrieve only the credential
   * @param token (string) - specify credential share request token to filter
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   * @returns  array of VCs
   */
  async getCredentialsByShareToken(token: string, storageRegion?: string): Promise<any[]> {
    return this._walletStorageService.getCredentialsByShareToken(token, storageRegion)
  }

  /**
   * @description Delete credential by id
   * @param credentialId (string) - credential to remove
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   */
  async deleteCredentialById(credentialId: string, storageRegion?: string): Promise<void> {
    return this._walletStorageService.deleteCredentialById(credentialId, storageRegion)
  }

  /**
   * @description Deletes all credentials from the wallet
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   */
  async deleteAllCredentials(storageRegion?: string): Promise<void> {
    return this._walletStorageService.deleteAllCredentials(storageRegion)
  }

  /**
   * @description Searches all of VCs for matches for the given credentialShareRequestToken.
   * If a token is not given returns all the available credentials
   * @param credentialShareRequestToken - JWT received from verifier
   * @returns array of VCs
   */
  async getCredentials(credentialShareRequestToken: string = null): Promise<any[]> {
    if (credentialShareRequestToken) {
      return this.getCredentialsByShareToken(credentialShareRequestToken)
    }

    return this.getAllCredentials()
  }

  /**
   * @description Decrypts message using user's private key
   * @param encryptedMessage - message encrypted for you by your public key
   * @returns decrypted message
   */
  async readEncryptedMessage(encryptedMessage: string): Promise<any> {
    return this._affinity.decryptByPrivateKey(encryptedMessage)
  }

  /**
   * @description Creates encrypted message for another user DID
   * 1. resolve DID (for whom message will be encrypted)
   * 2. get public key from resolved DID document
   * 3. encrypt message using public key of resolved DID
   * @param did - DID of user for whom message will be sent (only this user
   * will be able to decrypt it using his private key),
   * or if DID Document is passed, resolveDid won't happen
   * @param object - message object which will be send
   * @returns encryptedMessage - string version of encrypted message
   */
  async createEncryptedMessage(did: string | any, object: any) {
    let didDocument = did

    if (typeof did === 'string') {
      didDocument = await this.resolveDid(did)
    }

    const publicKeyBuffer = Util.getPublicKeyFromDidDocument(didDocument)

    return this._platformCryptographyTools.encryptByPublicKey(publicKeyBuffer, object)
  }

  async signJwt(jwtObject: any) {
    return this._affinity.signJWTObject(jwtObject)
  }

  /**
   * @description Claim credentials from credentialOfferRequestToken callback endpoint
   * @param credentialOfferRequestToken
   * @return array of VCs
   */
  async claimCredentials(credentialOfferRequestToken: string): Promise<any[]> {
    const { isValid, errorCode, error } = await this._holderService.verifyCredentialOfferRequest(
      credentialOfferRequestToken,
    )
    if (!isValid) {
      if (errorCode) {
        throw new SdkErrorFromCode(errorCode)
      }

      throw new Error(error)
    }

    const {
      payload: {
        interactionToken: { callbackURL },
      },
    } = JwtService.fromJWT(credentialOfferRequestToken)

    const credentialOfferResponseToken = await this.createCredentialOfferResponseToken(credentialOfferRequestToken)
    let credentialsRequest
    let credentialsRequestBody
    try {
      credentialsRequest = await fetch(callbackURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Api-Key': this._options.accessApiKey,
          'Content-Type': 'application/json',
          'X-SDK-Version': extractSDKVersion(),
        },
        body: JSON.stringify({ credentialOfferResponseToken }),
      })
      credentialsRequestBody = await credentialsRequest.json()
    } catch (error) {
      throw new SdkErrorFromCode('COR-29', { callbackURL }, error)
    }

    if (credentialsRequest.status !== 200) {
      throw new SdkErrorFromCode('COR-30', { callbackURL, status: credentialsRequest.status }, credentialsRequestBody)
    }

    if (!(credentialsRequestBody && Array.isArray(credentialsRequestBody.vcs))) {
      throw new SdkErrorFromCode('COR-31', { callbackURL }, credentialsRequestBody)
    }

    return credentialsRequestBody.vcs
  }
}
