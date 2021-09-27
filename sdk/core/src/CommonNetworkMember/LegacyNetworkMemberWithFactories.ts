import { KeysService } from '@affinidi/common'
import { profile } from '@affinidi/tools-common'
import WalletStorageService from '../services/WalletStorageService'
import { SdkOptions, CognitoUserTokens, MessageParameters, KeyParams } from '../dto/shared.dto'
import { withDidData } from '../shared/getDidData'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
import { validateUsername } from '../shared/validateUsername'
import UserManagementService from '../services/UserManagementService'
import { StaticDependencies, ConstructorUserData, createKeyManagementService } from './BaseNetworkMember'
import { LegacyNetworkMember } from './LegacyNetworkMember'

const createUserManagementService = ({ basicOptions, accessApiKey }: ParsedOptions) => {
  return new UserManagementService({ ...basicOptions, accessApiKey })
}

type UserDataWithCognito = ConstructorUserData & {
  cognitoUserTokens: CognitoUserTokens | undefined
}

/**
 * @deprecated, will be removed in SDK v7
 */
@profile()
export class LegacyNetworkMemberWithFactories extends LegacyNetworkMember {
  private readonly _userManagementService
  protected cognitoUserTokens: CognitoUserTokens | undefined

  constructor(userData: UserDataWithCognito, dependencies: StaticDependencies, options: ParsedOptions) {
    super(userData, dependencies, options)
    const { accessApiKey, basicOptions } = this._options
    const { clientId, userPoolId, keyStorageUrl } = basicOptions
    this._userManagementService = new UserManagementService({ clientId, userPoolId, keyStorageUrl, accessApiKey })
    const { cognitoUserTokens } = userData
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
  static async fromSeed(
    dependencies: StaticDependencies,
    seedHexWithMethod: string,
    inputOptions: SdkOptions,
    password: string = null,
  ) {
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
    const userData = withDidData({
      encryptedSeed: await KeysService.encryptSeed(seedHexWithMethod, passwordBuffer),
      password,
    })
    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens: undefined }, dependencies, options)
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
  static async completeLoginChallenge(
    dependencies: StaticDependencies,
    token: string,
    confirmationCode: string,
    inputOptions: SdkOptions,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: token },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.completeLogInPasswordless(token, confirmationCode)
    const userData = await keyManagementService.pullUserData(cognitoUserTokens.accessToken)

    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens }, dependencies, options)
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
  static async fromLoginAndPassword(
    dependencies: StaticDependencies,
    username: string,
    password: string,
    inputOptions: SdkOptions,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.logInWithPassword(username, password)
    const userData = await keyManagementService.pullUserData(cognitoUserTokens.accessToken)
    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens }, dependencies, options)
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
  static async signUpWithExistsEntity(
    dependencies: StaticDependencies,
    keyParams: KeyParams,
    login: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string | LegacyNetworkMemberWithFactories> {
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
    return LegacyNetworkMemberWithFactories._confirmSignUp(dependencies, options, cognitoTokens, password, keyParams)
  }

  private static async _signUpByUsernameAutoConfirm(
    dependencies: StaticDependencies,
    username: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ) {
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
      dependencies,
      options,
      cognitoTokens,
      password,
      undefined,
    )
    result.afterConfirmSignUp()
    return result
  }

  private static async _signUpByEmailOrPhone(
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
  static async signUp(
    dependencies: StaticDependencies,
    login: string,
    password: string,
    inputOptions: SdkOptions,
    messageParameters?: MessageParameters,
  ): Promise<string | LegacyNetworkMemberWithFactories> {
    const { isUsername } = validateUsername(login)

    if (!isUsername) {
      return LegacyNetworkMemberWithFactories._signUpByEmailOrPhone(login, password, inputOptions, messageParameters)
    }

    return LegacyNetworkMemberWithFactories._signUpByUsernameAutoConfirm(
      dependencies,
      login,
      password,
      inputOptions,
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
  static async confirmSignUpWithExistsEntity(
    dependencies: StaticDependencies,
    keyParams: KeyParams,
    signUpToken: string,
    confirmationCode: string,
    inputOptions: SdkOptions,
  ) {
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
      dependencies,
      options,
      cognitoTokens,
      shortPassword,
      keyParams,
    )
  }

  private static async _confirmSignUp(
    dependencies: StaticDependencies,
    options: ParsedOptions,
    cognitoUserTokens: CognitoUserTokens,
    shortPassword: string,
    keyParams: KeyParams,
  ) {
    if (!keyParams?.encryptedSeed) {
      const passwordHash = WalletStorageService.hashFromString(shortPassword)
      const registerResult = await LegacyNetworkMemberWithFactories._register(dependencies, options, passwordHash)
      const encryptedSeed = registerResult.encryptedSeed
      keyParams = { password: passwordHash, encryptedSeed }
    }

    const keyManagementService = createKeyManagementService(options)
    const { encryptionKey, updatedEncryptedSeed } = await keyManagementService.reencryptSeed(
      cognitoUserTokens.accessToken,
      keyParams,
      !options.otherOptions.skipBackupEncryptedSeed,
    )

    const userData = withDidData({
      encryptedSeed: updatedEncryptedSeed,
      password: encryptionKey,
    })

    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens }, dependencies, options)
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
  static async confirmSignUp(
    dependencies: StaticDependencies,
    signUpToken: string,
    confirmationCode: string,
    inputOptions: SdkOptions,
  ) {
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
      dependencies,
      options,
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
  static async signIn(login: string, inputOptions: SdkOptions, messageParameters?: MessageParameters): Promise<string> {
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
  static async confirmSignIn(
    dependencies: StaticDependencies,
    token: string,
    confirmationCode: string,
    options: SdkOptions,
  ): Promise<{ isNew: boolean; commonNetworkMember: LegacyNetworkMemberWithFactories }> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: token },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: SdkOptions, isRequired: true, value: options },
    ])

    // NOTE: loginToken = '{"ChallengeName":"CUSTOM_CHALLENGE","Session":"...","ChallengeParameters":{"USERNAME":"...","email":"..."}}'
    //       signUpToken = 'username::password'
    const isSignUpToken = token.split('::')[1] !== undefined

    if (isSignUpToken) {
      const commonNetworkMember = await LegacyNetworkMemberWithFactories.confirmSignUp(
        dependencies,
        token,
        confirmationCode,
        options,
      )

      return { isNew: true, commonNetworkMember }
    }

    const commonNetworkMember = await LegacyNetworkMemberWithFactories.completeLoginChallenge(
      dependencies,
      token,
      confirmationCode,
      options,
    )

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
  static async fromAccessToken(dependencies: StaticDependencies, accessToken: string, inputOptions: SdkOptions) {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: false, value: accessToken },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const keyManagementService = await createKeyManagementService(options)
    const userData = await keyManagementService.pullUserData(accessToken)
    const cognitoUserTokens = { accessToken }
    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens }, dependencies, options)
  }

  /**
   * @description Logins with access token of Cognito user registered in Affinity
   * @param options - optional parameters for AffinityWallet initialization
   * @returns initialized instance of SDK or throws `COR-9` UnprocessableEntityError,
   * if user is not logged in.
   */
  static async init(dependencies: StaticDependencies, inputOptions: SdkOptions) {
    await ParametersValidator.validate([{ isArray: false, type: SdkOptions, isRequired: true, value: inputOptions }])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const cognitoUserTokens = userManagementService.readUserTokensFromSessionStorage()
    const keyManagementService = createKeyManagementService(options)
    const userData = await keyManagementService.pullUserData(cognitoUserTokens.accessToken)
    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens }, dependencies, options)
  }

  static legacyConstructor(
    dependencies: StaticDependencies,
    password: string,
    encryptedSeed: string,
    inputOptions: SdkOptions,
  ) {
    if (!encryptedSeed || !password) {
      // TODO: implement appropriate error wrapper
      throw new Error('`password` and `encryptedSeed` must be provided!')
    }

    const options = getOptionsFromEnvironment(inputOptions)
    const userData = withDidData({ encryptedSeed, password })
    return new LegacyNetworkMemberWithFactories({ ...userData, cognitoUserTokens: undefined }, dependencies, options)
  }
}
