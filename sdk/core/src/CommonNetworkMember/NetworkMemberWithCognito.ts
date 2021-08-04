import { KeysService, profile } from '@affinidi/common'
import { EventComponent } from '@affinidi/affinity-metrics-lib'

import WalletStorageService from '../services/WalletStorageService'
import {
  CognitoUserTokens,
  KeyParams,
  KeyParamsOrOptions,
  KeyOptions,
  MessageParameters,
  SdkOptions,
} from '../dto/shared.dto'
import { AffinidiCommonConstructor, IPlatformEncryptionTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import UserManagementService from '../services/UserManagementService'
import { BaseNetworkMember, createKeyManagementService } from './BaseNetworkMember'
import { Util } from './Util'

type GenericConstructor<T> = new (
  password: string,
  encryptedSeed: string,
  options: ParsedOptions,
  cognitoUserTokens: CognitoUserTokens,
) => T
type Constructor<T> = GenericConstructor<T> & GenericConstructor<NetworkMemberWithCognito>
type AbstractStaticMethods = Record<never, never>
type ConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new (...args: unknown[]) => unknown ? P : never
}[keyof T]
type OmitConstructor<T> = Omit<T, ConstructorKeys<T>>
type DerivedTypeForOptions<TInstance> = Constructor<TInstance> &
  AbstractStaticMethods &
  OmitConstructor<typeof NetworkMemberWithCognito>
type DerivedType<T extends DerivedType<T>> = DerivedTypeForOptions<InstanceType<T>>
export type UniversalDerivedType = DerivedType<DerivedTypeForOptions<NetworkMemberWithCognito>>

const createUserManagementService = ({ basicOptions, accessApiKey }: ParsedOptions) => {
  return new UserManagementService({ ...basicOptions, accessApiKey })
}

@profile()
export abstract class NetworkMemberWithCognito extends BaseNetworkMember {
  private readonly _userManagementService
  protected cognitoUserTokens: CognitoUserTokens

  constructor(
    password: string,
    encryptedSeed: string,
    platformEncryptionTools: IPlatformEncryptionTools,
    affinidiCommon: AffinidiCommonConstructor | null,
    options: ParsedOptions,
    component: EventComponent,
    cognitoUserTokens: CognitoUserTokens,
  ) {
    super(password, encryptedSeed, platformEncryptionTools, affinidiCommon, options, component)
    this._userManagementService = createUserManagementService(options)
    this.cognitoUserTokens = cognitoUserTokens
  }

  private static _shouldCallAfterConfirmSignUp(keyParamsOrOptions?: KeyParamsOrOptions) {
    return !keyParamsOrOptions
  }

  private static async _createKeyParams(
    options: ParsedOptions,
    platformEncryptionTools: IPlatformEncryptionTools,
    shortPassword: string,
    keyParamsOrOptions?: KeyParamsOrOptions,
  ) {
    if (!keyParamsOrOptions) {
      return await NetworkMemberWithCognito._createSignUpKeys(shortPassword, options)
    }

    if ('encryptedSeed' in keyParamsOrOptions) {
      return keyParamsOrOptions
    }

    return await NetworkMemberWithCognito._createKeyParamsForOptions(
      platformEncryptionTools,
      shortPassword,
      keyParamsOrOptions,
    )
  }

  /**
   * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
   */
  private static _createKeyParamsOrOptionsValidator(keyParamsOrOptions?: KeyParamsOrOptions) {
    if (!keyParamsOrOptions || 'encryptedSeed' in keyParamsOrOptions) {
      return { isArray: false, type: KeyParams, isRequired: false, value: keyParamsOrOptions }
    }

    return { isArray: false, type: KeyOptions, isRequired: true, value: keyParamsOrOptions }
  }

  /**
   * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
   */
  private static _validateKeyParamsOrOptions(keyParamsOrOptions?: KeyParamsOrOptions) {
    if (!!keyParamsOrOptions && 'encryptedSeed' in keyParamsOrOptions) {
      NetworkMemberWithCognito._validateKeys(keyParamsOrOptions)
    }
  }

