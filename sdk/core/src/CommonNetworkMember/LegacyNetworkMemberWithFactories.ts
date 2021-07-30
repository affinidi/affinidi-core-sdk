import { profile, KeysService } from '@affinidi/common'
import { EventComponent } from '@affinidi/affinity-metrics-lib'
import WalletStorageService from '../services/WalletStorageService'
import { SignedCredential, SdkOptions, CognitoUserTokens, MessageParameters, KeyParams } from '../dto/shared.dto'
import { validateUsername } from '../shared/validateUsername'
import { IPlatformEncryptionTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import UserManagementService from '../services/UserManagementService'
import { BaseNetworkMember } from './BaseNetworkMember'
import { Util } from './Util'

type GenericConstructor<T> = new (
  password: string,
  encryptedSeed: string,
  cognitoUserTokens: CognitoUserTokens | undefined,
  options: ParsedOptions,
  component?: EventComponent,
) => T
type Constructor<T> = GenericConstructor<T> & GenericConstructor<LegacyNetworkMemberWithFactories>
type AbstractStaticMethods = Record<never, never>
type ConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new (...args: unknown[]) => unknown ? P : never
}[keyof T]
type OmitConstructor<T> = Omit<T, ConstructorKeys<T>>
type DerivedTypeForOptions<TInstance> = Constructor<TInstance> &
  AbstractStaticMethods &
  OmitConstructor<typeof LegacyNetworkMemberWithFactories>
type DerivedType<T extends DerivedType<T>> = DerivedTypeForOptions<InstanceType<T>>
export type UniversalDerivedType = DerivedType<DerivedTypeForOptions<LegacyNetworkMemberWithFactories>>

/**
 * This class is abstract.
 * You can use implementations from wallet-browser-sdk, wallet-expo-sdk or wallet-react-native-sdk as needed.
 *
 * Alternatively you can implement your own derived class.
 * Derived classes should have:
 *  * A constructor with a signature `new (password: string, encryptedSeed: string, options?: SdkOptions, component?: EventComponent)`
 *  * A static method `afterConfirmSignUp(networkMember: YourClass, originalOptions: SdkOptions) => Promise<void>`
 *
 * Constructor should pass an implementation of `IPlatformEncryptionTools` to the base constructor.
 * This implementation should be compatible with one in other SDKs,
 * it will be used to encrypt and decrypt credentials stored in vault.
 * Alternatively you can provide a stub implementation, with all methods throwing errors,
 * if you are not going to use any features that depend on platform tools.
 *
 * `afterConfirmSignUp` is invoked on every call to `confirmSignUp`, direct or indirect.
 * It allows you to perform some tasks specific to your implementation.
 * You can leave the method body empty if you don't need it.
 */
@profile()
export abstract class LegacyNetworkMemberWithFactories extends BaseNetworkMember {
  private readonly _userManagementService
  protected cognitoUserTokens: CognitoUserTokens

