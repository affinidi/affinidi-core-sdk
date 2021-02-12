import { profile } from '@affinidi/common'

let fetch: any

/* istanbul ignore next */
if (!fetch) {
  ;(global as any).fetch = require('node-fetch')
}

const AWS = require('aws-sdk')

import WalletStorageService from './WalletStorageService'
import SdkError from '../shared/SdkError'
import { CognitoUserTokens } from '../dto/shared.dto'
import { saveUserTokensToSessionStorage } from '../shared/sessionStorageHandler'
import { MessageParameters } from '../dto'

import { DEFAULT_COGNITO_REGION, STAGING_COGNITO_CLIENT_ID, STAGING_COGNITO_USER_POOL_ID } from '../_defaultConfig'

import { validateUsername } from '../shared/validateUsername'
import { normalizeUsername } from '../shared/normalizeUsername'

const tempSession: any = {}

type CognitoAuthenticationResult = {
  AccessToken: string
  IdToken: string
  RefreshToken: string
  ExpiresIn: number
}

@profile()
export default class CognitoService {
  protected cognitoOptions: any
  private readonly cognitoOptionKeys: string[] = ['clientId', 'userPoolId']
  private authenticationFlowType: string = 'USER_PASSWORD_AUTH'
  private readonly cognitoidentityserviceprovider: any = new AWS.CognitoIdentityServiceProvider({
    region: DEFAULT_COGNITO_REGION,
    apiVersion: '2016-04-18',
  })

  constructor(options: any = {}) {
    this._validateCognitoOptions(options)

    this.cognitoOptions = {
      region: options.region || DEFAULT_COGNITO_REGION,
      clientId: options.clientId || STAGING_COGNITO_CLIENT_ID,
      userPoolId: options.userPoolId || STAGING_COGNITO_USER_POOL_ID,
    }
  }

  async refreshUserSessionTokens(refreshToken: string) {
    try {
      const response = await this._signInWithRefreshToken(refreshToken)

      return response
    } catch (error) {
      throw new SdkError('COR-9')
    }
  }

