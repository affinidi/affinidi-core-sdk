import { profile } from '@affinidi/tools-common'

import WalletStorageService from '../services/WalletStorageService'
import { withDidData } from '../shared/getDidData'
import {
  CognitoUserTokens,
  KeyParams,
  KeyParamsOrOptions,
  KeyOptions,
  MessageParameters,
  SdkOptions,
} from '../dto/shared.dto'
import { ParametersValidator } from '../shared/ParametersValidator'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import {
  BaseNetworkMember,
  StaticDependencies,
  ConstructorUserData,
  createKeyManagementService,
} from './BaseNetworkMember'
import { createUserManagementService } from '../shared/createUserManagementService'
import { generatePassword } from '../shared/generatePassword'
import { normalizeShortPassword } from '../shared/normalizeShortPassword'

type UserDataWithCognito = ConstructorUserData & {
  cognitoUserTokens: CognitoUserTokens
}

@profile()
export class NetworkMemberWithCognito extends BaseNetworkMember {
  private readonly _userManagementService
  protected cognitoUserTokens: CognitoUserTokens

  constructor(userData: UserDataWithCognito, dependencies: StaticDependencies, options: ParsedOptions) {
    super(userData, dependencies, options)
    this._userManagementService = createUserManagementService(options)
    this.cognitoUserTokens = userData.cognitoUserTokens
  }

  private static _isKeyParams(keyParamsOrOptions?: KeyParamsOrOptions): keyParamsOrOptions is KeyParams {
    return !!keyParamsOrOptions && 'encryptedSeed' in keyParamsOrOptions
  }

  private static _shouldCallAfterConfirmSignUp(keyParamsOrOptions?: KeyParamsOrOptions) {
    return !NetworkMemberWithCognito._isKeyParams(keyParamsOrOptions)
  }

  private static async _createKeyParams(
    dependencies: StaticDependencies,
    options: ParsedOptions,
    shortPassword: string,
    keyParamsOrOptions?: KeyParamsOrOptions,
  ) {
    if (NetworkMemberWithCognito._isKeyParams(keyParamsOrOptions)) {
      return keyParamsOrOptions
    }

    return await NetworkMemberWithCognito._createSignUpKeys(dependencies, options, shortPassword, keyParamsOrOptions)
  }

  private static _createKeyParamsOrOptionsValidator(keyParamsOrOptions?: KeyParamsOrOptions) {
    if (!keyParamsOrOptions || NetworkMemberWithCognito._isKeyParams(keyParamsOrOptions)) {
      return { isArray: false, type: KeyParams, isRequired: false, value: keyParamsOrOptions }
    }

    return { isArray: false, type: KeyOptions, isRequired: true, value: keyParamsOrOptions }
  }

  private static _validateKeyParamsOrOptions(keyParamsOrOptions?: KeyParamsOrOptions) {
    if (NetworkMemberWithCognito._isKeyParams(keyParamsOrOptions)) {
      NetworkMemberWithCognito._validateKeys(keyParamsOrOptions)
    }
  }

  /**
   * @description Initiates passwordless login to Affinity
   * @param options - parameters with specified environment
   * @param login - email/phoneNumber, registered in Cognito
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token
   */
  public static async initiateLogInPasswordless(
    inputOptions: SdkOptions,
    login: string,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    return await userManagementService.initiateLogInPasswordless(login, messageParameters)
  }

