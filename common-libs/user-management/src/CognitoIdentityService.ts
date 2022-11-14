const createHash = require('create-hash/browser')
import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { profile } from '@affinidi/tools-common'

import { CognitoUserTokens, MessageParameters } from './dto'

type Response<TResult, TSuccessResult extends TResult, TAdditionalSuccessFields> =
  | { result: Exclude<TResult, TSuccessResult> }
  | ({ result: TSuccessResult } & TAdditionalSuccessFields)

export enum SignUpResult {
  Success,
  UnconfirmedUsernameExists,
  ConfirmedUsernameExists,
  InvalidPassword,
}

export enum LogInWithRefreshTokenResult {
  Success,
  NotAuthorizedException,
}

type LogInWithRefreshTokenResponse = Response<
  LogInWithRefreshTokenResult,
  LogInWithRefreshTokenResult.Success,
  { cognitoTokens: CognitoUserTokens }
>

export enum LogInWithPasswordResult {
  Success,
  UserNotFound,
  UserNotConfirmed,
}

type LogInWithPasswordResponse = Response<
  LogInWithPasswordResult,
  LogInWithPasswordResult.Success,
  { cognitoTokens: CognitoUserTokens; registrationStatus: RegistrationStatus }
>

export enum CompleteLoginPasswordlessResult {
  Success,
  AttemptsExceeded,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
}

export type CompleteLoginPasswordlessResponse = Response<
  CompleteLoginPasswordlessResult,
  CompleteLoginPasswordlessResult.Success | CompleteLoginPasswordlessResult.ConfirmationCodeWrong,
  { cognitoTokens: CognitoUserTokens; token: string; registrationStatus: RegistrationStatus }
>

export enum InitiateLoginPasswordlessResult {
  Success,
  UserNotFound,
}

type InitiateLoginPasswordlessResponse = Response<
  InitiateLoginPasswordlessResult,
  InitiateLoginPasswordlessResult.Success,
  { token: string }
>

export enum InitiateForgotPasswordResult {
  Success,
  UserNotFound,
}

export enum CompleteForgotPasswordResult {
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

export enum CompleteSignUpResult {
  Success,
  UserNotFound,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
  DoubleConfirmation,
  AliasExistsException,
}

export enum InitiateChangeLoginResult {
  Success,
  NewLoginExists,
}

export enum CompleteChangeLoginResult {
  Success,
  ConfirmationCodeExpired,
  ConfirmationCodeWrong,
}

enum AuthFlow {
  UserPassword = 'USER_PASSWORD_AUTH',
  Custom = 'CUSTOM_AUTH',
  RefreshToken = 'REFRESH_TOKEN_AUTH',
}

export enum RegistrationStatus {
  Incomplete = 'incomplete',
  Complete = 'complete',
}

export type UsernameWithAttributes = {
  username: string
  login: string
  phoneNumber?: string
  emailAddress?: string
  registrationStatus?: RegistrationStatus // in cognito pool "gender" attribute is used to store this value
}

type BuildUserAttributesInput = Pick<UsernameWithAttributes, 'phoneNumber' | 'emailAddress' | 'registrationStatus'>

type GetCognitoAuthParametersObjectInput = {
  login?: string
  password?: string
  refreshToken?: string
}

export const REGISTRATION_STATUS_ATTRIBUTE = 'gender'

const getAdditionalParameters = (messageParameters?: MessageParameters, authParameters?: { auth: string }) => {
  if (!messageParameters && !authParameters) {
    return {}
  }

  const messageParams = messageParameters ? messageParameters : {}
  const authParams = authParameters ? authParameters : {}

  return { ClientMetadata: { ...messageParams, ...authParams } as Record<string, any> }
}
const sha256 = (data: string): string =>
  createHash('sha256')
    .update(data || '')
    .digest()
    .toString('base64')

/* TODO: NUC-270 we should design stateless flow or use external configurable storage .
 Storing session in memory won't work in case of scaling (> 1 pod).
 Shared Redis can be a solution.
 */
const tempSession: Record<string, string> = {}
const INVALID_PASSWORD = '1'

/**
 * @internal
 */
@profile()
export class CognitoIdentityService {
  private readonly clientId
  private readonly cognitoidentityserviceprovider

