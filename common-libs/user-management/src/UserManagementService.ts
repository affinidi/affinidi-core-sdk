import { v4 as generateUuid } from 'uuid'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import { profile } from '@affinidi/tools-common'
import { EncryptionService } from '@affinidi/common'
import { CognitoUserTokens, MessageParameters } from './dto'
import { validateUsername } from './validateUsername'
import SdkErrorFromCode from './SdkErrorFromCode'
import { SessionStorageService } from './SessionStorageService'
import {
  CognitoIdentityService,
  CompleteChangeLoginResult,
  CompleteForgotPasswordResult,
  CompleteLoginPasswordlessResult,
  CompleteSignUpResult,
  InitiateChangeLoginResult,
  InitiateForgotPasswordResult,
  InitiateLoginPasswordlessResult,
  LogInWithPasswordResult,
  LogInWithRefreshTokenResult,
  RegistrationStatus,
  ResendSignUpResult,
  SignUpResult,
  UsernameWithAttributes,
} from './CognitoIdentityService'

class DefaultResultError extends Error {
  constructor(result: never) {
    super(`Result '${result}' cannot be handled`)
  }
}

type ConstructorOptions = {
  region: string
  clientId: string
  userPoolId: string
  shouldDisableNameNormalisation?: boolean
}

type ConstructorDependencies = {
  keyStorageApiService: KeyStorageApiService
}
/**
 * @internal
 * Terminology:
 *   - sign up: create a new account
 *   - log in: log into existing account
 *   - log out: the opposite of "log in", closes the current session
 *   - sign in: (passwordless only) sign up if account does not exists, or log in to existing account
 * For passwordless operation:
 *   - initiate: first step (some of these methods return tokens)
 *   - complete: second step (requires confirmation code, and a token if one was returned on first step)
 */
@profile()
export class UserManagementService {
  private _cognitoIdentityService
  private _keyStorageApiService
  private _sessionStorageService
  private _shouldDisableNameNormalisation

  constructor(options: ConstructorOptions, dependencies: ConstructorDependencies) {
    this._keyStorageApiService = dependencies.keyStorageApiService
    this._cognitoIdentityService = new CognitoIdentityService(options)
    this._sessionStorageService = new SessionStorageService(options.userPoolId)
    this._shouldDisableNameNormalisation = options.shouldDisableNameNormalisation ?? false
  }

  private async _signUp(
    usernameWithAttributes: UsernameWithAttributes,
    password: string,
    messageParameters?: MessageParameters,
  ): Promise<void> {
    const { login } = usernameWithAttributes
    // to keep backward compatibility, we check if confirmed user exists (throw COR-7) or not before sending otp
    // in previous implementation, when usernames were derived from alias (email / phone),
    // it happens on SignUpResult.ConfirmedUsernameExists (from one email one username)
    const isConfirmedUserExist = await this.doesConfirmedUserExist(login)

    if (isConfirmedUserExist) {
      throw new SdkErrorFromCode('COR-7', { username: login })
    }

    const { username } = usernameWithAttributes
    const result = await this._cognitoIdentityService.trySignUp(usernameWithAttributes, password, messageParameters)

    switch (result) {
      case SignUpResult.Success:
        return
      case SignUpResult.InvalidPassword:
        throw new SdkErrorFromCode('COR-6')
      case SignUpResult.ConfirmedUsernameExists:
        throw new SdkErrorFromCode('COR-7', { username })
      case SignUpResult.UnconfirmedUsernameExists:
        await this._keyStorageApiService.adminDeleteUnconfirmedUser({ username })
        return this._signUp(usernameWithAttributes, password, messageParameters)
      default:
        throw new DefaultResultError(result)
    }
  }

  async signUpWithUsernameAndConfirm(username: string, password: string) {
    this._loginShouldBeUsername(username)
    const usernameWithAttributes = this._buildUserAttributes(username, username)

    if (!password) {
      throw new Error(`Expected non-empty password for '${username}'`)
    }

    await this._signUp(usernameWithAttributes, password)
    await this._keyStorageApiService.adminConfirmUser({ username })
    const cognitoTokens = await this._logInWithPassword(username, password, true)
    return cognitoTokens
  }

  async initiateSignUpWithEmailOrPhone(
    login: string,
    password: string,
    messageParameters?: MessageParameters,
    key?: string,
  ) {
    this._loginShouldBeEmailOrPhoneNumber(login)
    const usernameWithAttributes = this._buildUserAttributes(login)
    const _password = key ? await EncryptionService.encrypt(password, key) : password

    await this._signUp(usernameWithAttributes, password, messageParameters)
    const signUpToken = `${usernameWithAttributes.username}::${_password}`

    return signUpToken
  }

