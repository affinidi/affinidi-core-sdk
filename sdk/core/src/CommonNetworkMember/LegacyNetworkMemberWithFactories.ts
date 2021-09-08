import { KeysService } from '@affinidi/common'
import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { profile } from '@affinidi/tools-common'
import WalletStorageService from '../services/WalletStorageService'
import { SdkOptions, CognitoUserTokens, MessageParameters, KeyParams } from '../dto/shared.dto'
import { validateUsername } from '../shared/validateUsername'
import { IPlatformCryptographyTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import UserManagementService from '../services/UserManagementService'
import { createKeyManagementService } from './BaseNetworkMember'
import { LegacyNetworkMember } from './LegacyNetworkMember'

type GenericConstructor<T> = new (
  password: string,
  encryptedSeed: string,
  options: ParsedOptions,
  cognitoUserTokens?: CognitoUserTokens,
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

const createUserManagementService = ({ basicOptions, accessApiKey }: ParsedOptions) => {
  return new UserManagementService({ ...basicOptions, accessApiKey })
}

/**
 * @deprecated, will be removed in SDK v7
 */
@profile()
export abstract class LegacyNetworkMemberWithFactories extends LegacyNetworkMember {
  private readonly _userManagementService
  protected cognitoUserTokens: CognitoUserTokens | undefined

  constructor(
    password: string,
    encryptedSeed: string,
    platformCryptographyTools: IPlatformCryptographyTools,
    options: ParsedOptions,
    component: EventComponent,
    cognitoUserTokens?: CognitoUserTokens,
  ) {
    super(password, encryptedSeed, platformCryptographyTools, options, component)
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
    const userManagementService = createUserManagementService(options)
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
    return new this(password, encryptedSeedWithInitializationVector, options)
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
    const userManagementService = createUserManagementService(options)
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
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.completeLogInPasswordless(token, confirmationCode)
    const { accessToken } = cognitoUserTokens
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)

    return new this(encryptionKey, encryptedSeed, options, cognitoUserTokens)
  }

  /**
   * @description Signs out current user
   */
  async signOut(inputOptions: SdkOptions): Promise<void> {
    await ParametersValidator.validate([{ isArray: false, type: SdkOptions, isRequired: true, value: inputOptions }])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
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
    const userManagementService = createUserManagementService(options)
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
    const userManagementService = createUserManagementService(options)
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
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.logInWithPassword(username, password)
    const { accessToken } = cognitoUserTokens
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)
    return new this(encryptionKey, encryptedSeed, options, cognitoUserTokens)
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
    platformCryptographyTools: IPlatformCryptographyTools,
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
    const userManagementService = createUserManagementService(options)
    const cognitoTokens = await userManagementService.signUpWithUsernameAndConfirm(username, password)
    return LegacyNetworkMemberWithFactories._confirmSignUp(
      this,
      options,
      platformCryptographyTools,
      cognitoTokens,
      password,
      keyParams,
    )
  }

  private static async _signUpByUsernameAutoConfirm<T extends DerivedType<T>>(
    self: T,
    username: string,
    password: string,
    inputOptions: SdkOptions,
    platformCryptographyTools: IPlatformCryptographyTools,
    messageParameters?: MessageParameters,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const cognitoTokens = await userManagementService.signUpWithUsernameAndConfirm(username, password)
    const result = await LegacyNetworkMemberWithFactories._confirmSignUp(
      self,
      options,
      platformCryptographyTools,
      cognitoTokens,
      password,
      undefined,
    )
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
    const userManagementService = createUserManagementService(options)
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
    platformCryptographyTools: IPlatformCryptographyTools,
    messageParameters?: MessageParameters,
  ): Promise<string | InstanceType<T>> {
    const { isUsername } = validateUsername(login)

    if (!isUsername) {
      return LegacyNetworkMemberWithFactories._signUpByEmailOrPhone(login, password, inputOptions, messageParameters)
    }

    return LegacyNetworkMemberWithFactories._signUpByUsernameAutoConfirm(
      this,
      login,
      password,
      inputOptions,
      platformCryptographyTools,
      messageParameters,
    )
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
    platformCryptographyTools: IPlatformCryptographyTools,
  ): Promise<InstanceType<T>> {
    ParametersValidator.validate([
      { isArray: false, type: KeyParams, isRequired: true, value: keyParams },
      { isArray: false, type: 'string', isRequired: true, value: signUpToken },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const { cognitoTokens, shortPassword } = await userManagementService.completeSignUpForEmailOrPhone(
      signUpToken,
      confirmationCode,
    )
    return LegacyNetworkMemberWithFactories._confirmSignUp(
      this,
      options,
      platformCryptographyTools,
      cognitoTokens,
      shortPassword,
      keyParams,
    )
  }

  private static async _confirmSignUp<T extends DerivedType<T>>(
    self: T,
    options: ParsedOptions,
    platformCryptographyTools: IPlatformCryptographyTools,
    cognitoTokens: CognitoUserTokens,
    shortPassword: string,
    keyParams: KeyParams,
  ): Promise<InstanceType<T>> {
    const { accessToken } = cognitoTokens

    if (!keyParams?.encryptedSeed) {
      const passwordHash = WalletStorageService.hashFromString(shortPassword)
      const registerResult = await LegacyNetworkMemberWithFactories._register(
        options,
        platformCryptographyTools,
        passwordHash,
      )
      const encryptedSeed = registerResult.encryptedSeed
      keyParams = { password: passwordHash, encryptedSeed }
    }

    const keyManagementService = createKeyManagementService(options)
    const { encryptionKey, updatedEncryptedSeed } = await keyManagementService.reencryptSeed(
      accessToken,
      keyParams,
      !options.otherOptions.skipBackupEncryptedSeed,
    )

    return new self(encryptionKey, updatedEncryptedSeed, options, cognitoTokens)
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
    platformCryptographyTools: IPlatformCryptographyTools,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: signUpToken },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const { cognitoTokens, shortPassword } = await userManagementService.completeSignUpForEmailOrPhone(
      signUpToken,
      confirmationCode,
    )
    const result = await LegacyNetworkMemberWithFactories._confirmSignUp(
      this,
      options,
      platformCryptographyTools,
      cognitoTokens,
      shortPassword,
      undefined,
    )
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
    const userManagementService = createUserManagementService(options)
    await userManagementService.resendSignUpByLogin(login, messageParameters)
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
    const userManagementService = createUserManagementService(options)
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
    platformCryptographyTools: IPlatformCryptographyTools,
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
      const commonNetworkMember = await this.confirmSignUp(token, confirmationCode, options, platformCryptographyTools)

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
    const userManagementService = createUserManagementService(options)
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
    const userManagementService = createUserManagementService(options)
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
    const userManagementService = createUserManagementService(options)
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
    const keyManagementService = await createKeyManagementService(options)
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)
    return new this(encryptionKey, encryptedSeed, options, { accessToken })
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
    const userManagementService = createUserManagementService(options)
    const tokens = userManagementService.readUserTokensFromSessionStorage()
    const keyManagementService = createKeyManagementService(options)
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(tokens.accessToken)

    return new this(encryptionKey, encryptedSeed, options, tokens)
  }
}
