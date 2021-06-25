import { profile } from '@affinidi/common'

import { CognitoUserTokens, MessageParameters } from '../dto/shared.dto'
import { validateUsername, SdkError } from '../shared'
import { normalizeShortPassword } from '../shared/normalizeShortPassword'
import { normalizeUsername } from '../shared/normalizeUsername'
import { SessionStorageService } from '../shared/sessionStorageHandler'
import { randomBytes } from '../shared/randomBytes'
import KeyStorageApiService from './KeyStorageApiService'
import CognitoIdentityService, {
  ChangeUsernameResult,
  CompleteLoginChallengeResult,
  ConfirmChangeUsernameResult,
  ConfirmSignUpResult,
  ForgotPasswordConfirmResult,
  ForgotPasswordResult,
  ResendSignUpResult,
  SignInResult,
  SignInWithUsernameResult,
  SignUpResult,
} from './CognitoIdentityService'

const generatePassword = async () => {
  const randomPassword = (await randomBytes(32)).toString('hex')
  // Make first found letter uppercase because hex string doesn't meet password requirements
  return randomPassword.replace(/[a-f]/, 'A')
}

class DefaultResultError extends Error {
  constructor(result: never) {
    super(`Result '${result}' cannot be handled`)
  }
}

type ConstructorOptions = {
  clientId: string
  userPoolId: string
  keyStorageUrl: string
  accessApiKey: string
}

@profile()
export default class UserManagementService {
  private _cognitoIdentityService
  private _keyStorageApiService
  private _sessionStorageService

  constructor(options: ConstructorOptions) {
    this._keyStorageApiService = new KeyStorageApiService(options)
    this._cognitoIdentityService = new CognitoIdentityService(options)
    this._sessionStorageService = new SessionStorageService(options.userPoolId)
  }

  private async _signUp(username: string, password: string, messageParameters: MessageParameters): Promise<void> {
    const { result, normalizedUsername } = await this._cognitoIdentityService.trySignUp(
      username,
      password,
      messageParameters,
    )

    switch (result) {
      case SignUpResult.Success:
        return
      case SignUpResult.InvalidPassword:
        throw new SdkError('COR-6')
      case SignUpResult.ConfirmedUsernameExists:
        throw new SdkError('COR-7', { username: normalizedUsername })
      case SignUpResult.UnconfirmedUsernameExists:
        await this._keyStorageApiService.adminDeleteUnconfirmedUser({ username: normalizedUsername })
        return this._signUp(username, password, messageParameters)
      default:
        throw new DefaultResultError(result)
    }
  }

  async signUp(username: string, inputPassword: string, messageParameters: MessageParameters) {
    const { isUsername } = validateUsername(username)

    if (isUsername && !inputPassword) {
      throw new Error(`Expected non-empty password for '${username}'`)
    }

    const shortPassword = inputPassword || (await generatePassword())
    const password = normalizeShortPassword(shortPassword, username)
    await this._signUp(username, password, messageParameters)
    const token = `${username}::${password}`

    return { token, isUsername }
  }

  private async _confirmSignUpWithAdminOption(username: string, confirmationCode: string) {
    const { isUsername } = validateUsername(username)

    if (isUsername) {
      await this._keyStorageApiService.adminConfirmUser({ username })
      return
    }

    const { result, normalizedUsername } = await this._cognitoIdentityService.confirmSignUp(username, confirmationCode)
    switch (result) {
      case ConfirmSignUpResult.Success:
        return
      case ConfirmSignUpResult.ConfirmationCodeExpired:
        throw new SdkError('COR-2', { username: normalizedUsername, confirmationCode })
      case ConfirmSignUpResult.ConfirmationCodeWrong:
        throw new SdkError('COR-5', { username: normalizedUsername, confirmationCode })
      case ConfirmSignUpResult.UserNotFound:
        throw new SdkError('COR-4', { username: normalizedUsername })
      default:
        throw new DefaultResultError(result)
    }
  }

  async signIn(username: string, shortPassword: string) {
    const password = normalizeShortPassword(shortPassword, username)
    const response = await this._cognitoIdentityService.trySignIn(username, password)

    switch (response.result) {
      case SignInResult.Success:
        this._sessionStorageService.saveUserTokens(response.cognitoTokens)
        return response.cognitoTokens
      case SignInResult.UserNotConfirmed:
        throw new SdkError('COR-16', { username })
      case SignInResult.UserNotFound:
        throw new SdkError('COR-4', { username })
      default:
        throw new DefaultResultError(response)
    }
  }

  async confirmSignUp(token: string, confirmationCode: string) {
    const [username, shortPassword] = token.split('::')

    await this._confirmSignUpWithAdminOption(username, confirmationCode)
    const cognitoTokens = await this.signIn(username, shortPassword)

    return { cognitoTokens, shortPassword }
  }

  async isUserUnconfirmed(username: string) {
    const normalizedUsername = normalizeUsername(username)
    return this._cognitoIdentityService.isUserUnconfirmed(normalizedUsername)
  }

  async signInWithUsername(username: string, messageParameters?: MessageParameters): Promise<string> {
    this._usernameShouldBeEmailOrPhoneNumber(username)

    if (messageParameters) {
      await this._keyStorageApiService.storeTemplate({
        username: username,
        template: messageParameters.message,
        subject: messageParameters.subject,
        htmlTemplate: messageParameters.htmlMessage,
      })
    }

    const response = await this._cognitoIdentityService.signInWithUsername(username, messageParameters)
    switch (response.result) {
      case SignInWithUsernameResult.Success:
        return response.token
      case SignInWithUsernameResult.UserNotFound:
        throw new SdkError('COR-4', { username })
      default:
        throw new DefaultResultError(response)
    }
  }