  private async _completeSignUp(login: string, confirmationCode: string) {
    const usernameWithAttributes = this._buildUserAttributes(login, login)
    const result = await this._cognitoIdentityService.completeSignUp(usernameWithAttributes, confirmationCode)
    switch (result) {
      case CompleteSignUpResult.Success:
        return
      case CompleteSignUpResult.ConfirmationCodeExpired:
        throw new SdkErrorFromCode('COR-2', { username: login, confirmationCode })
      case CompleteSignUpResult.ConfirmationCodeWrong:
        throw new SdkErrorFromCode('COR-5', { username: login, confirmationCode })
      case CompleteSignUpResult.UserNotFound:
        throw new SdkErrorFromCode('COR-4', { username: login })
      case CompleteSignUpResult.DoubleConfirmation:
        throw new SdkErrorFromCode('UM-1', { username: login, confirmationCode })
      case CompleteSignUpResult.AliasExistsException:
        throw new SdkErrorFromCode('UM-3', { username: login })
      default:
        throw new DefaultResultError(result)
    }
  }

  private async _logInWithPassword(login: string, password: string, isSignUpFlow: boolean) {
    const response = await this._cognitoIdentityService.tryLogInWithPassword(login, password)
    if (response.result !== LogInWithPasswordResult.Success) {
      switch (response.result) {
        case LogInWithPasswordResult.UserNotConfirmed:
          throw new SdkErrorFromCode('COR-16', { username: login })
        case LogInWithPasswordResult.UserNotFound:
          throw new SdkErrorFromCode('COR-4', { username: login })
        default:
          throw new DefaultResultError(response)
      }
    }

    if (!isSignUpFlow && response.registrationStatus === RegistrationStatus.Incomplete) {
      await this.adminDeleteIncompleteUser(response.cognitoTokens)
      throw new SdkErrorFromCode('COR-26')
    }

    this._sessionStorageService.saveUserTokens(response.cognitoTokens)
    return response.cognitoTokens
  }

  private async doesUserExist(value: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(value)
    const field = isEmailValid ? 'email' : isPhoneNumberValid ? 'phone_number' : 'username'
    return this._keyStorageApiService.doesUserExist({ field, value })
  }

  async logInWithPassword(login: string, password: string) {
    return this._logInWithPassword(login, password, false)
  }

  async logInWithRefreshToken(refreshToken: string) {
    const response = await this._cognitoIdentityService.logInWithRefreshToken(refreshToken)
    if (response.result === LogInWithRefreshTokenResult.Success) {
      this._sessionStorageService.saveUserTokens(response.cognitoTokens)
      return response.cognitoTokens
    }

    if (response.result === LogInWithRefreshTokenResult.NotAuthorizedException) throw new SdkErrorFromCode('COR-27')

    throw new DefaultResultError(response)
  }

  private parseSignUpToken(token: string) {
    const [login, shortPassword] = token.split('::')
    return { login, shortPassword }
  }

  async completeSignUpForEmailOrPhone(token: string, confirmationCode: string, key?: string) {
    const { login, shortPassword } = this.parseSignUpToken(token)
    const password = key ? EncryptionService.decrypt(shortPassword, key) : shortPassword
    await this._completeSignUp(login, confirmationCode)
    const cognitoTokens = await this._logInWithPassword(login, password, true)
    return { cognitoTokens, shortPassword }
  }

  /**
   * Uses an ep on KeysService to check if record exists or not for given username or alias (email / phone)
   * @param login
   */
  async doesUnconfirmedUserExist(login: string) {
    const { userExists, isUnconfirmed } = await this.doesUserExist(login)

    return userExists && isUnconfirmed
  }

  /**
   * Uses login with wrong password approach, due to for login we can use aliases (email / phone)
   * @param login
   */
  async doesConfirmedUserExist(login: string) {
    return this._cognitoIdentityService.doesConfirmedUserExist(login)
  }

