import { DidDocumentService, JwtService, KeysService, MetricsService, Affinity } from '@affinidi/common'
import {
  IssuerApiService,
  RegistryApiService,
  RevocationApiService,
  VerifierApiService,
  DidAuthAdapter,
} from '@affinidi/internal-api-clients'
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

import { EventComponent, EventCategory, EventName, EventMetadata } from '@affinidi/affinity-metrics-lib'

import WalletStorageService from '../services/WalletStorageService'
import HolderService from '../services/HolderService'

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
} from '../dto/shared.dto'

import { IPlatformCryptographyTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'

import {
  CredentialShareResponseOutput,
  CredentialOfferResponseOutput,
  PresentationValidationOutput,
} from '../dto/verifier.dto'

import { randomBytes } from '../shared/randomBytes'
import { extractSDKVersion, isW3cCredential } from '../_helpers'

import { DEFAULT_DID_METHOD, SUPPORTED_DID_METHODS } from '../_defaultConfig'
import { ParsedOptions } from '../shared/getOptionsFromEnvironment'
import KeyManagementService from '../services/KeyManagementService'
import SdkErrorFromCode from '../shared/SdkErrorFromCode'
import { Util } from './Util'
import { register } from '../services/registeringHandler'
import { anchorDid } from '../services/anchoringHandler'

export const createKeyManagementService = ({ basicOptions, accessApiKey }: ParsedOptions) => {
  return new KeyManagementService({ ...basicOptions, accessApiKey })
}

export type StaticDependencies = {
  platformCryptographyTools: IPlatformCryptographyTools
  eventComponent: EventComponent
}

export type ConstructorUserData = {
  did: string
  didDocumentKeyId: string
  encryptedSeed: string
  password: string
}

@profile()
export abstract class BaseNetworkMember {
  private readonly _did: string
  private readonly _encryptedSeed: string
  private readonly _password: string
  protected readonly _walletStorageService: WalletStorageService
  protected readonly _keysService: KeysService
  private readonly _jwtService: JwtService
  private readonly _holderService: HolderService
  private readonly _metricsService: MetricsService
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
    { did, didDocumentKeyId, encryptedSeed, password }: ConstructorUserData,
    { platformCryptographyTools, eventComponent }: StaticDependencies,
    options: ParsedOptions,
  ) {
    if (!did || !didDocumentKeyId || !encryptedSeed || !password) {
      // TODO: implement appropriate error wrapper
      throw new Error('`did`, `didDocumentKeyId`, `encryptedSeed` and `password` must be provided!')
    }

    const { accessApiKey, basicOptions, storageRegion } = options
    const {
      issuerUrl,
      revocationUrl,
      metricsUrl,
      registryUrl,
      verifierUrl,
      bloomVaultUrl,
      affinidiVaultUrl,
    } = basicOptions

    const keysService = new KeysService(encryptedSeed, password)
    this._metricsService = new MetricsService({
      metricsUrl,
      accessApiKey: accessApiKey,
      component: eventComponent,
    })

    const sdkVersion = extractSDKVersion()

    this._registryApiService = new RegistryApiService({ registryUrl, accessApiKey, sdkVersion })
    this._issuerApiService = new IssuerApiService({ issuerUrl, accessApiKey, sdkVersion })
    this._verifierApiService = new VerifierApiService({ verifierUrl, accessApiKey, sdkVersion })
    this._keyManagementService = createKeyManagementService(options)
    const didAuthAdapter = new DidAuthAdapter(did, { encryptedSeed, encryptionKey: password })
    this._revocationApiService = new RevocationApiService({
      revocationUrl,
      accessApiKey,
      sdkVersion,
      didAuthAdapter,
    })
    this._walletStorageService = new WalletStorageService(keysService, platformCryptographyTools, {
      bloomVaultUrl,
      affinidiVaultUrl,
      accessApiKey,
      storageRegion,
      didAuthAdapter,
    })
    this._jwtService = new JwtService()
    this._holderService = new HolderService(
      { registryUrl, metricsUrl, accessApiKey },
      platformCryptographyTools,
      eventComponent,
    )
    this._affinity = new Affinity(
      {
        apiKey: accessApiKey,
        registryUrl: registryUrl,
        metricsUrl: metricsUrl,
        component: eventComponent,
      },
      platformCryptographyTools,
    )
    this._keysService = keysService

    this._options = options
    this._component = eventComponent
    this._encryptedSeed = encryptedSeed
    this._password = password
    this._did = did
    this._didDocumentKeyId = didDocumentKeyId
    this._platformCryptographyTools = platformCryptographyTools
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
   * @param options - optional parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
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
    return register(api, didMethod, dependencies.platformCryptographyTools, password, keyOptions)
  }

  protected static async _anchorDid(
    encryptedSeed: string,
    password: string,
    didDocument: any,
    nonce: number,
    { basicOptions: { registryUrl }, accessApiKey }: ParsedOptions,
  ) {
    const api = new RegistryApiService({ registryUrl, accessApiKey, sdkVersion: extractSDKVersion() })
    return anchorDid(api, encryptedSeed, password, didDocument, false, nonce)
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

    const { seed, didMethod } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    const transactionPublicKey = KeysService.getAnchorTransactionPublicKey(seedHex, didMethod)
    const ethereumPublicKeyHex = transactionPublicKey.toString('hex')

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

    let didMethod
    try {
      const keysService = new KeysService(encryptedSeed, password)
      didMethod = keysService.decryptSeed().didMethod
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

    const signedObject = this._keysService.signJWT(credentialOffer as any, this.didDocumentKeyId)

    return this._jwtService.encodeObjectToJWT(signedObject)
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

    const signedObject = this._keysService.signJWT(credentialShareRequest as any, this.didDocumentKeyId)

    return this._jwtService.encodeObjectToJWT(signedObject)
  }

  /**
   * @description Creates JWT of credential offer response
   * @param credentialOfferToken - JWT with offered credentials
   * @returns JWT
   */
  async createCredentialOfferResponseToken(credentialOfferToken: string): Promise<string> {
    await ParametersValidator.validate([{ isArray: false, type: 'jwt', isRequired: true, value: credentialOfferToken }])

    const credentialOfferResponse = await this._holderService.buildCredentialOfferResponse(credentialOfferToken)

    const signedObject = this._keysService.signJWT(credentialOfferResponse, this.didDocumentKeyId)

    return this._jwtService.encodeObjectToJWT(signedObject)
  }

  async createDidAuthResponse(didAuthRequestToken: string): Promise<string> {
    await ParametersValidator.validate([{ isArray: false, type: 'jwt', isRequired: true, value: didAuthRequestToken }])

    return this.createCredentialShareResponseToken(didAuthRequestToken, [])
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
   * @returns JWT
   */
  async createCredentialShareResponseToken(
    credentialShareRequestToken: string,
    suppliedCredentials: SignedCredential[],
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'jwt', isRequired: true, value: credentialShareRequestToken },
      { isArray: true, type: SignedCredential, isRequired: true, value: suppliedCredentials },
    ])

    this._validateSignedCredentialsSupportedStructures(suppliedCredentials)

    const credentialResponse = await this._holderService.buildCredentialResponse(
      credentialShareRequestToken,
      suppliedCredentials,
    )

    const signedObject = this._keysService.signJWT(credentialResponse, this.didDocumentKeyId)

    return this._jwtService.encodeObjectToJWT(signedObject)
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
      const revocationSignedListCredential = await this._affinity.signCredential(
        revocationListCredential as any,
        this._encryptedSeed,
        this._password,
      )
      revocationSignedListCredential.issuanceDate = new Date().toISOString()

      await this._revocationApiService.publishRevocationListCredential(revocationSignedListCredential)
    }

    return revokableUnsignedCredential
  }

  async revokeCredential(credentialId: string, revocationReason: string): Promise<void> {
    const {
      body: { revocationListCredential },
    } = await this._revocationApiService.revokeCredential({ id: credentialId, revocationReason })

    const revocationSignedListCredential = await this._affinity.signCredential(
      revocationListCredential,
      this._encryptedSeed,
      this._password,
    )
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
    return this._affinity.signCredential(unsignedCredential, this._encryptedSeed, this._password, keyType)
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

    const isTestEnvironment = process.env.NODE_ENV === 'test'

    if (isValid && !isTestEnvironment) {
      this._sendVCVerifiedPerPartyMetrics(suppliedCredentials)
    }

    return { isValid, did, nonce: jti, suppliedCredentials, errors }
  }

  /* istanbul ignore next: private method */
  private _sendVCVerifiedPerPartyMetrics(credentials: any[]) {
    const verifierDid = this.did

    for (const credential of credentials) {
      const metadata = this._metricsService.parseVcMetadata(credential, EventName.VC_VERIFIED_PER_PARTY)
      this._sendVCVerifiedPerPartyMetric(credential.id, verifierDid, metadata)
    }
  }

  /* istanbul ignore next: private method */
  private _sendVCVerifiedPerPartyMetric(vcId: string, verifierDid: string, metadata: EventMetadata) {
    const event = {
      component: this._component,
      link: vcId,
      secondaryLink: verifierDid,
      name: EventName.VC_VERIFIED_PER_PARTY,
      category: EventCategory.VC,
      subCategory: 'verify per party',
      metadata: metadata,
    }

    this._metricsService.send(event)
  }

  private _sendVCSavedMetric(vcId: string, issuerId: string, metadata: EventMetadata) {
    const event = {
      component: this._component,
      link: vcId,
      secondaryLink: issuerId,
      name: EventName.VC_SAVED,
      category: EventCategory.VC,
      subCategory: 'save',
      metadata: metadata,
    }

    this._metricsService.send(event)
  }

  protected _sendVCSavedMetrics(credentials: SignedCredential[]) {
    for (const credential of credentials) {
      if (isW3cCredential(credential)) {
        const metadata = this._metricsService.parseVcMetadata(credential, EventName.VC_SAVED)
        const vcId = credential.id
        // the issuer property could be either an URI string or an object with id propoerty
        // https://www.w3.org/TR/vc-data-model/#issuer
        let issuerId: string
        const issuer = credential.issuer

        if (typeof issuer === 'string') {
          issuerId = issuer
        } else {
          issuerId = issuer.id
        }

        this._sendVCSavedMetric(vcId, issuerId, metadata)
      }
    }
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

    const signedObject = this._keysService.signJWT(credentialShareRequest as any)

    return this._jwtService.encodeObjectToJWT(signedObject)
  }

  async signUnsignedPresentation(vp: VPV1Unsigned, challenge: string, domain: string) {
    return this._affinity.signPresentation({
      vp,
      encryption: {
        seed: this._encryptedSeed,
        key: this._password,
      },
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
   * @description Validates a VP, and the contained VCs
   * @param vp - the presentation to be validated
   * when needed to verify if holder is a subject of VC
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
  async verifyPresentation(vp: unknown): Promise<PresentationValidationOutput> {
    const response = await this._affinity.validatePresentation(vp)

    if (response.result === true) {
      // After validating the VP we need to validate the VP's challenge token
      // to ensure that it was issued from the correct DID and that it hasn't expired.
      try {
        await this._holderService.verifyPresentationChallenge(response.data.proof.challenge, this.did)
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
        challenge: response.data.proof.challenge,
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
   * @description Save's encrypted VCs in Affinity Guardian Wallet
   * 1. encrypt VCs
   * 2. store encrypted VCs in Affinity Guardian Wallet
   * @param data - array of VCs
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   * @returns array of ids for corelated records
   */
  async saveCredentials(data: any[], storageRegion?: string): Promise<any> {
    const result = await this._walletStorageService.saveCredentials(data, storageRegion)

    this._sendVCSavedMetrics(data)
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
   * @returns a single VC
   */
  async getAllCredentials(storageRegion?: string): Promise<any[]> {
    return this._walletStorageService.getAllCredentials(storageRegion)
  }

  /**
   * @description Retrieve only the credential
   * @param token (string) - specify credential share request token to filter
   * @param storageRegion (string) - (optional) specify region where credentials will be stored
   * @returns a single VC
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
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    return this._platformCryptographyTools.decryptByPrivateKey(privateKeyBuffer, encryptedMessage)
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

    const publicKeyHex = Util.getPublicKeyHexFromDidDocument(didDocument)
    const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex')

    return this._platformCryptographyTools.encryptByPublicKey(publicKeyBuffer, object)
  }

  async signJwt(jwtObject: any) {
    return this._keysService.signJWT(jwtObject)
  }
}
