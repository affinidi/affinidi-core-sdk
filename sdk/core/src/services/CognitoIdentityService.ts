import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { profile } from '@affinidi/common'

let fetch: any

/* istanbul ignore next */
if (!fetch) {
  ;(global as any).fetch = require('node-fetch')
}

import { DEFAULT_COGNITO_REGION } from '../_defaultConfig'
import { CognitoUserTokens, MessageParameters } from '../dto'

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

export enum SignInWithLoginResult {
  Success,
  UserNotFound,
}

type SignInWithLoginResponse =
  | { result: Exclude<SignInWithLoginResult, SignInWithLoginResult.Success> }
  | { result: SignInWithLoginResult.Success; token: string }

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

export enum ConfirmSignUpResult {
  Success,
  UserNotFound,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
}

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

export type UsernameWithAttributes = {
  normalizedUsername: string
  login: string
  phoneNumber?: string
  emailAddress?: string
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

  async trySignIn(login: string, password: string): Promise<SignInResponse> {
    try {
      const params = this._getCognitoAuthParametersObject(AuthFlow.UserPassword, login, password)
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

  async signInWithEmailOrPhone(login: string, messageParameters?: MessageParameters): Promise<SignInWithLoginResponse> {
    const params = {
      ...this._getCognitoAuthParametersObject(AuthFlow.Custom, login),
      ...getAdditionalParameters(messageParameters),
    }

    try {
      const response = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
      const token = JSON.stringify(response)
      return { result: SignInWithLoginResult.Success, token }
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        return { result: SignInWithLoginResult.UserNotFound }
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

  async forgotPassword(login: string, messageParameters?: MessageParameters): Promise<ForgotPasswordResult> {
    const params = {
      ClientId: this.clientId,
      Username: login,
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
    login: string,
    confirmationCode: string,
    password: string,
  ): Promise<ForgotPasswordConfirmResult> {
    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: login,
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
    usernameWithAttributes: UsernameWithAttributes,
    password: string,
    messageParameters: MessageParameters,
  ): Promise<SignUpResult> {
    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: usernameWithAttributes.normalizedUsername,
      UserAttributes: this._buildUserAttributes(usernameWithAttributes),
      ...getAdditionalParameters(messageParameters),
    }

    try {
      await this.cognitoidentityserviceprovider.signUp(params).promise()
      return SignUpResult.Success
    } catch (error) {
      switch (error.code) {
        case 'UsernameExistsException': {
          const isUserUnconfirmed = await this.doesUnconfirmedUserExist(usernameWithAttributes.normalizedUsername)
          return isUserUnconfirmed ? SignUpResult.UnconfirmedUsernameExists : SignUpResult.ConfirmedUsernameExists
        }

        case 'InvalidPasswordException':
          return SignUpResult.InvalidPassword

        default:
          throw error
      }
    }
  }

  async resendSignUp(
    usernameWithAttributes: UsernameWithAttributes,
    messageParameters?: MessageParameters,
  ): Promise<ResendSignUpResult> {
    const params = {
      ClientId: this.clientId,
      Username: usernameWithAttributes.normalizedUsername,
      ...getAdditionalParameters(messageParameters),
    }

    try {
      await this.cognitoidentityserviceprovider.resendConfirmationCode(params).promise()
      return ResendSignUpResult.Success
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return ResendSignUpResult.UserNotFound
        case 'InvalidParameterException':
          return ResendSignUpResult.UserAlreadyConfirmed
        default:
          throw error
      }
    }
  }

  async confirmSignUp(
    usernameWithAttributes: UsernameWithAttributes,
    confirmationCode: string,
  ): Promise<ConfirmSignUpResult> {
    const params = {
      ClientId: this.clientId,
      Username: usernameWithAttributes.normalizedUsername,
      ConfirmationCode: confirmationCode,
    }

    try {
      await this.cognitoidentityserviceprovider.confirmSignUp(params).promise()
      return ConfirmSignUpResult.Success
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return ConfirmSignUpResult.UserNotFound
        case 'ExpiredCodeException':
          return ConfirmSignUpResult.ConfirmationCodeExpired
        case 'CodeMismatchException':
          return ConfirmSignUpResult.ConfirmationCodeWrong
        default:
          throw error
      }
    }
  }

  async changePassword(AccessToken: string, PreviousPassword: string, ProposedPassword: string) {
    const params = { AccessToken, PreviousPassword, ProposedPassword }

    return this.cognitoidentityserviceprovider.changePassword(params).promise()
  }

  async changeUsernameAndLogin(
    accessToken: string,
    usernameWithAttributes: UsernameWithAttributes,
    messageParameters?: MessageParameters,
  ): Promise<ChangeUsernameResult> {
    const usernameExists = await this._userExists(usernameWithAttributes.normalizedUsername)
    const loginExists = await this._userExists(usernameWithAttributes.login)

    if (usernameExists || loginExists) {
      return ChangeUsernameResult.NewUsernameExists
    }

    const params = {
      AccessToken: accessToken,
      UserAttributes: this._buildUserAttributes(usernameWithAttributes),
      ...getAdditionalParameters(messageParameters),
    }

    await this.cognitoidentityserviceprovider.updateUserAttributes(params).promise()
    return ChangeUsernameResult.Success
  }

  private async _confirmChangeUsername(
    accessToken: string,
    attributeName: string,
    confirmationCode: string,
  ): Promise<ConfirmChangeUsernameResult> {
    const params = {
      AccessToken: accessToken,
      AttributeName: attributeName,
      Code: confirmationCode,
    }

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

  async _confirmChangeUsernameToEmail(
    accessToken: string,
    confirmationCode: string,
  ): Promise<ConfirmChangeUsernameResult> {
    return this._confirmChangeUsername(accessToken, 'email', confirmationCode)
  }

  async _confirmChangeUsernameToPhone(
    accessToken: string,
    confirmationCode: string,
  ): Promise<ConfirmChangeUsernameResult> {
    return this._confirmChangeUsername(accessToken, 'phone_number', confirmationCode)
  }

  async doesUnconfirmedUserExist(normalizedUsername: string): Promise<boolean> {
    const { isUnconfirmed } = await this._signInWithInvalidPassword(normalizedUsername)

    return isUnconfirmed
  }

  async doesConfirmedUserExist(normalizedUsername: string): Promise<boolean> {
    const { userExists, isUnconfirmed } = await this._signInWithInvalidPassword(normalizedUsername)

    return userExists && !isUnconfirmed
  }

  private _getAuthParametersObject(authFlow: AuthFlow, login: string, password: string, refreshToken: string) {
    switch (authFlow) {
      case AuthFlow.UserPassword:
        return { USERNAME: login, PASSWORD: password }
      case AuthFlow.Custom:
        return { USERNAME: login }
      case AuthFlow.RefreshToken:
        return { REFRESH_TOKEN: refreshToken }
    }
  }

  private _getCognitoAuthParametersObject(
    authFlow: AuthFlow,
    login: string = null,
    password: string = null,
    refreshToken: string = null,
  ) {
    return {
      AuthFlow: authFlow as string,
      ClientId: this.clientId,
      AuthParameters: this._getAuthParametersObject(authFlow, login, password, refreshToken),
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

  private _buildUserAttributes({ phoneNumber, emailAddress }: UsernameWithAttributes) {
    return [
      ...(emailAddress ? [{ Name: 'email', Value: emailAddress }] : []),
      ...(phoneNumber ? [{ Name: 'phone_number', Value: phoneNumber }] : []),
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