  async initiateLogInPasswordless(login: string, messageParameters?: MessageParameters): Promise<string> {
    this._loginShouldBeEmailOrPhoneNumber(login)

    if (messageParameters) {
      await this._keyStorageApiService.storeTemplate({
        username: login,
        template: messageParameters.message,
        subject: messageParameters.subject,
        htmlTemplate: messageParameters.htmlMessage,
      })
    }

    const response = await this._cognitoIdentityService.initiateLogInPasswordless(login, messageParameters)
    switch (response.result) {
      case InitiateLoginPasswordlessResult.Success:
        return response.token
      case InitiateLoginPasswordlessResult.UserNotFound:
        throw new SdkErrorFromCode('COR-4', { username: login })
      default:
        throw new DefaultResultError(response)
    }
  }

  async completeLogInPasswordless(token: string, confirmationCode: string): Promise<CognitoUserTokens> {
    const response = await this._cognitoIdentityService.completeLogInPasswordless(token, confirmationCode)
    if (response.result !== CompleteLoginPasswordlessResult.Success) {
      switch (response.result) {
        case CompleteLoginPasswordlessResult.AttemptsExceeded:
          throw new SdkErrorFromCode('COR-13')
        case CompleteLoginPasswordlessResult.ConfirmationCodeExpired:
          throw new SdkErrorFromCode('COR-17', { confirmationCode })
        case CompleteLoginPasswordlessResult.ConfirmationCodeWrong:
          throw new SdkErrorFromCode('COR-5', { newToken: response.token })
        default:
          throw new DefaultResultError(response as never)
      }
    }

    if (response.registrationStatus === RegistrationStatus.Incomplete) {
      await this.adminDeleteIncompleteUser(response.cognitoTokens)
      throw new SdkErrorFromCode('COR-26')
    }

    this._sessionStorageService.saveUserTokens(response.cognitoTokens)
    return response.cognitoTokens
  }

  private async refreshUserSessionTokens(refreshToken: string) {
    try {
      const operationResult = await this._cognitoIdentityService.logInWithRefreshToken(refreshToken)
      if (operationResult.result !== LogInWithRefreshTokenResult.Success) throw new Error()
      this._sessionStorageService.saveUserTokens(operationResult.cognitoTokens)
      return operationResult.cognitoTokens
    } catch (error) {
      throw new SdkErrorFromCode('COR-9')
    }
  }

  async logOut(cognitoTokens: CognitoUserTokens) {
    let newTokens = cognitoTokens

    if (cognitoTokens) {
      const { expiresIn, refreshToken } = cognitoTokens

      const isAccessTokenExpired = Date.now() > expiresIn

      if (isAccessTokenExpired) {
        newTokens = await this.refreshUserSessionTokens(refreshToken)
      }

      const { accessToken } = newTokens

      await this._keyStorageApiService.adminLogOutUser({ accessToken })
    }

    this._sessionStorageService.clearUserTokens()

    return newTokens
  }

  async initiateForgotPassword(login: string, messageParameters?: MessageParameters): Promise<void> {
    this._loginShouldBeEmailOrPhoneNumber(login)
    const result = await this._cognitoIdentityService.initiateForgotPassword(login, messageParameters)
    switch (result) {
      case InitiateForgotPasswordResult.Success:
        return
      case InitiateForgotPasswordResult.UserNotFound:
        throw new SdkErrorFromCode('COR-4', { username: login })
      default:
        throw new DefaultResultError(result)
    }
  }

  async completeForgotPassword(login: string, confirmationCode: string, newPassword: string): Promise<void> {
    this._loginShouldBeEmailOrPhoneNumber(login)
    const result = await this._cognitoIdentityService.completeForgotPassword(login, confirmationCode, newPassword)
    switch (result) {
      case CompleteForgotPasswordResult.Success:
        return
      case CompleteForgotPasswordResult.ConfirmationCodeExpired:
        throw new SdkErrorFromCode('COR-2', { username: login, confirmationCode })
      case CompleteForgotPasswordResult.ConfirmationCodeWrong:
        throw new SdkErrorFromCode('COR-5', { username: login, confirmationCode })
      case CompleteForgotPasswordResult.NewPasswordInvalid:
        throw new SdkErrorFromCode('COR-6')
      case CompleteForgotPasswordResult.UserNotFound:
        throw new SdkErrorFromCode('COR-4', { username: login })
      default:
        throw new DefaultResultError(result)
    }
  }

  async resendSignUpByLogin(login: string, messageParameters?: MessageParameters): Promise<void> {
    const usernameWithAttributes = this._buildUserAttributes(login)
    const result = await this._cognitoIdentityService.resendSignUp(usernameWithAttributes, messageParameters)
    switch (result) {
      case ResendSignUpResult.Success:
        return
      case ResendSignUpResult.UserAlreadyConfirmed:
        throw new SdkErrorFromCode('COR-8', { username: login })
      case ResendSignUpResult.UserNotFound:
        throw new SdkErrorFromCode('COR-4', { username: login })
      default:
        throw new DefaultResultError(result)
    }
  }