  /**
   * @description Completes login
   * @param options - parameters for BaseNetworkMember initialization
   * @param token - returned by initiateLogInPasswordless
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @returns initialized instance of SDK
   */
  public static async completeLogInPasswordless(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    token: string,
    confirmationCode: string,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: token },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.completeLogInPasswordless(token, confirmationCode)
    const userData = await keyManagementService.pullUserData(cognitoUserTokens.accessToken)
    return new NetworkMemberWithCognito({ ...userData, cognitoUserTokens }, dependencies, options)
  }

  /**
   * @description Signs out current user
   */
  public async logOut(): Promise<void> {
    const newTokens = await this._userManagementService.logOut(this.cognitoUserTokens)
    this.cognitoUserTokens = newTokens
  }

  /**
   * @description Initiates reset password flow
   * @param options - parameters with specified environment
   * @param login - email/phoneNumber, registered in Cognito
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token to be used with completeForgotPassword
   */
  public static async initiateForgotPassword(
    inputOptions: SdkOptions,
    login: string,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: login },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    await userManagementService.initiateForgotPassword(login, messageParameters)
    return JSON.stringify({ login })
  }

  /**
   * @description Completes reset password flow
   * @param options - parameters with specified environment
   * @param forgotPasswordToken - token returned by initiateForgotPassword
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @param newPassword - new password
   * @returns initialized instance of SDK
   */
  public static async completeForgotPassword(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    forgotPasswordToken: string,
    confirmationCode: string,
    newPassword: string,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: forgotPasswordToken },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      { isArray: false, type: 'string', isRequired: true, value: newPassword },
    ])

    const { login } = JSON.parse(forgotPasswordToken)
    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    await userManagementService.completeForgotPassword(login, confirmationCode, newPassword)
    return await NetworkMemberWithCognito._logInWithPassword(dependencies, options, login, newPassword)
  }

  /**
   * @description Logins to Affinity with login and password
   * @param options - optional parameters for BaseNetworkMember initialization
   * @param login - arbitrary username or email or phone number, registered in Cognito
   * @param password - password for Cognito user
   * @returns initialized instance of SDK
   */
  public static async logInWithPassword(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    username: string,
    password: string,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    return await NetworkMemberWithCognito._logInWithPassword(dependencies, options, username, password)
  }

  private static async _logInWithPassword(
    dependencies: StaticDependencies,
    options: ParsedOptions,
    username: string,
    inputPassword: string,
  ) {
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const password = normalizeShortPassword(inputPassword, username)
    const cognitoUserTokens = await userManagementService.logInWithPassword(username, password)
    const userData = await keyManagementService.pullUserData(cognitoUserTokens.accessToken)
    return new NetworkMemberWithCognito({ ...userData, cognitoUserTokens }, dependencies, options)
  }

  /**
   * @description Initiates sign up flow to Affinity wallet, optionally with already created did
   * @param inputOptiosn - parameters with specified environment
   * @param username - arbitrary username
   * @param inputPassword - password
   * @param keyParamsOrOptions (optional) - { encryptedSeed, password } - previously created keys to be stored at wallet
   * @returns initialized instance of SDK
   */
  public static async signUpWithUsername(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    username: string,
    inputPassword: string,
    keyParamsOrOptions?: KeyParamsOrOptions,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: inputPassword },
      NetworkMemberWithCognito._createKeyParamsOrOptionsValidator(keyParamsOrOptions),
    ])

    NetworkMemberWithCognito._validateKeyParamsOrOptions(keyParamsOrOptions)

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const password = normalizeShortPassword(inputPassword, username)
    const cognitoTokens = await userManagementService.signUpWithUsernameAndConfirm(username, password)
    return NetworkMemberWithCognito._confirmSignUp(dependencies, options, cognitoTokens, password, keyParamsOrOptions)
  }

  private static async _initiateSignUpByEmailOrPhone(
    inputOptions: SdkOptions,
    login: string,
    inputPassword?: string,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: login },
      { isArray: false, type: 'password', isRequired: false, value: inputPassword },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const password = normalizeShortPassword(inputPassword || (await generatePassword()), login)
    return userManagementService.initiateSignUpWithEmailOrPhone(login, password, messageParameters)
  }

  /**
   * @description Initiates sign up flow
   * @param options - parameters with specified environment
   * @param email - email address
   * @param password (optional) - if not provided, a random password will be generated
   * @param messageParameters (optional) - parameters with specified welcome message
   * @returns token
   */
  public static async initiateSignUpByEmail(
    inputOptions: SdkOptions,
    email: string,
    password?: string,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    return NetworkMemberWithCognito._initiateSignUpByEmailOrPhone(inputOptions, email, password, messageParameters)
  }

  /**
   * @description Initiates sign up flow
   * @param options - parameters with specified environment
   * @param phone - phone number
   * @param password (optional) - if not provided, a random password will be generated
   * @param messageParameters (optional) - parameters with specified welcome message
   * @returns token
   */
  public static async initiateSignUpByPhone(
    inputOptions: SdkOptions,
    phone: string,
    password?: string,
    messageParameters?: MessageParameters,
  ): Promise<string> {
    return NetworkMemberWithCognito._initiateSignUpByEmailOrPhone(inputOptions, phone, password, messageParameters)
  }

  /**
   * @description Completes sign up flow, optionally with already created did
   *       (as result created keys will be stored at the Affinity Wallet)
   * @param options - optional parameters for BaseNetworkMember initialization
   * @param token - Token returned by initiateSignUp method.
   * @param confirmationCode - OTP sent by AWS Cognito/SES.
   * @param keyParamsOrOptions (optional) - { encryptedSeed, password } - previously created keys to be stored at wallet.
   * @returns initialized instance of SDK
   */
  public static async completeSignUp(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    signUpToken: string,
    confirmationCode: string,
    keyParamsOrOptions?: KeyParamsOrOptions,
  ) {
    ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: signUpToken },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
      NetworkMemberWithCognito._createKeyParamsOrOptionsValidator(keyParamsOrOptions),
    ])

    NetworkMemberWithCognito._validateKeyParamsOrOptions(keyParamsOrOptions)

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const { cognitoTokens, shortPassword } = await userManagementService.completeSignUpForEmailOrPhone(
      signUpToken,
      confirmationCode,
    )
    return NetworkMemberWithCognito._confirmSignUp(
      dependencies,
      options,
      cognitoTokens,
      shortPassword,
      keyParamsOrOptions,
    )
  }

  private static async _createSignUpKeys(
    dependencies: StaticDependencies,
    options: ParsedOptions,
    shortPassword: string,
    keyOptions?: KeyOptions,
  ) {
    const passwordHash = WalletStorageService.hashFromString(shortPassword)
    const registerResult = await NetworkMemberWithCognito._register(dependencies, options, passwordHash, keyOptions)
    const encryptedSeed = registerResult.encryptedSeed
    return { password: passwordHash, encryptedSeed }
  }

  private static async _confirmSignUp(
    dependencies: StaticDependencies,
    options: ParsedOptions,
    cognitoUserTokens: CognitoUserTokens,
    shortPassword?: string,
    inputKeyParamsOrOptions?: KeyParamsOrOptions,
  ) {
    const keyManagementService = createKeyManagementService(options)
    const { encryptionKey, updatedEncryptedSeed } = await keyManagementService.reencryptSeed(
      cognitoUserTokens.accessToken,
      await NetworkMemberWithCognito._createKeyParams(dependencies, options, shortPassword, inputKeyParamsOrOptions),
      !options.otherOptions.skipBackupEncryptedSeed,
    )

    const userData = withDidData({
      encryptedSeed: updatedEncryptedSeed,
      password: encryptionKey,
    })

    const result = new NetworkMemberWithCognito({ ...userData, cognitoUserTokens }, dependencies, options)
    if (NetworkMemberWithCognito._shouldCallAfterConfirmSignUp(inputKeyParamsOrOptions)) {
      result.afterConfirmSignUp()
    }

    return result
  }

  private async afterConfirmSignUp() {
    const { idToken } = this.cognitoUserTokens

    if (this._options.otherOptions.issueSignupCredential) {
      const {
        basicOptions: { env, keyStorageUrl, issuerUrl },
        accessApiKey,
      } = this._options
      const credentialOfferToken = await WalletStorageService.getCredentialOffer(idToken, keyStorageUrl, {
        env,
        accessApiKey,
      })

      const credentialOfferResponseToken = await this.createCredentialOfferResponseToken(credentialOfferToken)

      const signedCredentials = await WalletStorageService.getSignedCredentials(idToken, credentialOfferResponseToken, {
        accessApiKey,
        issuerUrl,
        keyStorageUrl,
      })

      await this.saveCredentials(signedCredentials)
    }
  }

  /**
   * @description Resends OTP for sign up flow
   * @param inputOptions - parameters with specified environment
   * @param signUpToken - token returned by `initiateSignUp...`
   * @param messageParameters (optional) - parameters with specified welcome message
   */
  public static async resendSignUp(
    inputOptions: SdkOptions,
    signUpToken: string,
    messageParameters?: MessageParameters,
  ): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: signUpToken },
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    await userManagementService.resendSignUpByToken(signUpToken, messageParameters)
  }

  /**
   * @description Initiates passwordless sign in of an existing user,
   * or signs up a new one, if user was not registered
   * @param options - optional parameters with specified environment
   * @param username - email or phone number
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token
   */
  public static async initiateSignInPasswordless(
    inputOptions: SdkOptions,
    login: string,
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
      return JSON.stringify({
        signInType: 'logIn',
        logInToken: await userManagementService.initiateLogInPasswordless(login, messageParameters),
      })
    } else {
      const password = normalizeShortPassword(await generatePassword(), login)
      return JSON.stringify({
        signInType: 'signUp',
        signUpToken: await userManagementService.initiateSignUpWithEmailOrPhone(login, password, messageParameters),
      })
    }
  }

  /**
   * @description Completes sign in
   * @param options - optional parameters for BaseNetworkMember initialization
   * @param token - received from #signIn method
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
   */
  public static async completeSignInPasswordless(
    dependencies: StaticDependencies,
    options: SdkOptions,
    signInToken: string,
    confirmationCode: string,
  ): Promise<{ isNew: boolean; wallet: NetworkMemberWithCognito }> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: options },
      { isArray: false, type: 'string', isRequired: true, value: signInToken },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
    ])

    const token = JSON.parse(signInToken)
    switch (token.signInType) {
      case 'logIn':
        return {
          isNew: false,
          wallet: await this.completeLogInPasswordless(dependencies, options, token.logInToken, confirmationCode),
        }
      case 'signUp':
        return {
          isNew: true,
          wallet: await this.completeSignUp(dependencies, options, token.signUpToken, confirmationCode),
        }
      default:
        throw new Error(`Incorrect token type '${token.signInType}'`)
    }
  }

  /**
   * @description Initiates change user password   * @param options - parameters with specified environment
   * @param oldPassword
   * @param newPassword
   */
  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: oldPassword },
      { isArray: false, type: 'string', isRequired: true, value: newPassword },
    ])

    this.cognitoUserTokens = await this._userManagementService.changePassword(
      this.cognitoUserTokens,
      oldPassword,
      newPassword,
    )
  }

  private async _initiateChangeEmailOrPhone(newLogin: string, messageParameters?: MessageParameters): Promise<string> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: newLogin },
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    this.cognitoUserTokens = await this._userManagementService.initiateChangeLogin(
      this.cognitoUserTokens,
      newLogin,
      messageParameters,
    )

    return JSON.stringify({ newLogin })
  }

  /**
   * @description Initiates change user attribute (email) flow
   * @param email - new email
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token to be used with completeChangeEmailOrPhone
   */
  public async initiateChangeEmail(email: string, messageParameters?: MessageParameters): Promise<string> {
    return this._initiateChangeEmailOrPhone(email, messageParameters)
  }

  /**
   * @description Initiates change user attribute (email) flow
   * @param phone - new phone
   * @param messageParameters - optional parameters with specified welcome message
   * @returns token to be used with completeChangeEmailOrPhone
   */
  public async initiateChangePhone(phone: string, messageParameters?: MessageParameters): Promise<string> {
    return this._initiateChangeEmailOrPhone(phone, messageParameters)
  }

  /**
   * @description Completes change user attribute (email/phoneNumber) flow
   * @param changeEmailOrPhoneToken - token returned by initiateChangePhone or initiateChangeEmail method
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   */
  public async completeChangeEmailOrPhone(changeEmailOrPhoneToken: string, confirmationCode: string): Promise<void> {
    await ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: changeEmailOrPhoneToken },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
    ])

    const { newLogin } = JSON.parse(changeEmailOrPhoneToken)
    this.cognitoUserTokens = await this._userManagementService.completeChangeLogin(
      this.cognitoUserTokens,
      newLogin,
      confirmationCode,
    )
  }

  /**
   * @description Serialized the essential data to string that could be later used by `deserialize`
   * @returns string
   */
  public serializeSession() {
    return JSON.stringify(this.cognitoUserTokens)
  }

  /**
   * @description Creates a new instance of SDK from string returned by `serialize`
   * @param options - parameters for AffinityWallet initialization
   * @param serializedNetworkMember
   * @returns initialized instance of SDK
   */
  public static async deserializeSession(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    serializedSession: string,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: serializedSession },
    ])

    const cognitoUserTokens = JSON.parse(serializedSession)
    const options = getOptionsFromEnvironment(inputOptions)
    const keyManagementService = await createKeyManagementService(options)
    const userData = await keyManagementService.pullUserData(cognitoUserTokens.accessToken)
    return new NetworkMemberWithCognito({ ...userData, cognitoUserTokens }, dependencies, options)
  }
}