  constructor({ region, clientId }: { region: string; clientId: string }) {
    this.clientId = clientId
    this.cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      region,
      apiVersion: '2016-04-18',
    })
  }

  async tryLogInWithPassword(
    login: string,
    password: string,
    authParameters?: { auth: string },
  ): Promise<LogInWithPasswordResponse> {
    try {
      const params = {
        ...this._getCognitoAuthParametersObject(AuthFlow.UserPassword, { login, password }),
        ...getAdditionalParameters(undefined, authParameters),
      }

      const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
      const cognitoTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)
      const registrationStatus = await this._getRegistrationStatus(cognitoTokens.accessToken)
      return {
        result: LogInWithPasswordResult.Success,
        cognitoTokens,
        registrationStatus,
      }
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return { result: LogInWithPasswordResult.UserNotFound }
        case 'UserNotConfirmedException':
          return { result: LogInWithPasswordResult.UserNotConfirmed }
        default:
          throw error
      }
    }
  }

  async initiateLogInPasswordless(
    login: string,
    messageParameters?: MessageParameters,
    authParameters?: { auth: string },
  ): Promise<InitiateLoginPasswordlessResponse> {
    const params = {
      ...this._getCognitoAuthParametersObject(AuthFlow.Custom, { login }),
      ...getAdditionalParameters(messageParameters, authParameters),
    }

    try {
      const response = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
      const token = JSON.stringify(response)
      return { result: InitiateLoginPasswordlessResult.Success, token }
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        return { result: InitiateLoginPasswordlessResult.UserNotFound }
      } else {
        throw error
      }
    }
  }

  async completeLogInPasswordless(token: string, confirmationCode: string): Promise<CompleteLoginPasswordlessResponse> {
    const tokenObject = JSON.parse(token)
    const { Session: tokenSession, ChallengeName, ChallengeParameters } = tokenObject
    //TODO: session is approx 920 character long string
    const hashedTokenSession = sha256(tokenSession)
    const Session = tempSession[hashedTokenSession] || tokenSession

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
      //NOTE : successful OTP return a undefined session . wrong code return a new session
      tempSession[hashedTokenSession] = result.Session
      // NOTE: respondToAuthChallenge for the custom auth flow do not return
      //       error, but if response has `ChallengeName` - it is an error
      if (result.ChallengeName === 'CUSTOM_CHALLENGE') {
        return {
          result: CompleteLoginPasswordlessResult.ConfirmationCodeWrong,
          cognitoTokens: null,
          token: JSON.stringify({ ...tokenObject, Session: result.Session }),
          registrationStatus: RegistrationStatus.Complete,
        }
      }

      const cognitoTokens = this._normalizeTokensFromCognitoAuthenticationResult(result.AuthenticationResult)
      //TODO : we still need to think about clean up for sessions that was not finished by user. ex. session was confirmed with wrong pasword 1 or 2 times with out sucess.
      // potential memory leak.
      delete tempSession[hashedTokenSession]
      const registrationStatus = await this._getRegistrationStatus(cognitoTokens.accessToken)
      return { result: CompleteLoginPasswordlessResult.Success, cognitoTokens, token: null, registrationStatus }
    } catch (error) {
      // NOTE: not deleted sessions after any errors will block user session
      delete tempSession[hashedTokenSession]

      // NOTE: Incorrect username or password. -> Corresponds to custom auth challenge
      //       error when OTP was entered incorrectly 3 times.
      if (error.message === 'Incorrect username or password.') {
        return { result: CompleteLoginPasswordlessResult.AttemptsExceeded }
      } else if (error.code === 'NotAuthorizedException') {
        // Throw when OTP is expired (3 min)
        return { result: CompleteLoginPasswordlessResult.ConfirmationCodeExpired }
      } else {
        throw error
      }
    }
  }

  async initiateForgotPassword(
    login: string,
    messageParameters?: MessageParameters,
  ): Promise<InitiateForgotPasswordResult> {
    const params = {
      ClientId: this.clientId,
      Username: login,
      ...getAdditionalParameters(messageParameters),
    }

    try {
      await this.cognitoidentityserviceprovider.forgotPassword(params).promise()

      return InitiateForgotPasswordResult.Success
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        return InitiateForgotPasswordResult.UserNotFound
      } else {
        throw error
      }
    }
  }

  async completeForgotPassword(
    login: string,
    confirmationCode: string,
    password: string,
  ): Promise<CompleteForgotPasswordResult> {
    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: login,
      ConfirmationCode: confirmationCode,
    }

    try {
      await this.cognitoidentityserviceprovider.confirmForgotPassword(params).promise()

      return CompleteForgotPasswordResult.Success
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          return CompleteForgotPasswordResult.ConfirmationCodeExpired
        case 'UserNotFoundException':
          return CompleteForgotPasswordResult.UserNotFound
        case 'CodeMismatchException':
          return CompleteForgotPasswordResult.ConfirmationCodeWrong
        case 'InvalidPasswordException':
          return CompleteForgotPasswordResult.NewPasswordInvalid
        default:
          throw error
      }
    }
  }

  async trySignUp(
    usernameWithAttributes: UsernameWithAttributes,
    password: string,
    messageParameters?: MessageParameters,
  ): Promise<SignUpResult> {
    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: usernameWithAttributes.username,
      UserAttributes: this._buildUserAttributes({
        ...usernameWithAttributes,
        registrationStatus: RegistrationStatus.Incomplete,
      }),
      ...getAdditionalParameters(messageParameters),
    }

    try {
      await this.cognitoidentityserviceprovider.signUp(params).promise()
      return SignUpResult.Success
    } catch (error) {
      switch (error.code) {
        case 'UsernameExistsException': {
          const isUserUnconfirmed = await this.doesUnconfirmedUserExist(usernameWithAttributes.username)
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
      Username: usernameWithAttributes.login,
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

  async completeSignUp(
    usernameWithAttributes: UsernameWithAttributes,
    confirmationCode: string,
  ): Promise<CompleteSignUpResult> {
    const params = {
      ClientId: this.clientId,
      Username: usernameWithAttributes.username,
      ConfirmationCode: confirmationCode,
    }

    try {
      await this.cognitoidentityserviceprovider.confirmSignUp(params).promise()
      return CompleteSignUpResult.Success
    } catch (error) {
      switch (error.code) {
        case 'UserNotFoundException':
          return CompleteSignUpResult.UserNotFound
        case 'ExpiredCodeException':
          return CompleteSignUpResult.ConfirmationCodeExpired
        case 'CodeMismatchException':
          return CompleteSignUpResult.ConfirmationCodeWrong
        case 'AliasExistsException':
          return CompleteSignUpResult.AliasExistsException
        case 'NotAuthorizedException':
          if (error.message === 'User cannot be confirmed. Current status is CONFIRMED')
            return CompleteSignUpResult.DoubleConfirmation
          else throw error
        default:
          throw error
      }
    }
  }

  async changePassword(AccessToken: string, PreviousPassword: string, ProposedPassword: string) {
    const params = { AccessToken, PreviousPassword, ProposedPassword }

    return this.cognitoidentityserviceprovider.changePassword(params).promise()
  }

  async initiateChangeAttributes(
    accessToken: string,
    usernameWithAttributes: UsernameWithAttributes,
    messageParameters?: MessageParameters,
  ): Promise<InitiateChangeLoginResult> {
    const usernameExists = await this._userExists(usernameWithAttributes.username)
    const loginExists = await this._userExists(usernameWithAttributes.login)

    if (usernameExists || loginExists) {
      return InitiateChangeLoginResult.NewLoginExists
    }

    const params = {
      AccessToken: accessToken,
      UserAttributes: this._buildUserAttributes(usernameWithAttributes),
      ...getAdditionalParameters(messageParameters),
    }

    await this.cognitoidentityserviceprovider.updateUserAttributes(params).promise()
    return InitiateChangeLoginResult.Success
  }

  private async _completeChangeAttributes(
    accessToken: string,
    attributeName: string,
    confirmationCode: string,
  ): Promise<CompleteChangeLoginResult> {
    const params = {
      AccessToken: accessToken,
      AttributeName: attributeName,
      Code: confirmationCode,
    }

    try {
      await this.cognitoidentityserviceprovider.verifyUserAttribute(params).promise()
      return CompleteChangeLoginResult.Success
    } catch (error) {
      switch (error.code) {
        case 'ExpiredCodeException':
          return CompleteChangeLoginResult.ConfirmationCodeExpired
        case 'CodeMismatchException':
          return CompleteChangeLoginResult.ConfirmationCodeWrong
        default:
          throw error
      }
    }
  }

  async completeChangeEmail(accessToken: string, confirmationCode: string): Promise<CompleteChangeLoginResult> {
    return this._completeChangeAttributes(accessToken, 'email', confirmationCode)
  }

  async completeChangePhone(accessToken: string, confirmationCode: string): Promise<CompleteChangeLoginResult> {
    return this._completeChangeAttributes(accessToken, 'phone_number', confirmationCode)
  }

  async doesUnconfirmedUserExist(normalizedUsername: string): Promise<boolean> {
    const { isUnconfirmed } = await this._logInWithInvalidPassword(normalizedUsername)

    return isUnconfirmed
  }

  async doesConfirmedUserExist(normalizedUsername: string): Promise<boolean> {
    const { userExists, isUnconfirmed } = await this._logInWithInvalidPassword(normalizedUsername)

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
    { login = null, password = null, refreshToken = null }: GetCognitoAuthParametersObjectInput,
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

  public async logInWithRefreshToken(refreshToken: string): Promise<LogInWithRefreshTokenResponse> {
    const params = this._getCognitoAuthParametersObject(AuthFlow.RefreshToken, { refreshToken })
    try {
      const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()
      const cognitoTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)
      return { result: LogInWithRefreshTokenResult.Success, cognitoTokens }
    } catch (error) {
      if (error.code === 'NotAuthorizedException') return { result: LogInWithRefreshTokenResult.NotAuthorizedException }
      throw error
    }
  }

  public async markRegistrationComplete(accessToken: string) {
    const params = {
      AccessToken: accessToken,
      UserAttributes: this._buildUserAttributes({ registrationStatus: RegistrationStatus.Complete }),
    }
    await this.cognitoidentityserviceprovider.updateUserAttributes(params).promise()
  }

  private _buildUserAttributes({ phoneNumber, emailAddress, registrationStatus }: BuildUserAttributesInput) {
    return [
      ...(emailAddress ? [{ Name: 'email', Value: emailAddress }] : []),
      ...(phoneNumber ? [{ Name: 'phone_number', Value: phoneNumber }] : []),
      // The "gender" attribute is used to store status of registration,
      // two possible options "incomplete" and "complete"
      ...(registrationStatus ? [{ Name: REGISTRATION_STATUS_ATTRIBUTE, Value: registrationStatus }] : []),
    ]
  }

  private async _logInWithInvalidPassword(username: string) {
    try {
      // username also could be email or phone, cognito works with aliases
      const response = await this.tryLogInWithPassword(username, INVALID_PASSWORD)
      switch (response.result) {
        case LogInWithPasswordResult.UserNotFound:
          return { userExists: false, isUnconfirmed: false }
        case LogInWithPasswordResult.UserNotConfirmed:
          return { userExists: true, isUnconfirmed: true }
        default:
          return { userExists: true, isUnconfirmed: false }
      }
    } catch (error) {
      return { userExists: true, isUnconfirmed: false }
    }
  }

  private async _userExists(username: string): Promise<boolean> {
    const { userExists } = await this._logInWithInvalidPassword(username)

    return userExists
  }

  /**
   * @returns RegistrationStatus of the current user, this data is stored in cognito attributes, "gender" attribute
   * For backward compatibility RegistrationStatus.Incomplete is returned only when attribute gender is equals "incomplete"
   * @param accessToken
   * @private
   */
  private async _getRegistrationStatus(accessToken: string): Promise<RegistrationStatus> {
    const userData = await this.cognitoidentityserviceprovider
      .getUser({
        AccessToken: accessToken,
      })
      .promise()

    const registrationStatusRawValue = userData.UserAttributes.find(
      (a) => a.Name === REGISTRATION_STATUS_ATTRIBUTE,
    )?.Value
    return registrationStatusRawValue === RegistrationStatus.Incomplete
      ? RegistrationStatus.Incomplete
      : RegistrationStatus.Complete
  }
}
