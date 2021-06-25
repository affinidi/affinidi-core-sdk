import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { profile } from '@affinidi/common'

let fetch: any

/* istanbul ignore next */
if (!fetch) {
  ;(global as any).fetch = require('node-fetch')
}

import { DEFAULT_COGNITO_REGION } from '../_defaultConfig'
import { CognitoUserTokens, MessageParameters } from '../dto'
import { normalizeUsername, validateUsername } from '../shared'

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

export enum CompleteLoginChallengeResult {
  Success,
  AttemptsExceeded,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
}

type CompleteLoginChallengeResponse =
  | { result: Exclude<CompleteLoginChallengeResult, CompleteLoginChallengeResult.Success> }
  | { result: CompleteLoginChallengeResult.Success; cognitoTokens: CognitoUserTokens }

export enum SignInWithUsernameResult {
  Success,
  UserNotFound,
}

type SignInWithUsernameResponse =
  | { result: Exclude<SignInWithUsernameResult, SignInWithUsernameResult.Success> }
  | { result: SignInWithUsernameResult.Success; token: string }

export enum ForgotPasswordResult {
  Success,
  UserNotFound,
}

export enum ForgotPasswordConfirmResult {
  Success,
  UserNotFound,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
  NewPasswordInvalid,
}

export enum ResendSignUpResult {
  Success,
  UserNotFound,
  UserAlreadyConfirmed,
}

type ResendSignUpResponse = { result: ResendSignUpResult; normalizedUsername: string }

export enum ConfirmSignUpResult {
  Success,
  UserNotFound,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
}

type ConfirmSignUpResponse = { result: ConfirmSignUpResult; normalizedUsername: string }

export enum ChangeUsernameResult {
  Success,
  NewUsernameExists,
}

export enum ConfirmChangeUsernameResult {
  Success,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
}

enum AuthFlow {
  UserPassword = 'USER_PASSWORD_AUTH',
  Custom = 'CUSTOM_AUTH',
  RefreshToken = 'REFRESH_TOKEN_AUTH',
}

const getAdditionalParameters = (messageParameters?: MessageParameters) => {
  return messageParameters ? { ClientMetadata: messageParameters as Record<string, any> } : {}
}

const tempSession: Record<string, string> = {}
const INVALID_PASSWORD = '1'

