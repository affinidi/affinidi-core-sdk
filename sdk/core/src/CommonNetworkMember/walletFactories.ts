import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { KeyParams, MessageParameters, SdkOptions } from '../dto/shared.dto'
import { IPlatformEncryptionTools } from '../shared/interfaces'
import { BaseNetworkMember, UniversalDerivedType } from './BaseNetworkMember'

export const createWallet = (platformEncryptionTools: IPlatformEncryptionTools, component: EventComponent) => {
  class Wallet extends BaseNetworkMember {
    constructor(password: string, encryptedSeed: string, options: SdkOptions, componentOverride?: EventComponent) {
      super(password, encryptedSeed, platformEncryptionTools, options, componentOverride ?? component)
    }
  }

  return Wallet as UniversalDerivedType
}

export const createWalletFactories = (platformEncryptionTools: IPlatformEncryptionTools, component: EventComponent) => {
  const Wallet = createWallet(platformEncryptionTools, component)
  type WalletConstructor = new (...args: ConstructorParameters<typeof Wallet>) => InstanceType<typeof Wallet>

  const result = {
    /**
     * @description Checks if registration for the user was completed
     * @param username - a valid email, phone number or arbitrary username
     * @param options - object with environment, staging is default { env: 'staging' }
     * @returns `true` if user is uncofirmed in Cognito, and `false` otherwise.
     */
    isUserUnconfirmed: (username: string, options: SdkOptions) => {
      return Wallet.isUserUnconfirmed(username, options)
    },

    /**
     * @description Initilizes instance of SDK from seed
     * @param seedHexWithMethod - seed for derive keys in string hex format
     * @param options - optional parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
     * @param password - optional password, will be generated, if not provided
     * @returns initialized instance of SDK
     */
    fromSeed: (seedHexWithMethod: string, options: SdkOptions, password: string = null) => {
      return Wallet.fromSeed(seedHexWithMethod, options, password)
    },

    /**
     * @description Parses JWT and returns DID
     * @param jwt
     * @returns DID of entity who signed JWT
     */
    getDidFromToken: (jwt: string) => {
      return Wallet.getDidFromToken(jwt)
    },

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
    register: (password: string, options: SdkOptions) => {
      return Wallet.register(password, options)
    },

    anchorDid: (encryptedSeed: string, password: string, didDocument: any, nonce: number, options: SdkOptions) => {
      return Wallet.anchorDid(encryptedSeed, password, didDocument, nonce, options)
    },

    /**
     * @description Initiates passwordless login to Affinity
     * @param username - email/phoneNumber, registered in Cognito
     * @param options - optional parameters with specified environment
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token
     */
    passwordlessLogin: (login: string, options: SdkOptions, messageParameters?: MessageParameters) => {
      return Wallet.passwordlessLogin(login, options, messageParameters)
    },

    /**
     * @description Completes login
     * @param token - received from #passwordlessLogin method
     * @param confirmationCode - OTP sent by AWS Cognito/SES
     * @param options - optional parameters for CommonNetworkMember initialization
     * @returns initialized instance of SDK
     */
    completeLoginChallenge: (token: string, confirmationCode: string, inputOptions: SdkOptions) => {
      return Wallet.completeLoginChallenge(token, confirmationCode, inputOptions)
    },

    /**
     * @description Initiates reset password flow
     * @param username - email/phoneNumber, registered in Cognito
     * @param options - optional parameters with specified environment
     * @param messageParameters - optional parameters with specified welcome message
     */
    forgotPassword: (login: string, options: SdkOptions, messageParameters?: MessageParameters) => {
      return Wallet.forgotPassword(login, options, messageParameters)
    },

    /**
     * @description Completes reset password flow
     * @param username - email/phoneNumber, registered in Cognito
     * @param confirmationCode - OTP sent by AWS Cognito/SES
     * @param newPassword - new password
     * @param options - optional parameters with specified environment
     */
    forgotPasswordSubmit: (login: string, confirmationCode: string, newPassword: string, options: SdkOptions) => {
      return Wallet.forgotPasswordSubmit(login, confirmationCode, newPassword, options)
    },

    /**
     * @description Logins to Affinity with login and password
     * @param username - email/phoneNumber, registered in Cognito
     * @param password - password for Cognito user
     * @param options - optional parameters for CommonNetworkMember initialization
     * @returns initialized instance of SDK
     */
    fromLoginAndPassword: (username: string, password: string, inputOptions: SdkOptions) => {
      return Wallet.fromLoginAndPassword(username, password, inputOptions)
    },

    /**
     * @description Initiates sign up flow to Affinity wallet with already created did
     * @param keyParams - { ecnryptedSeed, password } - previously created keys to be storead at wallet.
     * @param username - arbitrary username, email or phoneNumber
     * @param password - is required if arbitrary username was provided.
     * It is optional and random one will be generated, if not provided when
     * email or phoneNumber was given as a username.
     * @param options - optional parameters with specified environment
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token or, in case when arbitrary username was used, it returns
     * initialized instance of SDK
     */
    signUpWithExistsEntity: (
      keyParams: KeyParams,
      login: string,
      password: string,
      options: SdkOptions,
      messageParameters?: MessageParameters,
    ) => {
      return Wallet.signUpWithExistsEntity(keyParams, login, password, options, messageParameters)
    },

    /**
     * @description Initiates sign up flow
     * @param username - arbitrary username, email or phoneNumber
     * @param password - is required if arbitrary username was provided.
     * It is optional and random one will be generated, if not provided when
     * email or phoneNumber was given as a username.
     * @param options - optional parameters with specified environment
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token or, in case when arbitrary username was used, it returns
     * initialized instance of SDK
     */
    signUp: (login: string, password: string, options: SdkOptions, messageParameters?: MessageParameters) => {
      return Wallet.signUp(login, password, options, messageParameters)
    },

    /**
     * @description Completes sign up flow with already created did
     *       (as result created keys will be stored at the Affinity Wallet)
     * NOTE: no need calling this method in case of arbitrary username was given,
     *       as registration is already completed
     * NOTE: This method will throw an error if called for arbitrary username
     * @param keyParams - { ecnryptedSeed, password } - previously created keys to be storead at wallet.
     * @param token - Token returned by signUpWithExistsEntity method.
     * @param confirmationCode - OTP sent by AWS Cognito/SES.
     * @param options - optional parameters for CommonNetworkMember initialization
     * @returns initialized instance of SDK
     */
    confirmSignUpWithExistsEntity: (
      keyParams: KeyParams,
      signUpToken: string,
      confirmationCode: string,
      options: SdkOptions,
    ) => {
      return Wallet.confirmSignUpWithExistsEntity(keyParams, signUpToken, confirmationCode, options)
    },

    /**
     * @description Completes sign up flow
     * NOTE: no need calling this method in case of arbitrary username was given,
     *       as registration is already completed.
     * NOTE: this method will throw an error if called for arbitrary username
     * @param confirmationCode - OTP sent by AWS Cognito/SES.
     * @param options - optional parameters for CommonNetworkMember initialization
     * @returns initialized instance of SDK
     */
    confirmSignUp: (signUpToken: string, confirmationCode: string, options: SdkOptions) => {
      return Wallet.confirmSignUp(signUpToken, confirmationCode, options)
    },

    /**
     * @description Resends OTP for sign up flow
     * @param username - email/phoneNumber, registered and unconfirmed in Cognito
     * @param options - optional parameters with specified environment
     * @param messageParameters - optional parameters with specified welcome message
     */
    resendSignUpConfirmationCode: (login: string, options: SdkOptions, messageParameters?: MessageParameters) => {
      return Wallet.resendSignUpConfirmationCode(login, options, messageParameters)
    },

    /**
     * @description Initiates passwordless sign in of an existing user,
     * or signs up a new one, if user was not registered
     * @param username - email/phoneNumber, registered in Cognito
     * @param options - optional parameters with specified environment
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token
     */
    signIn: (login: string, options: SdkOptions, messageParameters?: MessageParameters) => {
      return Wallet.signIn(login, options, messageParameters)
    },

    /**
     * @description Completes sign in
     * @param token - received from #signIn method
     * @param confirmationCode - OTP sent by AWS Cognito/SES
     * @param options - optional parameters for CommonNetworkMember initialization
     * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
     */
    confirmSignIn: (token: string, confirmationCode: string, options: SdkOptions) => {
      return Wallet.confirmSignIn(token, confirmationCode, options)
    },

    /**
     * @description Generates random seed from which keys could be derived
     */
    generateSeed: (didMethod?: string) => {
      return Wallet.generateSeed(didMethod)
    },

    /**
     * @description Parses JWT token (request and response tokens of share and offer flows)
     * @param token - JWT
     * @returns parsed object from JWT
     */
    fromJWT: (token: string) => {
      return Wallet.fromJWT(token)
    },

    /**
     * @description Creates a new instance of SDK by access token
     * @param accessToken
     * @param options - optional parameters for AffinityWallet initialization
     * @returns initialized instance of SDK
     */
    fromAccessToken: (accessToken: string, options: SdkOptions) => {
      return Wallet.fromAccessToken(accessToken, options)
    },

    /**
     * @description Logins with access token of Cognito user registered in Affinity
     * @param options - optional parameters for AffinityWallet initialization
     * @returns initialized instance of SDK or throws `COR-9` UnprocessableEntityError,
     * if user is not logged in.
     */
    init: (options: SdkOptions) => {
      return Wallet.init(options)
    },
  }

  const legacyConstructor: WalletConstructor = function (password: string, encryptedSeed: string, options: SdkOptions) {
    return new Wallet(password, encryptedSeed, options)
  } as any

  return Object.assign(legacyConstructor, result)
}