  async resendSignUpByToken(signUpToken: string, messageParameters?: MessageParameters): Promise<void> {
    const { login } = this.parseSignUpToken(signUpToken)
    return this.resendSignUpByLogin(login, messageParameters)
  }

  private async _withStoredTokens(
    cognitoTokens: CognitoUserTokens | undefined,
    action: (newTokens: CognitoUserTokens) => Promise<void>,
  ): Promise<CognitoUserTokens> {
    const newTokens = cognitoTokens ?? this._sessionStorageService.readUserTokens()
    await action(newTokens)
    return newTokens
  }

  async changePassword(cognitoTokens: CognitoUserTokens, previousPassword: string, proposedPassword: string) {
    return this._withStoredTokens(cognitoTokens, async ({ accessToken }) => {
      await this._cognitoIdentityService.changePassword(accessToken, previousPassword, proposedPassword)
    })
  }

  async initiateChangeLogin(cognitoTokens: CognitoUserTokens, newLogin: string, messageParameters?: MessageParameters) {
    return this._withStoredTokens(cognitoTokens, async ({ accessToken }) => {
      this._loginShouldBeEmailOrPhoneNumber(newLogin)
      const result = await this._cognitoIdentityService.initiateChangeAttributes(
        accessToken,
        this._buildUserAttributes(newLogin),
        messageParameters,
      )
      switch (result) {
        case InitiateChangeLoginResult.Success:
          return
        case InitiateChangeLoginResult.NewLoginExists:
          throw new SdkErrorFromCode('COR-7', { username: newLogin })
        default:
          throw new DefaultResultError(result)
      }
    })
  }

  async completeChangeLogin(cognitoTokens: CognitoUserTokens, newLogin: string, confirmationCode: string) {
    return this._withStoredTokens(cognitoTokens, async ({ accessToken }) => {
      this._loginShouldBeEmailOrPhoneNumber(newLogin)
      const { isEmailValid } = validateUsername(newLogin)
      const result = isEmailValid
        ? await this._cognitoIdentityService.completeChangeEmail(accessToken, confirmationCode)
        : await this._cognitoIdentityService.completeChangePhone(accessToken, confirmationCode)

      switch (result) {
        case CompleteChangeLoginResult.Success:
          return
        case CompleteChangeLoginResult.ConfirmationCodeExpired:
          throw new SdkErrorFromCode('COR-2', { confirmationCode })
        case CompleteChangeLoginResult.ConfirmationCodeWrong:
          throw new SdkErrorFromCode('COR-5', { confirmationCode })
        default:
          throw new DefaultResultError(result)
      }
    })
  }

  public async markRegistrationComplete(cognitoTokens: CognitoUserTokens) {
    await this._withStoredTokens(cognitoTokens, ({ accessToken }) => {
      return this._cognitoIdentityService.markRegistrationComplete(accessToken)
    })
  }

  public async adminDeleteIncompleteUser(cognitoTokens: CognitoUserTokens) {
    await this._withStoredTokens(cognitoTokens, async ({ accessToken }) => {
      await this._keyStorageApiService.adminDeleteIncompleteUser({ accessToken })
    })
  }

  public readUserTokensFromSessionStorage() {
    return this._sessionStorageService.readUserTokens()
  }

  private _loginShouldBeEmailOrPhoneNumber(login: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(login)

    if (!isEmailValid && !isPhoneNumberValid) {
      throw new SdkErrorFromCode('COR-3', { username: login })
    }
  }

  private _loginShouldBeUsername(login: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(login)

    if (isEmailValid || isPhoneNumberValid) {
      throw new SdkErrorFromCode('COR-3', { username: login })
    }
  }

  /**
   * Builds user attributes for cognito record.
   * Result username is derived from login input parameter or random (based on usernameBuildingStrategy)
   * OR if exactUsername provided equals to that
   * @param login (arbitrary username, email or phone)
   * @param exactUsername - optional parameter, if given the result username is eq to this parameter
   * @private
   */
  private _buildUserAttributes(login: string, exactUsername?: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(login)
    const builtUsername = generateUuid()

    return {
      username: exactUsername ?? builtUsername,
      login,
      emailAddress: isEmailValid ? login : undefined,
      phoneNumber: isPhoneNumberValid ? login : undefined,
    }
  }
}
