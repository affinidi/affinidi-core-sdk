import { profile } from '@affinidi/common'

import { CognitoUserTokens, MessageParameters } from '../dto/shared.dto'
import { validateUsername, SdkError } from '../shared'
import { normalizeShortPassword } from '../shared/normalizeShortPassword'
import { normalizeUsername } from '../shared/normalizeUsername'
import { clearUserTokensFromSessionStorage, readUserTokensFromSessionStorage } from '../shared/sessionStorageHandler'
import { randomBytes } from '../shared/randomBytes'
import KeyStorageApiService from './KeyStorageApiService'
import CognitoIdentityService, { SignInResult, SignUpResult } from './CognitoIdentityService'

const generatePassword = async () => {
  const randomPassword = (await randomBytes(32)).toString('hex')
  // Make first found letter uppercase because hex string doesn't meet password requirements
  return randomPassword.replace(/[a-f]/, 'A')
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
  private _userPoolId

  constructor(options: ConstructorOptions) {
    this._keyStorageApiService = new KeyStorageApiService(options)
    this._cognitoIdentityService = new CognitoIdentityService(options)
    this._userPoolId = options.userPoolId
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

  private async _confirmSignUpWithAdmin(username: string, confirmationCode: string) {
    const { isUsername } = validateUsername(username)

    if (isUsername) {
      await this._keyStorageApiService.adminConfirmUser({ username })
    } else {
      await this._cognitoIdentityService.confirmSignUp(username, confirmationCode)
    }
  }

  async signIn(username: string, shortPassword: string) {
    const password = normalizeShortPassword(shortPassword, username)
    const response = await this._cognitoIdentityService.trySignIn(username, password)

    switch (response.result) {
      case SignInResult.Success:
        return response.cognitoTokens

      case SignInResult.UserNotConfirmed:
        throw new SdkError('COR-16', { username })

      case SignInResult.UserNotFound:
        throw new SdkError('COR-4', { username })
    }
  }

  async confirmSignUp(token: string, confirmationCode: string) {
    const [username, shortPassword] = token.split('::')

    await this._confirmSignUpWithAdmin(username, confirmationCode)
    const cognitoTokens = await this.signIn(username, shortPassword)

    return { cognitoTokens, shortPassword }
  }

  async isUserUnconfirmed(username: string) {
    const normalizedUsername = normalizeUsername(username)
    return this._cognitoIdentityService.isUserUnconfirmed(normalizedUsername)
  }

  async signInWithUsername(username: string, messageParameters?: MessageParameters): Promise<string> {
    if (messageParameters) {
      await this._keyStorageApiService.storeTemplate({
        username: username,
        template: messageParameters.message,
        subject: messageParameters.subject,
        htmlTemplate: messageParameters.htmlMessage,
      })
    }

    const token = await this._cognitoIdentityService.signInWithUsername(username, messageParameters)
    return token
  }

  async completeLoginChallenge(token: string, confirmationCode: string): Promise<CognitoUserTokens> {
    return this._cognitoIdentityService.completeLoginChallenge(token, confirmationCode)
  }

  async signOut(cognitoTokens: CognitoUserTokens) {
    let newTokens = cognitoTokens

    if (cognitoTokens) {
      const { expiresIn, refreshToken } = cognitoTokens

      const isAccessTokenExpired = Date.now() > expiresIn

      if (isAccessTokenExpired) {
        newTokens = await this._cognitoIdentityService.refreshUserSessionTokens(refreshToken)
      }

      const { accessToken } = newTokens

      await this._cognitoIdentityService.signOut(accessToken)
    }

    clearUserTokensFromSessionStorage(this._userPoolId)

    return newTokens
  }

  async forgotPassword(username: string, messageParameters?: MessageParameters): Promise<void> {
    await this._cognitoIdentityService.forgotPassword(username, messageParameters)
  }

  async forgotPasswordSubmit(username: string, confirmationCode: string, newPassword: string): Promise<void> {
    await this._cognitoIdentityService.forgotPasswordSubmit(username, confirmationCode, newPassword)
  }

  async resendSignUp(username: string, messageParameters?: MessageParameters): Promise<void> {
    await this._cognitoIdentityService.resendSignUp(username, messageParameters)
  }

  private _getCognitoUserTokensForUser(cognitoTokens: CognitoUserTokens) {
    if (cognitoTokens) {
      return cognitoTokens
    }

    return readUserTokensFromSessionStorage(this._userPoolId)
  }

  async changePassword(cognitoTokens: CognitoUserTokens, previousPassword: string, proposedPassword: string) {
    const newTokens = this._getCognitoUserTokensForUser(cognitoTokens)
    const { accessToken } = newTokens
    await this._cognitoIdentityService.changePassword(accessToken, previousPassword, proposedPassword)
    return newTokens
  }

  async changeUsername(cognitoTokens: CognitoUserTokens, attribute: string, messageParameters?: MessageParameters) {
    const newTokens = this._getCognitoUserTokensForUser(cognitoTokens)
    const { accessToken } = newTokens
    await this._cognitoIdentityService.changeUsername(accessToken, attribute, messageParameters)
    return newTokens
  }

  async confirmChangeUsername(cognitoTokens: CognitoUserTokens, attribute: string, confirmationCode: string) {
    const newTokens = this._getCognitoUserTokensForUser(cognitoTokens)
    const { accessToken } = newTokens
    await this._cognitoIdentityService.confirmChangeUsername(accessToken, attribute, confirmationCode)
    return newTokens
  }
}
