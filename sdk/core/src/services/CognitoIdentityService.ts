import { profile } from '@affinidi/common'

let fetch: any

/* istanbul ignore next */
if (!fetch) {
  ;(global as any).fetch = require('node-fetch')
}

import { CognitoIdentityServiceProvider } from 'aws-sdk'

import SdkError from '../shared/SdkError'
import { CognitoUserTokens } from '../dto/shared.dto'
import { saveUserTokensToSessionStorage } from '../shared/sessionStorageHandler'
import { MessageParameters } from '../dto'

import { DEFAULT_COGNITO_REGION } from '../_defaultConfig'

import { validateUsername } from '../shared/validateUsername'
import { normalizeUsername } from '../shared/normalizeUsername'

const tempSession: Record<string, string> = {}

type ConstructorOptions = {
  clientId: string
  userPoolId: string
}

export enum SignUpResult {
  Success,
  UnconfirmedUsernameExists,
  ConfirmedUsernameExists,
  InvalidPassword,
}

export enum SignInResult {
  Success,
  UserNotFound,
  UserNotConfirmed,
}

type SignInResponse =
  | { result: Exclude<SignInResult, SignInResult.Success> }
  | { result: SignInResult.Success; cognitoTokens: CognitoUserTokens }

@profile()
export default class CognitoIdentityService {
  protected cognitoOptions
  private readonly cognitoOptionKeys: string[] = ['clientId', 'userPoolId']
  private readonly cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
    region: DEFAULT_COGNITO_REGION,
    apiVersion: '2016-04-18',
  })

  constructor(options: ConstructorOptions) {
    this._validateCognitoOptions(options)
    const cognitoOptions = {
      region: DEFAULT_COGNITO_REGION,
      clientId: options.clientId,
      userPoolId: options.userPoolId,
    }
    this.cognitoOptions = cognitoOptions
  }

  async refreshUserSessionTokens(refreshToken: string) {
    try {
      const response = await this._signInWithRefreshToken(refreshToken)

      return response
    } catch (error) {
      throw new SdkError('COR-9')
    }
  }

  async trySignIn(username: string, password: string): Promise<SignInResponse> {
    const authFlow = 'USER_PASSWORD_AUTH'

    try {
      const params = this._getCognitoAuthParametersObject(authFlow, username, password)

      const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()

      const cognitoTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)

      const { userPoolId } = this.cognitoOptions
      saveUserTokensToSessionStorage(userPoolId, cognitoTokens)

      return {
        result: SignInResult.Success,
        cognitoTokens,
      }
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return { result: SignInResult.UserNotFound }
        case 'UserNotConfirmedException':
          return { result: SignInResult.UserNotConfirmed }
        default:
          throw error
      }
    }
  }

  async signInWithUsername(username: string, messageParameters?: MessageParameters): Promise<string> {
    this._usernameShouldBeEmailOrPhoneNumber(username)

    try {
      const token = await this._signInWithUsername(username, messageParameters)

      return token
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        throw new SdkError('COR-4', { username })
      } else {
        throw error
      }
    }
  }

  static setTempSession(
    ChallengeParameters: CognitoIdentityServiceProvider.ChallengeParametersType,
    Session: string,
  ): void {
    const { USERNAME } = ChallengeParameters

    tempSession[USERNAME] = Session
  }

  async completeLoginChallenge(token: string, confirmationCode: string): Promise<CognitoUserTokens> {
    const { Session: tokenSession, ChallengeName, ChallengeParameters } = JSON.parse(token)

    let Session = tokenSession
    const { USERNAME } = ChallengeParameters

    if (tempSession[USERNAME]) {
      Session = tempSession[USERNAME]
    }

    const { clientId: ClientId } = this.cognitoOptions

    const params = {
      ClientId,
      ChallengeName,
      ChallengeResponses: {
        ...ChallengeParameters,
        ANSWER: confirmationCode,
      },
      Session,
    }

    try {
      // prettier-ignore
      const result = await this.cognitoidentityserviceprovider
        .respondToAuthChallenge(params)
        .promise()

      CognitoIdentityService.setTempSession(ChallengeParameters, result.Session)

      // NOTE: respondToAuthChallenge for the custom auth flow do not return
      //       error, but if response has `ChallengeName` - it is an error
      if (result.ChallengeName === 'CUSTOM_CHALLENGE') {
        throw new SdkError('COR-5')
      }

      const cognitoUserTokens = this._normalizeTokensFromCognitoAuthenticationResult(result.AuthenticationResult)

      const { userPoolId } = this.cognitoOptions
      saveUserTokensToSessionStorage(userPoolId, cognitoUserTokens)

      return cognitoUserTokens
    } catch (error) {
      // NOTE: Incorrect username or password. -> Corresponds to custom auth challenge
      //       error when OTP was entered incorrectly 3 times.
      if (error.message === 'Incorrect username or password.') {
        throw new SdkError('COR-13')
      } else if (error.code === 'NotAuthorizedException') {
        // Throw when OTP is expired (3 min)
        throw new SdkError('COR-17', { confirmationCode })
      } else {
        throw error
      }
    }
  }

  // NOTE: Signs out users from all devices. It also invalidates all
  //       refresh tokens issued to a user. The user's current access and
  //       Id tokens remain valid until their expiry.
  //       Access and Id tokens expire one hour after they are issued.
  async signOut(AccessToken: string): Promise<void> {
    this.cognitoidentityserviceprovider.globalSignOut({ AccessToken })
  }

  async forgotPassword(
    Username: string,
    messageParameters?: MessageParameters,
  ): Promise<AWS.CognitoIdentityServiceProvider.ForgotPasswordResponse> {
    this._usernameShouldBeEmailOrPhoneNumber(Username)

    const { clientId: ClientId } = this.cognitoOptions

    const params = {
      ClientId,
      Username,
    }

    if (messageParameters) {
      Object.assign(params, { ClientMetadata: messageParameters })
    }

    try {
      const response = await this.cognitoidentityserviceprovider.forgotPassword(params).promise()

      return response
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        throw new SdkError('COR-4', { username: Username })
      } else {
        throw error
      }
    }
  }

  async forgotPasswordSubmit(username: string, ConfirmationCode: string, Password: string) {
    this._usernameShouldBeEmailOrPhoneNumber(username)

    const { clientId: ClientId } = this.cognitoOptions

    const params = {
      ClientId,
      Password,
      Username: username,
      ConfirmationCode,
    }

    try {
      const response = await this.cognitoidentityserviceprovider.confirmForgotPassword(params).promise()

      return response
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          throw new SdkError('COR-2', { username, confirmationCode: ConfirmationCode })

        case 'UserNotFoundException':
          throw new SdkError('COR-4', { username })

        case 'CodeMismatchException':
          throw new SdkError('COR-5', { username, confirmationCode: ConfirmationCode })

        case 'InvalidPasswordException':
          throw new SdkError('COR-6')

        default:
          throw error
      }
    }
  }

  async trySignUp(
    username: string,
    password: string,
    messageParameters: MessageParameters,
  ): Promise<{ result: SignUpResult; normalizedUsername: string }> {
    const normalizedUsername = normalizeUsername(username)

    const params = {
      ClientId: this.cognitoOptions.clientId,
      Password: password,
      Username: normalizedUsername,
      UserAttributes: this._buildUserAttributes(username),
      ClientMetadata: messageParameters ?? {},
    }

    try {
      await this.cognitoidentityserviceprovider.signUp(params).promise()
      return { result: SignUpResult.Success, normalizedUsername }
    } catch (error) {
      switch (error.code) {
        case 'UsernameExistsException': {
          const isUserUnconfirmed = await this.isUserUnconfirmed(normalizedUsername)
          return {
            result: isUserUnconfirmed ? SignUpResult.UnconfirmedUsernameExists : SignUpResult.ConfirmedUsernameExists,
            normalizedUsername,
          }
        }

        case 'InvalidPasswordException':
          return { result: SignUpResult.InvalidPassword, normalizedUsername }

        default:
          throw error
      }
    }
  }

  async resendSignUp(Username: string, messageParameters?: MessageParameters) {
    Username = normalizeUsername(Username)

    const { clientId: ClientId } = this.cognitoOptions

    const ClientMetadata = messageParameters || {}
    const params = { ClientId, Username, ClientMetadata }

    try {
      const response = await this.cognitoidentityserviceprovider.resendConfirmationCode(params).promise()

      return response
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          throw new SdkError('COR-4', { username: Username })

        case 'InvalidParameterException':
          throw new SdkError('COR-8', { username: Username })

        default:
          throw error
      }
    }
  }

  async confirmSignUp(Username: string, ConfirmationCode: string) {
    Username = normalizeUsername(Username)

    const { clientId: ClientId } = this.cognitoOptions

    const params = { ClientId, Username, ConfirmationCode }

    try {
      const response = await this.cognitoidentityserviceprovider.confirmSignUp(params).promise()

      return response
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          throw new SdkError('COR-4', { username: Username })

        case 'ExpiredCodeException':
          throw new SdkError('COR-2', { username: Username, confirmationCode: ConfirmationCode })

        case 'CodeMismatchException':
          throw new SdkError('COR-5', { username: Username, confirmationCode: ConfirmationCode })

        default:
          throw error
      }
    }
  }

  async changePassword(AccessToken: string, PreviousPassword: string, ProposedPassword: string) {
    const params = { AccessToken, PreviousPassword, ProposedPassword }

    return this.cognitoidentityserviceprovider.changePassword(params).promise()
  }

  async changeUsername(AccessToken: string, attribute: string, messageParameters?: MessageParameters) {
    const userExists = await this._userExists(attribute)

    if (userExists) {
      throw new SdkError('COR-7', { username: attribute })
    }

    const UserAttributes = this._buildUserAttributes(attribute)

    const ClientMetadata = messageParameters || {}
    const params = { AccessToken, UserAttributes, ClientMetadata }

    return this.cognitoidentityserviceprovider.updateUserAttributes(params).promise()
  }

  async confirmChangeUsername(AccessToken: string, attribute: string, confirmationCode: string) {
    const Code = confirmationCode

    const { isPhoneNumberValid } = validateUsername(attribute)

    let AttributeName = 'email'

    if (isPhoneNumberValid) {
      AttributeName = 'phone_number'
    }

    const params = { AccessToken, AttributeName, Code }

    try {
      const response = await this.cognitoidentityserviceprovider.verifyUserAttribute(params).promise()

      return response
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          throw new SdkError('COR-2', { attribute: AttributeName, confirmationCode })

        case 'CodeMismatchException':
          throw new SdkError('COR-5', { attribute: AttributeName, confirmationCode })

        default:
          throw error
      }
    }
  }

  async isUserUnconfirmed(username: string): Promise<boolean> {
    const { isUnconfirmed } = await this._signInWithInvalidPassword(username)

    return isUnconfirmed
  }

  /* istanbul ignore next: private function */
  private _validateCognitoOptions(options: any = {}) {
    const optionKeys = Object.keys(options)

    if (optionKeys.length > 0) {
      this.cognitoOptionKeys.every((value) => {
        if (!optionKeys.includes(value)) {
          throw new Error(`All or none Cognito parameters must be provided: ${this.cognitoOptionKeys}`)
        }
      })
    }
  }

  /* istanbul ignore next: private function */
  private _usernameShouldBeEmailOrPhoneNumber(username: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(username)

    if (!isEmailValid && !isPhoneNumberValid) {
      throw new SdkError('COR-3', { username })
    }
  }

  /* istanbul ignore next: private method */
  private _getAuthParametersObject(authFlow: string, username: string, password: string, refreshToken: string) {
    switch (authFlow) {
      case 'USER_PASSWORD_AUTH':
        return {
          USERNAME: username,
          PASSWORD: password,
        }

      case 'CUSTOM_AUTH':
        return {
          USERNAME: username,
        }

      case 'REFRESH_TOKEN_AUTH':
        return {
          REFRESH_TOKEN: refreshToken,
        }
    }
  }

  /* istanbul ignore next: private method */
  private _getCognitoAuthParametersObject(
    AuthFlow: string,
    username: string = null,
    password: string = null,
    refreshToken: string = null,
  ) {
    const AuthParameters = this._getAuthParametersObject(AuthFlow, username, password, refreshToken)
    const { clientId: ClientId } = this.cognitoOptions
    return { AuthFlow, ClientId, AuthParameters }
  }

  /* istanbul ignore next: private method */
  private _normalizeTokensFromCognitoAuthenticationResult(
    AuthenticationResult: AWS.CognitoIdentityServiceProvider.AuthenticationResultType,
  ): CognitoUserTokens {
    const { AccessToken: accessToken, IdToken: idToken, RefreshToken: refreshToken, ExpiresIn } = AuthenticationResult

    // NOTE: ExpiresIn = 3600, in seconds which is 1h
    const expiresIn = Date.now() + ExpiresIn * 1000

    return { accessToken, idToken, refreshToken, expiresIn }
  }

  /* istanbul ignore next: private method */
  private async _signInWithUsername(username: string, messageParameters?: MessageParameters) {
    const authFlow = 'CUSTOM_AUTH'
    const params = this._getCognitoAuthParametersObject(authFlow, username)

    if (messageParameters) {
      Object.assign(params, { ClientMetadata: messageParameters })
    }

    const response = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
    const token = JSON.stringify(response)

    // prettier-ignore
    return token
  }

  /* istanbul ignore next: private method */
  private async _signInWithRefreshToken(token: string): Promise<CognitoUserTokens> {
    const authFlow = 'REFRESH_TOKEN_AUTH'
    const params = this._getCognitoAuthParametersObject(authFlow, token)

    const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()

    const cognitoUserTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)

    const { userPoolId } = this.cognitoOptions
    saveUserTokensToSessionStorage(userPoolId, cognitoUserTokens)

    return cognitoUserTokens
  }

  /* istanbul ignore next: private function */
  private _buildUserAttributes(username: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(username)

    return [
      ...(isEmailValid ? [{ Name: 'email', Value: username }] : []),
      ...(isPhoneNumberValid ? [{ Name: 'phone_number', Value: username }] : []),
    ]
  }

  /* istanbul ignore next: private function */
  private async _signInWithInvalidPassword(username: string) {
    const { userPoolId, clientId } = this.cognitoOptions

    const invalidPassword = '1'
    const cognitoIdentityService = new CognitoIdentityService({ userPoolId, clientId })

    try {
      const response = await cognitoIdentityService.trySignIn(username, invalidPassword)
      switch (response.result) {
        case SignInResult.UserNotFound:
          return { userExists: false, isUnconfirmed: false }
        case SignInResult.UserNotConfirmed:
          return { userExists: true, isUnconfirmed: true }
        default:
          return { userExists: true, isUnconfirmed: false }
      }
    } catch (error) {
      return { userExists: true, isUnconfirmed: false }
    }
  }

  /* istanbul ignore next: private function */
  private async _userExists(username: string): Promise<boolean> {
    const { userExists } = await this._signInWithInvalidPassword(username)

    return userExists
  }
}