  constructor(
    password: string,
    encryptedSeed: string,
    cognitoUserTokens: CognitoUserTokens | undefined,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: ParsedOptions,
    component: EventComponent,
  ) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)
    const { accessApiKey, basicOptions } = options
    const { clientId, userPoolId, keyStorageUrl } = basicOptions
    this._userManagementService = new UserManagementService({ clientId, userPoolId, keyStorageUrl, accessApiKey })
    this.cognitoUserTokens = cognitoUserTokens
  }

  /**
   * @description Returns user's accessToken
   * @returns encrypted seed
   */
  get accessToken(): string {
    return this.cognitoUserTokens.accessToken
  }

  private static _createUserManagementService = ({ basicOptions, accessApiKey }: ParsedOptions) => {
    return new UserManagementService({ ...basicOptions, accessApiKey })
  }

  /**
   * @description Checks if registration for the user was completed
   * @param username - a valid email, phone number or arbitrary username
   * @param options - object with environment, staging is default { env: 'staging' }
   * @returns `true` if user is uncofirmed in Cognito, and `false` otherwise.
   */
   static async isUserUnconfirmed(username: string, inputOptions: SdkOptions) {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    return userManagementService.doesUnconfirmedUserExist(username)
  }

  /**
   * @description Initilizes instance of SDK from seed
   * @param seedHexWithMethod - seed for derive keys in string hex format
   * @param options - optional parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @param password - optional password, will be generated, if not provided
   * @returns initialized instance of SDK
   */
  static async fromSeed<T extends DerivedType<T>>(
    this: T,
    seedHexWithMethod: string,
    inputOptions: SdkOptions,
    password: string = null,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: seedHexWithMethod },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: false, value: password },
    ])

    let passwordBuffer

    if (password) {
      passwordBuffer = KeysService.normalizePassword(password)
    } else {
      passwordBuffer = await randomBytes(32)
      password = passwordBuffer.toString('hex')
    }

    const options = getOptionsFromEnvironment(inputOptions)
    const encryptedSeedWithInitializationVector = await KeysService.encryptSeed(seedHexWithMethod, passwordBuffer)
    return new this(password, encryptedSeedWithInitializationVector, undefined, options)
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
    return LegacyNetworkMemberWithFactories._register(password, options)
  }

  static async anchorDid(
    encryptedSeed: string,
    password: string,
    didDocument: any,
    nonce: number,
    inputOptions: SdkOptions,
  ) {
    const options = getOptionsFromEnvironment(inputOptions)
    return LegacyNetworkMemberWithFactories._anchorDid(encryptedSeed, password, didDocument, nonce, options)
  }

  /**
   * @description Pulls encrypted seed from Affinity Guardian Wallet
   * 1. get AWS cognito access token
   * 2. using access token pull encrypted seed from Affinity Guardian Wallet
   * associated with this AWS Cognito userId
   * @param username - email or phone number used to create Affinity user
   * @param password - password used on create Affinity user
   */
  async pullEncryptedSeed(username: string, password: string): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'string', isRequired: true, value: password },
    ])

    const { accessToken } = await this._userManagementService.logInWithPassword(username, password)
    const { encryptedSeed } = await this._keyManagementService.pullKeyAndSeed(accessToken)

    return encryptedSeed
  }

  /**
   * @description Saves encrypted seed to Guardian Wallet
   * @param username - email/phoneNumber, registered in Cognito
   * @param password - password for Cognito user
   * @param token - Cognito access token, required for authorization.
   * If not provided, in order to get it, sign in to Cognito will be initiated.
   */
  async storeEncryptedSeed(username: string, password: string, token: string = undefined): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'string', isRequired: true, value: password },
      { isArray: false, type: 'jwt', isRequired: false, value: token },
    ])

    let accessToken = token

    /* istanbul ignore else: code simplicity */
    if (!token) {
      this.cognitoUserTokens = await this._userManagementService.logInWithPassword(username, password)

      accessToken = this.cognitoUserTokens.accessToken
    }

    const { seedHexWithMethod } = this._keysService.decryptSeed()
    await this._keyManagementService.pullEncryptionKeyAndStoreEncryptedSeed(accessToken, seedHexWithMethod)
  }

  /**
   * @description Initiates passwordless login to Affinity
   * @param username - email/phoneNumber, registered in Cognito
   * @param options - optional parameters with specified environment
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token
   */
  static async passwordlessLogin(
    login: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    return await userManagementService.initiateLogInPasswordless(login, messageParameters)
  }

  /**
   * @description Completes login
   * @param token - received from #passwordlessLogin method
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @param options - optional parameters for BaseNetworkMember initialization
   * @returns initialized instance of SDK
   */
  static async completeLoginChallenge<T extends DerivedType<T>>(
    this: T,
    token: string,
    confirmationCode: string,
    inputOptions: SdkOptions,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: token },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const keyManagementService = LegacyNetworkMemberWithFactories._createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.completeLogInPasswordless(token, confirmationCode)
    const { accessToken } = cognitoUserTokens
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)

    return new this(encryptionKey, encryptedSeed, cognitoUserTokens, options)
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
  private async _getSignupCredentials(
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

  /**
   * @description Signs out current user
   */
  async signOut(inputOptions: SdkOptions): Promise<void> {
    await ParametersValidator.validate([{ isArray: false, type: SdkOptions, isRequired: true, value: inputOptions }])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const newTokens = await userManagementService.logOut(this.cognitoUserTokens)
    this.cognitoUserTokens = newTokens
  }

  /**
   * @description Initiates reset password flow
   * @param username - email/phoneNumber, registered in Cognito
   * @param options - optional parameters with specified environment
   * @param messageParameters - optional parameters with specified welcome message
   */
  static async forgotPassword(
    login: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    await userManagementService.initiateForgotPassword(login, messageParameters)
  }

  /**
   * @description Completes reset password flow
   * @param username - email/phoneNumber, registered in Cognito
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @param newPassword - new password
   * @param options - optional parameters with specified environment
   */
  static async forgotPasswordSubmit(
    login: string,
    confirmationCode: string,
    newPassword: string,
    inputOptions: SdkOptions,
  ): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: 'string', isRequired: true, value: newPassword },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = this._createUserManagementService(options)
    await userManagementService.completeForgotPassword(login, confirmationCode, newPassword)
  }

  /**
   * @description Logins to Affinity with login and password
   * @param username - email/phoneNumber, registered in Cognito
   * @param password - password for Cognito user
   * @param options - optional parameters for BaseNetworkMember initialization
   * @returns initialized instance of SDK
   */
  static async fromLoginAndPassword<T extends DerivedType<T>>(
    this: T,
    username: string,
    password: string,
    inputOptions: SdkOptions,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const keyManagementService = LegacyNetworkMemberWithFactories._createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.logInWithPassword(username, password)
    const { accessToken } = cognitoUserTokens
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)
    return new this(encryptionKey, encryptedSeed, cognitoUserTokens, options)
  }

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
  static async signUpWithExistsEntity<T extends DerivedType<T>>(
    this: T,
    keyParams: KeyParams,
    login: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string | InstanceType<T>> {
    const { isUsername } = validateUsername(login)

    if (!isUsername) {
      return LegacyNetworkMemberWithFactories._signUpByEmailOrPhone(login, password, inputOptions, messageParameters)
    }

    const username = login
    await ParametersValidator.validate([
      { isArray: false, type: KeyParams, isRequired: true, value: keyParams },
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    LegacyNetworkMemberWithFactories._validateKeys(keyParams)

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const cognitoTokens = await userManagementService.signUpWithUsernameAndConfirm(
      username,
      password,
      messageParameters,
    )
    return LegacyNetworkMemberWithFactories._confirmSignUp(this, cognitoTokens, password, keyParams, options)
  }

  private static async _signUpByUsernameAutoConfirm<T extends DerivedType<T>>(
    self: T,
    username: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const cognitoTokens = await userManagementService.signUpWithUsernameAndConfirm(
      username,
      password,
      messageParameters,
    )
    const result = await LegacyNetworkMemberWithFactories._confirmSignUp(self, cognitoTokens, password, undefined, options)
    result.afterConfirmSignUp()
    return result
  }

  private static async _signUpByEmailOrPhone<T extends DerivedType<T>>(
    login: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: 'password', isRequired: false, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    return userManagementService.initiateSignUpWithEmailOrPhone(login, password, messageParameters)
  }

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
  static async signUp<T extends DerivedType<T>>(
    this: T,
    login: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string | InstanceType<T>> {
    const { isUsername } = validateUsername(login)

    if (!isUsername) {
      return LegacyNetworkMemberWithFactories._signUpByEmailOrPhone(login, password, inputOptions, messageParameters)
    }

    return LegacyNetworkMemberWithFactories._signUpByUsernameAutoConfirm(this, login, password, inputOptions, messageParameters)
  }

  /**
   * @description Completes sign up flow with already created did
   *       (as result created keys will be stored at the Affinity Wallet)
   * NOTE: no need calling this method in case of arbitrary username was given,
   *       as registration is already completed
   * NOTE: This method will throw an error if called for arbitrary username
   * @param keyParams - { ecnryptedSeed, password } - previously created keys to be storead at wallet.
   * @param token - Token returned by signUpWithExistsEntity method.
   * @param confirmationCode - OTP sent by AWS Cognito/SES.
   * @param options - optional parameters for BaseNetworkMember initialization
   * @returns initialized instance of SDK
   */
  static async confirmSignUpWithExistsEntity<T extends DerivedType<T>>(
    this: T,
    keyParams: KeyParams,
    signUpToken: string,
    confirmationCode: string,
    inputOptions: SdkOptions,
  ): Promise<InstanceType<T>> {
    ParametersValidator.validate([
      { isArray: false, type: KeyParams, isRequired: true, value: keyParams },
      { isArray: false, type: 'string', isRequired: true, value: signUpToken },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const { cognitoTokens, shortPassword } = await userManagementService.completeSignUpForEmailOrPhone(
      signUpToken,
      confirmationCode,
    )
    return LegacyNetworkMemberWithFactories._confirmSignUp(this, cognitoTokens, shortPassword, keyParams, options)
  }

  private static async _confirmSignUp<T extends DerivedType<T>>(
    self: T,
    cognitoTokens: CognitoUserTokens,
    shortPassword: string,
    keyParams: KeyParams,
    options: ParsedOptions,
  ): Promise<InstanceType<T>> {
    const { accessToken } = cognitoTokens

    if (!keyParams?.encryptedSeed) {
      const passwordHash = WalletStorageService.hashFromString(shortPassword)
      const registerResult = await LegacyNetworkMemberWithFactories._register(passwordHash, options)
      const encryptedSeed = registerResult.encryptedSeed
      keyParams = { password: passwordHash, encryptedSeed }
    }

    const keyManagementService = this._createKeyManagementService(options)
    const { encryptionKey, updatedEncryptedSeed } = await keyManagementService.reencryptSeed(
      accessToken,
      keyParams,
      !options.otherOptions.skipBackupEncryptedSeed,
    )

    return new self(encryptionKey, updatedEncryptedSeed, cognitoTokens, options)
  }

  /**
   * @description Completes sign up flow
   * NOTE: no need calling this method in case of arbitrary username was given,
   *       as registration is already completed.
   * NOTE: this method will throw an error if called for arbitrary username
   * @param confirmationCode - OTP sent by AWS Cognito/SES.
   * @param options - optional parameters for BaseNetworkMember initialization
   * @returns initialized instance of SDK
   */
  static async confirmSignUp<T extends DerivedType<T>>(
    this: T,
    signUpToken: string,
    confirmationCode: string,
    inputOptions: SdkOptions,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: signUpToken },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const { cognitoTokens, shortPassword } = await userManagementService.completeSignUpForEmailOrPhone(
      signUpToken,
      confirmationCode,
    )
    const result = await LegacyNetworkMemberWithFactories._confirmSignUp(this, cognitoTokens, shortPassword, undefined, options)
    await result.afterConfirmSignUp()
    return result
  }

  private async afterConfirmSignUp() {
    const { idToken } = this.cognitoUserTokens

    if (this._options.otherOptions.issueSignupCredential) {
      const signedCredentials = await this._getSignupCredentials(idToken, this._options)

      await this.saveCredentials(signedCredentials)
    }
  }

  /**
   * @description Resends OTP for sign up flow
   * @param username - email/phoneNumber, registered and unconfirmed in Cognito
   * @param options - optional parameters with specified environment
   * @param messageParameters - optional parameters with specified welcome message
   */
  static async resendSignUpConfirmationCode(
    login: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    await userManagementService.resendSignUp(login, messageParameters)
  }

  /**
   * @description Initiates passwordless sign in of an existing user,
   * or signs up a new one, if user was not registered
   * @param username - email/phoneNumber, registered in Cognito
   * @param options - optional parameters with specified environment
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token
   */
  static async signIn<T extends DerivedType<T>>(
    this: T,
    login: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    // NOTE: This is a passwordless login/sign up flow,
    //       case when user signs up more often
    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const doesConfirmedUserExist = await userManagementService.doesConfirmedUserExist(login)
    if (doesConfirmedUserExist) {
      return userManagementService.initiateLogInPasswordless(login, messageParameters)
    } else {
      return userManagementService.initiateSignUpWithEmailOrPhone(login, null, messageParameters)
    }
  }

  /**
   * @description Completes sign in
   * @param token - received from #signIn method
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @param options - optional parameters for BaseNetworkMember initialization
   * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
   */
  static async confirmSignIn<T extends DerivedType<T>>(
    this: T,
    token: string,
    confirmationCode: string,
    options: SdkOptions,
  ): Promise<{ isNew: boolean; commonNetworkMember: InstanceType<T> }> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: token },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: options },
    ])

    // NOTE: loginToken = '{"ChallengeName":"CUSTOM_CHALLENGE","Session":"...","ChallengeParameters":{"USERNAME":"...","email":"..."}}'
    //       signUpToken = 'username::password'
    const isSignUpToken = token.split('::')[1] !== undefined

    if (isSignUpToken) {
      const commonNetworkMember = await this.confirmSignUp(token, confirmationCode, options)

      return { isNew: true, commonNetworkMember }
    }

    const commonNetworkMember = await this.completeLoginChallenge(token, confirmationCode, options)

    return { isNew: false, commonNetworkMember }
  }

  /**
   * @description Initiates change user password
   * @param oldPassword
   * @param newPassword
   * @param options - optional parameters with specified environment
   */
  async changePassword(oldPassword: string, newPassword: string, inputOptions: SdkOptions): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: oldPassword },
      { isArray: false, type: 'string', isRequired: true, value: newPassword },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    this.cognitoUserTokens = await userManagementService.changePassword(
      this.cognitoUserTokens,
      oldPassword,
      newPassword,
    )
  }

  /**
   * @description Initiates change user attribute (email/phoneNumber) flow
   * @param newLogin - new email/phoneNumber
   * @param options - optional parameters with specified environment
   * @param messageParameters - optional parameters with specified welcome message
   */
  // NOTE: operation is used for change the attribute, not username. Consider renaming
  //       New email/phoneNumber can be useded as a username to login.
  async changeUsername(
    newLogin: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: newLogin },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    this.cognitoUserTokens = await userManagementService.initiateChangeLogin(
      this.cognitoUserTokens,
      newLogin,
      messageParameters,
    )
  }

  /**
   * @description Completes change user attribute (email/phoneNumber) flow
   * @param newUsername - new email/phoneNumber
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @param options - optional parameters with specified environment
   */
  async confirmChangeUsername(newLogin: string, confirmationCode: string, inputOptions: SdkOptions): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: newLogin },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    this.cognitoUserTokens = await userManagementService.completeChangeLogin(
      this.cognitoUserTokens,
      newLogin,
      confirmationCode,
    )
  }

  /**
   * @description Creates a new instance of SDK by access token
   * @param accessToken
   * @param options - optional parameters for AffinityWallet initialization
   * @returns initialized instance of SDK
   */
   static async fromAccessToken<T extends DerivedType<T>>(
    this: T,
    accessToken: string,
    inputOptions: SdkOptions,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: false, value: accessToken },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const keyManagementService = await LegacyNetworkMemberWithFactories._createKeyManagementService(options)
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)
    return new this(encryptionKey, encryptedSeed, { accessToken }, options)
  }

  /**
   * @description Logins with access token of Cognito user registered in Affinity
   * @param options - optional parameters for AffinityWallet initialization
   * @returns initialized instance of SDK or throws `COR-9` UnprocessableEntityError,
   * if user is not logged in.
   */
  static async init<T extends DerivedType<T>>(this: T, inputOptions: SdkOptions): Promise<InstanceType<T>> {
    await ParametersValidator.validate([{ isArray: false, type: SdkOptions, isRequired: true, value: inputOptions }])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = LegacyNetworkMemberWithFactories._createUserManagementService(options)
    const tokens = userManagementService.readUserTokensFromSessionStorage()
    const keyManagementService = LegacyNetworkMemberWithFactories._createKeyManagementService(options)
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(tokens.accessToken)

    return new this(encryptionKey, encryptedSeed, tokens, options)
  }
}