  async signIn(username: string, password: string): Promise<any> {
    try {
      const response = await this._signIn(username, password)

      return response
    } catch (error) {
      switch (error.code) {
        case 'COR-4':
        case 'UserNotFoundException':
          throw new SdkError('COR-4', { username })

        case 'UserNotConfirmedException':
          throw new SdkError('COR-16', { username })

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

  static setTempSession(ChallengeParameters: any, Session: string): void {
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

      CognitoService.setTempSession(ChallengeParameters, result.Session)

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

  async forgotPassword(Username: string, messageParameters?: MessageParameters): Promise<any> {
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

  async forgotPasswordSubmit(username: string, ConfirmationCode: string, Password: string): Promise<any> {
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

  async signUp(
    Username: string,
    Password: string,
    messageParameters?: MessageParameters,
    options: any = {},
  ): Promise<any> {
    console.log('<CognitoService> signUp')
    let before

    before = Date.now()

    const UserAttributes = this._buildUserAttributes(Username)

    const normalizedUsername = normalizeUsername(Username)

    const { clientId: ClientId } = this.cognitoOptions
    const ClientMetadata = messageParameters || {}

    const params = { ClientId, Password, Username: normalizedUsername, UserAttributes, ClientMetadata }

    try {
      const response = await this.cognitoidentityserviceprovider.signUp(params).promise()
      console.log('  in signUp after this.cognitoidentityserviceprovider.signUp', { diff: Date.now() - before })

      return response
    } catch (error) {
      switch (error.code) {
        case 'UsernameExistsException': {
          before = Date.now()
          const isUserUnconfirmed = await this.isUserUnconfirmed(normalizedUsername)
          console.log('  in signUp after this.isUserUnconfirmed', { diff: Date.now() - before })

          if (isUserUnconfirmed) {
            // NOTE: this will remove unconfirmed user so we won't get here 2nd time
            before = Date.now()
            await WalletStorageService.adminDeleteUnconfirmedUser(normalizedUsername, options)
            console.log('  in signUp after WalletStorageService.adminDeleteUnconfirmedUser', { diff: Date.now() - before })

            before = Date.now()
            await this.signUp(Username, Password, messageParameters, options)
            console.log('  in signUp after WalletStorageService.adminDeleteUnconfirmedUser', { diff: Date.now() - before })

            break
          }

          throw new SdkError('COR-7', { username: normalizedUsername })
        }

        case 'InvalidPasswordException':
          throw new SdkError('COR-6')

        default:
          throw error
      }
    }
  }

  async resendSignUp(Username: string, messageParameters?: MessageParameters): Promise<any> {
    Username = normalizeUsername(Username)

    const { clientId: ClientId } = this.cognitoOptions

    const params = { ClientId, Username }

    if (messageParameters) {
      Object.assign(params, { ClientMetadata: messageParameters })
    }

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

  async confirmSignUp(Username: string, ConfirmationCode: string): Promise<any> {
    console.log('<CognitoService> in confirmSignUp')
    Username = normalizeUsername(Username)

    let before

    before = Date.now()

    const { clientId: ClientId } = this.cognitoOptions

    const params = { ClientId, Username, ConfirmationCode }

    try {
      const response = await this.cognitoidentityserviceprovider.confirmSignUp(params).promise()
      console.log('  in confirmSignUp after this.cognitoidentityserviceprovider.confirmSignUp', { diff: Date.now() - before })

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

  async changePassword(AccessToken: string, PreviousPassword: string, ProposedPassword: string): Promise<any> {
    const params = { AccessToken, PreviousPassword, ProposedPassword }

    return this.cognitoidentityserviceprovider.changePassword(params).promise()
  }

  async changeUsername(AccessToken: string, attribute: string): Promise<any> {
    const userExists = await this._userExists(attribute)

    if (userExists) {
      throw new SdkError('COR-7', { username: attribute })
    }

    const UserAttributes = this._buildUserAttributes(attribute)

    const params = { AccessToken, UserAttributes }

    return this.cognitoidentityserviceprovider.updateUserAttributes(params).promise()
  }

  async confirmChangeUsername(AccessToken: string, attribute: string, confirmationCode: string): Promise<any> {
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
      optionKeys.every((value) => {
        if (!this.cognitoOptionKeys.includes(value)) {
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
  private _getCognitoAuthParametersObject(
    AuthFlow: string,
    username: string = null,
    password: string = null,
    refreshToken: string = null,
  ) {
    let AuthParameters: any = {}

    switch (AuthFlow) {
      case 'USER_PASSWORD_AUTH':
        AuthParameters = {
          USERNAME: username,
          PASSWORD: password,
        }

        break

      case 'CUSTOM_AUTH':
        AuthParameters = {
          USERNAME: username,
        }

        break

      case 'REFRESH_TOKEN_AUTH':
        AuthParameters = {
          REFRESH_TOKEN: refreshToken,
        }
    }

    const { clientId: ClientId } = this.cognitoOptions

    return { AuthFlow, ClientId, AuthParameters }
  }

  /* istanbul ignore next: private method */
  private async _signIn(attribute: string, password: string): Promise<CognitoUserTokens> {
    const username = attribute
    const authFlow = 'USER_PASSWORD_AUTH'

    try {
      const params = this._getCognitoAuthParametersObject(authFlow, username, password)

      const { AuthenticationResult } = await this.cognitoidentityserviceprovider.initiateAuth(params).promise()

      const cognitoUserTokens = this._normalizeTokensFromCognitoAuthenticationResult(AuthenticationResult)

      const { userPoolId } = this.cognitoOptions
      saveUserTokensToSessionStorage(userPoolId, cognitoUserTokens)

      return cognitoUserTokens
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        throw new SdkError('COR-4', { username })
      }

      throw error
    }
  }

  /* istanbul ignore next: private method */
  private _normalizeTokensFromCognitoAuthenticationResult(
    AuthenticationResult: CognitoAuthenticationResult,
  ): CognitoUserTokens {
    const { AccessToken: accessToken, IdToken: idToken, RefreshToken: refreshToken, ExpiresIn } = AuthenticationResult

    // NOTE: ExpiresIn = 3600, in seconds which is 1h
    const expiresIn = Date.now() + ExpiresIn * 1000

    return { accessToken, idToken, refreshToken, expiresIn }
  }

  /* istanbul ignore next: private method */
  private async _signInWithUsername(username: string, messageParameters?: MessageParameters): Promise<any> {
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

    const attributes: any = []

    if (isEmailValid) {
      attributes.push({
        Name: 'email',
        Value: username,
      })
    }

    if (isPhoneNumberValid) {
      attributes.push({
        Name: 'phone_number',
        Value: username,
      })
    }

    return attributes
  }

  /* istanbul ignore next: private function */
  private async _signInWithInvalidPassword(username: string): Promise<any> {
    let errorCode
    let userExists = true
    let isUnconfirmed = false

    const { userPoolId, clientId } = this.cognitoOptions

    const invalidPassword = '1'
    const cognitoService = new CognitoService({ userPoolId, clientId })

    try {
      await cognitoService.signIn(username, invalidPassword)
    } catch (error) {
      errorCode = error.code

      if (errorCode === 'UserNotConfirmedException' || errorCode === 'COR-16') {
        isUnconfirmed = true
      }

      if (errorCode === 'UserNotFoundException' || errorCode === 'COR-4') {
        userExists = false
      }
    }

    return { isUnconfirmed, userExists, errorCode }
  }

  /* istanbul ignore next: private function */
  private async _userExists(username: string): Promise<boolean> {
    const { userExists } = await this._signInWithInvalidPassword(username)

    return userExists
  }
}