  async completeLoginChallenge(token: string, confirmationCode: string): Promise<CognitoUserTokens> {
    const response = await this._cognitoIdentityService.completeLoginChallenge(token, confirmationCode)
    switch (response.result) {
      case CompleteLoginChallengeResult.Success:
        this._sessionStorageService.saveUserTokens(response.cognitoTokens)
        return response.cognitoTokens
      case CompleteLoginChallengeResult.AttemptsExceeded:
        throw new SdkError('COR-13')
      case CompleteLoginChallengeResult.ConfirmationCodeExpired:
        throw new SdkError('COR-17', { confirmationCode })
      case CompleteLoginChallengeResult.ConfirmationCodeWrong:
        throw new SdkError('COR-5')
      default:
        throw new DefaultResultError(response)
    }
  }

  private async refreshUserSessionTokens(refreshToken: string) {
    try {
      const cognitoTokens = await this._cognitoIdentityService.signInWithRefreshToken(refreshToken)
      this._sessionStorageService.saveUserTokens(cognitoTokens)
      return cognitoTokens
    } catch (error) {
      throw new SdkError('COR-9')
    }
  }

  async signOut(cognitoTokens: CognitoUserTokens) {
    let newTokens = cognitoTokens

    if (cognitoTokens) {
      const { expiresIn, refreshToken } = cognitoTokens

      const isAccessTokenExpired = Date.now() > expiresIn

      if (isAccessTokenExpired) {
        newTokens = await this.refreshUserSessionTokens(refreshToken)
      }

      const { accessToken } = newTokens

      await this._cognitoIdentityService.signOut(accessToken)
    }

    this._sessionStorageService.clearUserTokens()

    return newTokens
  }

  async forgotPassword(username: string, messageParameters?: MessageParameters): Promise<void> {
    this._usernameShouldBeEmailOrPhoneNumber(username)
    const result = await this._cognitoIdentityService.forgotPassword(username, messageParameters)
    switch (result) {
      case ForgotPasswordResult.Success:
        return
      case ForgotPasswordResult.UserNotFound:
        throw new SdkError('COR-4', { username })
      default:
        throw new DefaultResultError(result)
    }
  }

  async forgotPasswordSubmit(username: string, confirmationCode: string, newPassword: string): Promise<void> {
    this._usernameShouldBeEmailOrPhoneNumber(username)
    const result = await this._cognitoIdentityService.forgotPasswordSubmit(username, confirmationCode, newPassword)
    switch (result) {
      case ForgotPasswordConfirmResult.Success:
        return
      case ForgotPasswordConfirmResult.ConfirmationCodeExpired:
        throw new SdkError('COR-2', { username, confirmationCode })
      case ForgotPasswordConfirmResult.ConfirmationCodeWrong:
        throw new SdkError('COR-5', { username, confirmationCode })
      case ForgotPasswordConfirmResult.NewPasswordInvalid:
        throw new SdkError('COR-6')
      case ForgotPasswordConfirmResult.UserNotFound:
        throw new SdkError('COR-4', { username })
      default:
        throw new DefaultResultError(result)
    }
  }

  async resendSignUp(username: string, messageParameters?: MessageParameters): Promise<void> {
    const { result, normalizedUsername } = await this._cognitoIdentityService.resendSignUp(username, messageParameters)
    switch (result) {
      case ResendSignUpResult.Success:
        return
      case ResendSignUpResult.UserAlreadyConfirmed:
        throw new SdkError('COR-8', { username: normalizedUsername })
      case ResendSignUpResult.UserNotFound:
        throw new SdkError('COR-4', { username: normalizedUsername })
      default:
        throw new DefaultResultError(result)
    }
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

  async changeUsername(cognitoTokens: CognitoUserTokens, attribute: string, messageParameters?: MessageParameters) {
    return this._withStoredTokens(cognitoTokens, async ({ accessToken }) => {
      const result = await this._cognitoIdentityService.changeUsername(accessToken, attribute, messageParameters)
      switch (result) {
        case ChangeUsernameResult.Success:
          return
        case ChangeUsernameResult.NewUsernameExists:
          throw new SdkError('COR-7', { username: attribute })
        default:
          throw new DefaultResultError(result)
      }
    })
  }

  async confirmChangeUsername(cognitoTokens: CognitoUserTokens, attribute: string, confirmationCode: string) {
    return this._withStoredTokens(cognitoTokens, async ({ accessToken }) => {
      const result = await this._cognitoIdentityService.confirmChangeUsername(accessToken, attribute, confirmationCode)
      switch (result) {
        case ConfirmChangeUsernameResult.Success:
          return
        case ConfirmChangeUsernameResult.ConfirmationCodeExpired:
          throw new SdkError('COR-2', { confirmationCode })
        case ConfirmChangeUsernameResult.ConfirmationCodeWrong:
          throw new SdkError('COR-5', { confirmationCode })
        default:
          throw new DefaultResultError(result)
      }
    })
  }

  readUserTokensFromSessionStorage() {
    return this._sessionStorageService.readUserTokens()
  }

  private _usernameShouldBeEmailOrPhoneNumber(username: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(username)

    if (!isEmailValid && !isPhoneNumberValid) {
      throw new SdkError('COR-3', { username })
    }
  }
}