  /**
   * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
   */
  private static async _createKeyParamsForOptions(
    platformEncryptionTools: IPlatformEncryptionTools,
    shortPassword: string,
    keyOptions: KeyOptions,
  ) {
    if (!keyOptions.keyTypes?.length) {
      throw new Error('keyTypes is empty')
    }

    const keysSeedSection = platformEncryptionTools.buildExternalKeysSectionForSeed(keyOptions.keyTypes)

    const seed = await Util.generateSeed('elem')
    const seedHex = seed.toString('hex')
    const fullSeed = `${seedHex}++${'elem'}++${keysSeedSection}`

    const encryptedSeed = await KeysService.encryptSeed(fullSeed, KeysService.normalizePassword(shortPassword))
    return { encryptedSeed, password: shortPassword }
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
  public static async completeLogInPasswordless<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    token: string,
    confirmationCode: string,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: token },
      { isArray: false, type: 'confirmationCode', isRequired: true, value: confirmationCode },
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
  public static async completeForgotPassword<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    forgotPasswordToken: string,
    confirmationCode: string,
    newPassword: string,
  ): Promise<InstanceType<T>> {
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
    return await NetworkMemberWithCognito._logInWithPassword(this, options, login, newPassword)
  }

  /**
   * @description Logins to Affinity with login and password
   * @param options - optional parameters for BaseNetworkMember initialization
   * @param login - arbitrary username or email or phone number, registered in Cognito
   * @param password - password for Cognito user
   * @returns initialized instance of SDK
   */
  public static async logInWithPassword<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    username: string,
    password: string,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    return await NetworkMemberWithCognito._logInWithPassword(this, options, username, password)
  }

  private static async _logInWithPassword<T extends DerivedType<T>>(
    self: T,
    options: ParsedOptions,
    username: string,
    password: string,
  ): Promise<InstanceType<T>> {
    const userManagementService = createUserManagementService(options)
    const keyManagementService = createKeyManagementService(options)
    const cognitoUserTokens = await userManagementService.logInWithPassword(username, password)
    const { accessToken } = cognitoUserTokens
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)
    return new self(encryptionKey, encryptedSeed, options, cognitoUserTokens)
  }

  /**
   * @description Initiates sign up flow to Affinity wallet, optionally with already created did
   * @param inputOptiosn - parameters with specified environment
   * @param username - arbitrary username
   * @param password - password
   * @param keyParams (optional) - { encryptedSeed, password } - previously created keys to be stored at wallet
   * @param messageParameters (optional) - parameters with specified welcome message
   * @returns initialized instance of SDK
   */
  public static async signUpWithUsername<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    platformEncryptionTools: IPlatformEncryptionTools,
    username: string,
    password: string,
    keyParamsOrOptions?: KeyParamsOrOptions,
    messageParameters?: MessageParameters,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: username },
      { isArray: false, type: 'password', isRequired: true, value: password },
      NetworkMemberWithCognito._createKeyParamsOrOptionsValidator(keyParamsOrOptions),
      { isArray: false, type: MessageParameters, isRequired: false, value: messageParameters },
    ])

    NetworkMemberWithCognito._validateKeyParamsOrOptions(keyParamsOrOptions)

    const options = getOptionsFromEnvironment(inputOptions)
    const userManagementService = createUserManagementService(options)
    const cognitoTokens = await userManagementService.signUpWithUsernameAndConfirm(
      username,
      password,
      messageParameters,
    )
    return NetworkMemberWithCognito._confirmSignUp(
      this,
      options,
      platformEncryptionTools,
      cognitoTokens,
      password,
      keyParamsOrOptions,
    )
  }

  private static async _initiateSignUpByEmailOrPhone(
    inputOptions: SdkOptions,
    login: string,
    password?: string,
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
   * @param keyParams (optional) - { encryptedSeed, password } - previously created keys to be stored at wallet.
   * @returns initialized instance of SDK
   */
  public static async completeSignUp<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    platformEncryptionTools: IPlatformEncryptionTools,
    signUpToken: string,
    confirmationCode: string,
    keyParamsOrOptions?: KeyParamsOrOptions,
  ): Promise<InstanceType<T>> {
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
      this,
      options,
      platformEncryptionTools,
      cognitoTokens,
      shortPassword,
      keyParamsOrOptions,
    )
  }

  private static async _createSignUpKeys(shortPassword: string, options: ParsedOptions) {
    const passwordHash = WalletStorageService.hashFromString(shortPassword)
    const registerResult = await NetworkMemberWithCognito._register(passwordHash, options)
    const encryptedSeed = registerResult.encryptedSeed
    return { password: passwordHash, encryptedSeed }
  }

  private static async _confirmSignUp<T extends DerivedType<T>>(
    self: T,
    options: ParsedOptions,
    platformEncryptionTools: IPlatformEncryptionTools,
    cognitoTokens: CognitoUserTokens,
    shortPassword?: string,
    inputKeyParamsOrOptions?: KeyParamsOrOptions,
  ): Promise<InstanceType<T>> {
    const { accessToken } = cognitoTokens

    const keyManagementService = createKeyManagementService(options)
    const { encryptionKey, updatedEncryptedSeed } = await keyManagementService.reencryptSeed(
      accessToken,
      await NetworkMemberWithCognito._createKeyParams(
        options,
        platformEncryptionTools,
        shortPassword,
        inputKeyParamsOrOptions,
      ),
      !options.otherOptions.skipBackupEncryptedSeed,
    )

    const result = new self(encryptionKey, updatedEncryptedSeed, options, cognitoTokens)
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
  public static async initiateSignInPasswordless<T extends DerivedType<T>>(
    this: T,
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
      return JSON.stringify({
        signInType: 'signUp',
        signUpToken: await userManagementService.initiateSignUpWithEmailOrPhone(login, null, messageParameters),
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
  public static async completeSignInPasswordless<T extends DerivedType<T>>(
    this: T,
    options: SdkOptions,
    platformEncryptionTools: IPlatformEncryptionTools,
    signInToken: string,
    confirmationCode: string,
  ): Promise<{ isNew: boolean; wallet: InstanceType<T> }> {
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
          wallet: await this.completeLogInPasswordless(options, token.logInToken, confirmationCode),
        }
      case 'signUp':
        return {
          isNew: true,
          wallet: await this.completeSignUp(options, platformEncryptionTools, token.signUpToken, confirmationCode),
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
  public serialize() {
    return JSON.stringify(this.cognitoUserTokens)
  }

  /**
   * @description Creates a new instance of SDK from string returned by `serialize`
   * @param options - parameters for AffinityWallet initialization
   * @param serializedNetworkMember
   * @returns initialized instance of SDK
   */
  public static async deserialize<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    serializedNetworkMember: string,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: false, value: serializedNetworkMember },
    ])

    const cognitoTokens = JSON.parse(serializedNetworkMember)
    const options = getOptionsFromEnvironment(inputOptions)
    const keyManagementService = await createKeyManagementService(options)
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(cognitoTokens.accessToken)
    return new this(encryptionKey, encryptedSeed, options, cognitoTokens)
  }
}
