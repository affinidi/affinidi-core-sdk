import { profile } from '@affinidi/common'
import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { SignedCredential, SdkOptions } from '../dto/shared.dto'
import { IPlatformEncryptionTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import WalletStorageService from '../services/WalletStorageService'
import {
  PhoneIssuerService,
  InitiateResponse as PhoneIssuerInitiateResponse,
  VerifyResponse as PhoneIssuerVerifyResponse,
} from '../services/PhoneIssuerService'
import {
  EmailIssuerService,
  InitiateResponse as EmailIssuerInitiateResponse,
  VerifyResponse as EmailIssuerVerifyResponse,
} from '../services/EmailIssuerService'
import { BaseNetworkMember } from './BaseNetworkMember'
import { Util } from './Util'

/**
 * @deprecated, will be removed in SDK v7
 */
@profile()
export abstract class LegacyNetworkMember extends BaseNetworkMember {
  private readonly _phoneIssuer: PhoneIssuerService
  private readonly _emailIssuer: EmailIssuerService

  constructor(
    password: string,
    encryptedSeed: string,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: ParsedOptions,
    component: EventComponent,
  ) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)

    const {
      basicOptions: { phoneIssuerBasePath, emailIssuerBasePath },
    } = this._options
    this._phoneIssuer = new PhoneIssuerService({ basePath: phoneIssuerBasePath })
    this._emailIssuer = new EmailIssuerService({ basePath: emailIssuerBasePath })
  }

  /**
   * @description Initiates the phone number verification flow
   * @deprecated
   * @param config - Configuration options
   * @param config.apiKey - They api access key to the issuer service
   * @param config.phoneNumber - The phone number to send the confirmation code to
   * @param config.isWhatsAppNumber - Whether the phone number is a WhatsApp number
   * @param config.id - The id of the request, this is for the caller to be able to identify the credential in the verify step
   * @param config.holder - The DID of the user who will recieve the VC (owner of the phone number)
   * @returns intitiate response data, including the status of the request
   */
  async initiatePhoneCredential({
    apiKey,
    phoneNumber,
    isWhatsAppNumber,
    id,
    holder,
  }: {
    apiKey: string
    phoneNumber: string
    isWhatsAppNumber?: boolean
    id: string
    holder: string
  }): Promise<PhoneIssuerInitiateResponse> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: apiKey },
      { isArray: false, type: 'string', isRequired: true, value: phoneNumber },
      { isArray: false, type: 'boolean', isRequired: false, value: isWhatsAppNumber },
      { isArray: false, type: 'string', isRequired: true, value: id },
      { isArray: false, type: 'string', isRequired: true, value: holder },
    ])

    return this._phoneIssuer.initiate({ apiKey, phoneNumber, isWhatsAppNumber, id, holder })
  }

  /**
   * @description Finishes the phone number verification flow
   * @deprecated
   * @param config - Configuration options
   * @param config.apiKey - They api access key to the issuer service
   * @param config.code - The code the user recieved
   * @param config.id - The id of the request, must match the ID given in the initiate step
   * @param config.holder - The DID of the user who will recieve the VC (owner of the phone number)
   * @returns verify response data, including the issued VC(s)
   */
  async verifyPhoneCredential({
    apiKey,
    code,
    id,
    holder,
  }: {
    apiKey: string
    code: string
    id: string
    holder: string
  }): Promise<PhoneIssuerVerifyResponse> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: apiKey },
      { isArray: false, type: 'string', isRequired: true, value: code },
      { isArray: false, type: 'string', isRequired: true, value: id },
      { isArray: false, type: 'string', isRequired: true, value: holder },
    ])

    return this._phoneIssuer.verify({ apiKey, code, id, holder })
  }

  /**
   * @description Initiates the email address verification flow
   * @deprecated
   * @param config - Configuration options
   * @param config.apiKey - They api access key to the issuer service
   * @param config.emailAddress - The email address to send the confirmation code to
   * @param config.id - The id of the request, this is for the caller to be able to identify the credential in the verify step
   * @param config.holder - The DID of the user who will recieve the VC (owner of the email address)
   * @returns intitiate response data, including the status of the request
   */
  async initiateEmailCredential({
    apiKey,
    emailAddress,
    id,
    holder,
  }: {
    apiKey: string
    emailAddress: string
    id: string
    holder: string
  }): Promise<EmailIssuerInitiateResponse> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: apiKey },
      { isArray: false, type: 'string', isRequired: true, value: emailAddress },
      { isArray: false, type: 'string', isRequired: true, value: id },
      { isArray: false, type: 'string', isRequired: true, value: holder },
    ])

    return this._emailIssuer.initiate({ apiKey, emailAddress, id, holder })
  }

  /**
   * @description Finishes the email address verification flow
   * @deprecated
   * @param config - Configuration options
   * @param config.apiKey - They api access key to the issuer service
   * @param config.code - The code the user recieved
   * @param config.id - The id of the request, must match the ID given in the initiate step
   * @param config.holder - The DID of the user who will recieve the VC (owner of the email address)
   * @returns verify response data, including the issued VC(s)
   */
  async verifyEmailCredential({
    apiKey,
    code,
    id,
    holder,
  }: {
    apiKey: string
    code: string
    id: string
    holder: string
  }): Promise<EmailIssuerVerifyResponse> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: apiKey },
      { isArray: false, type: 'string', isRequired: true, value: code },
      { isArray: false, type: 'string', isRequired: true, value: id },
      { isArray: false, type: 'string', isRequired: true, value: holder },
    ])

    return this._emailIssuer.verify({ apiKey, code, id, holder })
  }

  getPublicKeyHexFromDidDocument(didDocument: any) {
    return Util.getPublicKeyHexFromDidDocument(didDocument)
  }

  /**
   * @description Creates DID and anchors it
   * 1. generate seed/keys
   * 2. build DID document
   * 3. sign DID document
   * 4. store DID document in IPFS
   * 5. anchor DID with DID document ID from IPFS
   * @param password - encryption key which will be used to encrypt randomly created seed/keys pair
   * @param options - optional parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @returns
   *
   * did - hash from public key (your decentralized ID)
   *
   * encryptedSeed - seed is encrypted by provided password. Seed - it's a source to derive your keys
   */
  static async register(password: string, inputOptions: SdkOptions): Promise<{ did: string; encryptedSeed: string }> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    return LegacyNetworkMember._register(password, options)
  }

  static async anchorDid(
    encryptedSeed: string,
    password: string,
    didDocument: any,
    nonce: number,
    inputOptions: SdkOptions,
  ) {
    const options = getOptionsFromEnvironment(inputOptions)
    return LegacyNetworkMember._anchorDid(encryptedSeed, password, didDocument, nonce, options)
  }

  /**
   * @description Retrieves a VC based on signup information
   * @param idToken - idToken received from cognito
   * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
   */
  async getSignupCredentials(idToken: string, inputOptions: SdkOptions): Promise<SignedCredential[]> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: idToken },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    return this._getSignupCredentials(idToken, options)
  }

  /**
   * @description Retrieves a VC based on signup information
   * @param idToken - idToken received from cognito
   * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
   */
  protected async _getSignupCredentials(
    idToken: string,
    { basicOptions: { env, keyStorageUrl, issuerUrl }, accessApiKey }: ParsedOptions,
  ): Promise<SignedCredential[]> {
    const credentialOfferToken = await WalletStorageService.getCredentialOffer(idToken, keyStorageUrl, {
      env,
      accessApiKey,
    })

    const credentialOfferResponseToken = await this.createCredentialOfferResponseToken(credentialOfferToken)

    return WalletStorageService.getSignedCredentials(idToken, credentialOfferResponseToken, {
      accessApiKey,
      issuerUrl,
      keyStorageUrl,
    })
  }
}