@profile()
export default class CognitoIdentityService {
  private readonly clientId
  private readonly cognitoidentityserviceprovider

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId
    this.cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      region: DEFAULT_COGNITO_REGION,
      apiVersion: '2016-04-18',
    })
  }

  async trySignIn(username: string, password: string): Promise<SignInResponse> {
    try {
      const params = this._getCognitoAuthParametersObject(AuthFlow.UserPassword, username, password)
      const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
      const cognitoTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)

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

  async signInWithUsername(
    username: string,
    messageParameters?: MessageParameters,
  ): Promise<SignInWithUsernameResponse> {
    const params = {
      ...this._getCognitoAuthParametersObject(AuthFlow.Custom, username),
      ...getAdditionalParameters(messageParameters),
    }

    try {
      const response = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
      const token = JSON.stringify(response)
      return { result: SignInWithUsernameResult.Success, token }
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        return { result: SignInWithUsernameResult.UserNotFound }
      } else {
        throw error
      }
    }
  }

  async completeLoginChallenge(token: string, confirmationCode: string): Promise<CompleteLoginChallengeResponse> {
    const { Session: tokenSession, ChallengeName, ChallengeParameters } = JSON.parse(token)

    const { USERNAME } = ChallengeParameters
    const Session = tempSession[USERNAME] || tokenSession

    const params = {
      ClientId: this.clientId,
      ChallengeName,
      ChallengeResponses: {
        ...ChallengeParameters,
        ANSWER: confirmationCode,
      },
      Session,
    }

    try {
      const result = await this.cognitoidentityserviceprovider.respondToAuthChallenge(params).promise()
      tempSession[USERNAME] = result.Session

      // NOTE: respondToAuthChallenge for the custom auth flow do not return
      //       error, but if response has `ChallengeName` - it is an error
      if (result.ChallengeName === 'CUSTOM_CHALLENGE') {
        return { result: CompleteLoginChallengeResult.ConfirmationCodeWrong }
      }

      const cognitoTokens = this._normalizeTokensFromCognitoAuthenticationResult(result.AuthenticationResult)
      return { result: CompleteLoginChallengeResult.Success, cognitoTokens }
    } catch (error) {
      // NOTE: Incorrect username or password. -> Corresponds to custom auth challenge
      //       error when OTP was entered incorrectly 3 times.
      if (error.message === 'Incorrect username or password.') {
        return { result: CompleteLoginChallengeResult.AttemptsExceeded }
      } else if (error.code === 'NotAuthorizedException') {
        // Throw when OTP is expired (3 min)
        return { result: CompleteLoginChallengeResult.ConfirmationCodeExpired }
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

  async forgotPassword(username: string, messageParameters?: MessageParameters): Promise<ForgotPasswordResult> {
    const params = {
      ClientId: this.clientId,
      Username: username,
      ...getAdditionalParameters(messageParameters),
    }

    try {
      await this.cognitoidentityserviceprovider.forgotPassword(params).promise()

      return ForgotPasswordResult.Success
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        return ForgotPasswordResult.UserNotFound
      } else {
        throw error
      }
    }
  }

  async forgotPasswordSubmit(
    username: string,
    confirmationCode: string,
    password: string,
  ): Promise<ForgotPasswordConfirmResult> {
    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: username,
      ConfirmationCode: confirmationCode,
    }

    try {
      await this.cognitoidentityserviceprovider.confirmForgotPassword(params).promise()

      return ForgotPasswordConfirmResult.Success
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          return ForgotPasswordConfirmResult.ConfirmationCodeExpired
        case 'UserNotFoundException':
          return ForgotPasswordConfirmResult.UserNotFound
        case 'CodeMismatchException':
          return ForgotPasswordConfirmResult.ConfirmationCodeWrong
        case 'InvalidPasswordException':
          return ForgotPasswordConfirmResult.NewPasswordInvalid
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
      ClientId: this.clientId,
      Password: password,
      Username: normalizedUsername,
      UserAttributes: this._buildUserAttributes(username),
      ...getAdditionalParameters(messageParameters),
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

  async resendSignUp(username: string, messageParameters?: MessageParameters): Promise<ResendSignUpResponse> {
    const normalizedUsername = normalizeUsername(username)
    const params = {
      ClientId: this.clientId,
      Username: normalizedUsername,
      ...getAdditionalParameters(messageParameters),
    }

    try {
      await this.cognitoidentityserviceprovider.resendConfirmationCode(params).promise()
      return { result: ResendSignUpResult.Success, normalizedUsername }
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return { result: ResendSignUpResult.UserNotFound, normalizedUsername }
        case 'InvalidParameterException':
          return { result: ResendSignUpResult.UserAlreadyConfirmed, normalizedUsername }
        default:
          throw error
      }
    }
  }

  async confirmSignUp(username: string, confirmationCode: string): Promise<ConfirmSignUpResponse> {
    const normalizedUsername = normalizeUsername(username)
    const params = {
      ClientId: this.clientId,
      Username: normalizedUsername,
      ConfirmationCode: confirmationCode,
    }

    try {
      await this.cognitoidentityserviceprovider.confirmSignUp(params).promise()
      return { result: ConfirmSignUpResult.Success, normalizedUsername }
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return { result: ConfirmSignUpResult.UserNotFound, normalizedUsername }
        case 'ExpiredCodeException':
          return { result: ConfirmSignUpResult.ConfirmationCodeExpired, normalizedUsername }
        case 'CodeMismatchException':
          return { result: ConfirmSignUpResult.ConfirmationCodeWrong, normalizedUsername }
        default:
          throw error
      }
    }
  }

  async changePassword(AccessToken: string, PreviousPassword: string, ProposedPassword: string) {
    const params = { AccessToken, PreviousPassword, ProposedPassword }

    return this.cognitoidentityserviceprovider.changePassword(params).promise()
  }

  async changeUsername(
    AccessToken: string,
    attribute: string,
    messageParameters?: MessageParameters,
  ): Promise<ChangeUsernameResult> {
    const userExists = await this._userExists(attribute)

    if (userExists) {
      return ChangeUsernameResult.NewUsernameExists
    }

    const UserAttributes = this._buildUserAttributes(attribute)

    const params = { AccessToken, UserAttributes, ...getAdditionalParameters(messageParameters) }

    await this.cognitoidentityserviceprovider.updateUserAttributes(params).promise()
    return ChangeUsernameResult.Success
  }

  async confirmChangeUsername(
    AccessToken: string,
    attribute: string,
    confirmationCode: string,
  ): Promise<ConfirmChangeUsernameResult> {
    const Code = confirmationCode

    const { isPhoneNumberValid } = validateUsername(attribute)

    let AttributeName = 'email'

    if (isPhoneNumberValid) {
      AttributeName = 'phone_number'
    }

    const params = { AccessToken, AttributeName, Code }

    try {
      await this.cognitoidentityserviceprovider.verifyUserAttribute(params).promise()
      return ConfirmChangeUsernameResult.Success
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          return ConfirmChangeUsernameResult.ConfirmationCodeExpired
        case 'CodeMismatchException':
          return ConfirmChangeUsernameResult.ConfirmationCodeWrong
        default:
          throw error
      }
    }
  }

  async isUserUnconfirmed(username: string): Promise<boolean> {
    const { isUnconfirmed } = await this._signInWithInvalidPassword(username)

    return isUnconfirmed
  }

  private _getAuthParametersObject(authFlow: AuthFlow, username: string, password: string, refreshToken: string) {
    switch (authFlow) {
      case AuthFlow.UserPassword:
        return { USERNAME: username, PASSWORD: password }
      case AuthFlow.Custom:
        return { USERNAME: username }
      case AuthFlow.RefreshToken:
        return { REFRESH_TOKEN: refreshToken }
    }
  }

  private _getCognitoAuthParametersObject(
    authFlow: AuthFlow,
    username: string = null,
    password: string = null,
    refreshToken: string = null,
  ) {
    return {
      AuthFlow: authFlow as string,
      ClientId: this.clientId,
      AuthParameters: this._getAuthParametersObject(authFlow, username, password, refreshToken),
    }
  }

  private _normalizeTokensFromCognitoAuthenticationResult(
    AuthenticationResult: AWS.CognitoIdentityServiceProvider.AuthenticationResultType,
  ): CognitoUserTokens {
    const { AccessToken: accessToken, IdToken: idToken, RefreshToken: refreshToken, ExpiresIn } = AuthenticationResult

    // NOTE: ExpiresIn = 3600, in seconds which is 1h
    const expiresIn = Date.now() + ExpiresIn * 1000

    return { accessToken, idToken, refreshToken, expiresIn }
  }

  public async signInWithRefreshToken(token: string): Promise<CognitoUserTokens> {
    const params = this._getCognitoAuthParametersObject(AuthFlow.RefreshToken, token)
    console.log('params', params)
    const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
    const cognitoUserTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)
    return cognitoUserTokens
  }

  private _buildUserAttributes(username: string) {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(username)

    return [
      ...(isEmailValid ? [{ Name: 'email', Value: username }] : []),
      ...(isPhoneNumberValid ? [{ Name: 'phone_number', Value: username }] : []),
    ]
  }

  private async _signInWithInvalidPassword(username: string) {
    try {
      const response = await this.trySignIn(username, INVALID_PASSWORD)
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

  private async _userExists(username: string): Promise<boolean> {
    const { userExists } = await this._signInWithInvalidPassword(username)

    return userExists
  }
}
