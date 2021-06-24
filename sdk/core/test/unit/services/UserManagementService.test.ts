'use strict'

import * as AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import spies from 'chai-spies'
import chai, { expect } from 'chai'

import UserManagementService from '../../../src/services/UserManagementService'
import { normalizeUsername } from '../../../src/shared/normalizeUsername'
import { MessageParameters } from '../../../src/dto'

import cognitoAccessToken from '../../factory/cognitoAccessToken'
import cognitoAuthSuccessResponse from '../../factory/cognitoAuthSuccessResponse'
import cognitoInitiateCustomAuthResponse from '../../factory/cognitoInitiateCustomAuthResponse'
import cognitoSignInWithUsernameResponseToken from '../../factory/cognitoSignInWithUsernameResponseToken'

chai.use(spies)

const email = 'user@email.com'
const username = 'test_username'
const confirmationCode = '123456'

const successPathTestName = 'success path'
const cognitoErrorTestName = 'throws error when cognito returns error'
const otpExpiredErrorTestName = 'throws `COR-2 / 400` when ExpiredCodeException'
const otpMismatchErrorTestName = 'throws `COR-5 / 400` when CodeMismatchException'
const userNotFoundErrorTestName = 'throws `COR-4 / 404` when UserNotFoundException'

const SIGN_UP = 'signUp'
const INITIATE_AUTH = 'initiateAuth'
const CONFIRM_SIGN_UP = 'confirmSignUp'
const FORGOT_PASSWORD = 'forgotPassword'
const VERIFY_USER_ATTRIBUTE = 'verifyUserAttribute'
const UPDATE_USER_ATTRIBUTES = 'updateUserAttributes'
const CONFIRM_FORGOT_PASSWORD = 'confirmForgotPassword'
const RESEND_CONFIRMATION_CODE = 'resendConfirmationCode'
const RESPOND_TO_AUTH_CHALLENGE = 'respondToAuthChallenge'

const COGNITO_EXCEPTION = 'Exception'
const EXPIRED_CODE_EXCEPTION = 'ExpiredCodeException'
const CODE_MISMATCH_EXCEPTION = 'CodeMismatchException'
const USER_NOT_FOUND_EXCEPTION = 'UserNotFoundException'
const USERNAME_EXISTS_EXCEPTION = 'UsernameExistsException'
const INVALID_PASSWORD_EXCEPTION = 'InvalidPasswordException'
const INVALID_PARAMETER_EXCEPTION = 'InvalidParameterException'
const USER_NOT_CONFIRMED_EXCEPTION = 'UserNotConfirmedException'

const options = {
  clientId: 'fakeClientId',
  userPoolId: 'fakePoolId' as string,
  keyStorageUrl: undefined as string,
  accessApiKey: undefined as string,
}

const cognitoTokens = { accessToken: cognitoAccessToken }

describe('UserManagementService', () => {
  AWSMock.setSDKInstance(AWS)

  afterEach(() => {
    AWSMock.restore('CognitoIdentityServiceProvider')
  })

  const stubMethod = (methodName: string, responseObject: any = null, errorObject: any = null) => {
    if (errorObject) {
      // eslint-disable-next-line
      AWSMock.mock('CognitoIdentityServiceProvider', methodName, (params: any, callback: any) => {
        callback(errorObject, null)
      })

      return
    }

    // eslint-disable-next-line
    AWSMock.mock('CognitoIdentityServiceProvider', methodName, (params: any, callback: any) => {
      callback(null, responseObject)
    })
  }

  describe('#signInWithUsername', () => {
    it(successPathTestName, async () => {
      stubMethod(INITIATE_AUTH, cognitoInitiateCustomAuthResponse)

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.signInWithUsername(email)

      expect(response).to.exist
    })

    it('throws `COR-4 / 404` when user not found', async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.signInWithUsername(email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-4')
      expect(httpStatusCode).to.eql(404)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.signInWithUsername(email)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#completeLoginChallenge', () => {
    it(successPathTestName, async () => {
      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, cognitoAuthSuccessResponse)

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.completeLoginChallenge(token, otp)

      expect(response.accessToken).to.exist
    })

    it('throws `COR-13 / 400` when wrong username or password provided', async () => {
      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken
      const error = { message: 'Incorrect username or password.' }

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.completeLoginChallenge(token, otp)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-13')
      expect(httpStatusCode).to.eql(400)
    })

    it('throws `COR-17 / 400` when OTP expired (> 3 min)', async () => {
      const cognitoException = 'NotAuthorizedException'

      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken
      const error = { code: cognitoException }

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.completeLoginChallenge(token, otp)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { confirmationCode: answer } = context

      expect(code).to.eql('COR-17')
      expect(httpStatusCode).to.eql(400)
      expect(otp).to.eql(answer)
    })

    it(cognitoErrorTestName, async () => {
      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.completeLoginChallenge(token, otp)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#forgotPassword', () => {
    it(successPathTestName, async () => {
      stubMethod(FORGOT_PASSWORD, {})

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.forgotPassword(email)
      expect(response).to.not.exist
    })

    it('throws `COR-4 / 404` when user not found', async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPassword(email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-4')
      expect(httpStatusCode).to.eql(404)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPassword(email)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#forgotPasswordSubmit', () => {
    it(successPathTestName, async () => {
      stubMethod(CONFIRM_FORGOT_PASSWORD, {})

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.forgotPasswordSubmit(email, confirmationCode, 'newPassword')
      expect(response).to.not.exist
    })

    it('throws `COR-3 / 400` when username is not email/phoneNumber', async () => {
      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPasswordSubmit(username, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-3')
      expect(httpStatusCode).to.eql(400)
    })

    it(otpExpiredErrorTestName, async () => {
      const error = { code: EXPIRED_CODE_EXCEPTION }

      stubMethod(CONFIRM_FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPasswordSubmit(email, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code, context, httpStatusCode } = responseError
      const { username, confirmationCode: otp } = context

      expect(code).to.eql('COR-2')
      expect(httpStatusCode).to.eql(400)
      expect(otp).to.eql(confirmationCode)
      expect(username).to.eql(email)
    })

    it(userNotFoundErrorTestName, async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(CONFIRM_FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPasswordSubmit(email, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code, context, httpStatusCode } = responseError
      const { username } = context

      expect(code).to.eql('COR-4')
      expect(httpStatusCode).to.eql(404)
      expect(username).to.eql(email)
    })

    it(otpMismatchErrorTestName, async () => {
      const error = { code: CODE_MISMATCH_EXCEPTION }

      stubMethod(CONFIRM_FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPasswordSubmit(email, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code, context, httpStatusCode } = responseError
      const { username, confirmationCode: otp } = context

      expect(code).to.eql('COR-5')
      expect(httpStatusCode).to.eql(400)
      expect(otp).to.eql(confirmationCode)
      expect(username).to.eql(email)
    })

    it('throws `COR-6 / 400` when InvalidPasswordException', async () => {
      const error = { code: INVALID_PASSWORD_EXCEPTION }

      stubMethod(CONFIRM_FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPasswordSubmit(email, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-6')
      expect(httpStatusCode).to.eql(400)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(CONFIRM_FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.forgotPasswordSubmit(email, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#isUserUnconfirmed', () => {
    it('returns true when cognito.signIn returns UserNotConfirmedException', async () => {
      const error = { code: USER_NOT_CONFIRMED_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.isUserUnconfirmed(email)

      expect(response).to.be.true
    })

    it('returns false when cognito.signIn returns COR-4', async () => {
      const error = { code: 'COR-4' }

      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.isUserUnconfirmed(email)

      expect(response).to.be.false
    })

    it('returns false when cognito.signIn returns UserNotFoundException', async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.isUserUnconfirmed(email)

      expect(response).to.be.false
    })
  })

  describe('#resendSignUp', () => {
    it(successPathTestName, async () => {
      stubMethod(RESEND_CONFIRMATION_CODE, {})

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.resendSignUp(email)
      expect(response).to.not.exist
    })

    it(userNotFoundErrorTestName, async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(RESEND_CONFIRMATION_CODE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.resendSignUp(email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      const normalizedUsername = normalizeUsername(email)

      expect(code).to.eql('COR-4')
      expect(username).to.eql(normalizedUsername)
      expect(httpStatusCode).to.eql(404)
    })

    it('throws `COR-8 / 409` when InvalidParameterException', async () => {
      const error = { code: INVALID_PARAMETER_EXCEPTION }

      stubMethod(RESEND_CONFIRMATION_CODE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.resendSignUp(email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      const normalizedUsername = normalizeUsername(email)

      expect(code).to.eql('COR-8')
      expect(username).to.eql(normalizedUsername)
      expect(httpStatusCode).to.eql(409)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(RESEND_CONFIRMATION_CODE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.resendSignUp(email)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#signUp', () => {
    it(successPathTestName, async () => {
      stubMethod(SIGN_UP, {})

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.signUp(email, 'password', undefined)

      expect(response).to.exist
    })

    it('throws `COR-7 / 409` when UsernameExistsException and isUserUnconfirmed === false', async () => {
      const error = { code: USERNAME_EXISTS_EXCEPTION }

      stubMethod(SIGN_UP, null, error)
      stubMethod(INITIATE_AUTH, null, {})

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.signUp(email, 'password', undefined)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      const normalizedUsername = normalizeUsername(username)

      expect(code).to.eql('COR-7')
      expect(username).to.eql(normalizedUsername)
      expect(httpStatusCode).to.eql(409)
    })

    it('throws `COR-6 / 400` when password requirements are not met', async () => {
      const error = { code: INVALID_PASSWORD_EXCEPTION }

      stubMethod(SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.signUp(email, 'password', undefined)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-6')
      expect(httpStatusCode).to.eql(400)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.signUp(email, 'password', undefined)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#confirmSignUp', () => {
    it(successPathTestName, async () => {
      stubMethod(CONFIRM_SIGN_UP, {})
      stubMethod(INITIATE_AUTH, cognitoAuthSuccessResponse)

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.confirmSignUp(`${email}::`, confirmationCode)

      expect(response).to.exist
    })

    it(userNotFoundErrorTestName, async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmSignUp(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      const normalizedUsername = normalizeUsername(email)

      expect(code).to.eql('COR-4')
      expect(username).to.eql(normalizedUsername)
      expect(httpStatusCode).to.eql(404)
    })

    it(otpExpiredErrorTestName, async () => {
      const error = { code: EXPIRED_CODE_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmSignUp(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username, confirmationCode: otp } = context

      const normalizedUsername = normalizeUsername(email)

      expect(code).to.eql('COR-2')
      expect(username).to.eql(normalizedUsername, otp)
      expect(httpStatusCode).to.eql(400)
    })

    it(otpMismatchErrorTestName, async () => {
      const error = { code: CODE_MISMATCH_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmSignUp(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username, confirmationCode: otp } = context

      const normalizedUsername = normalizeUsername(email)

      expect(code).to.eql('COR-5')
      expect(username).to.eql(normalizedUsername, otp)
      expect(httpStatusCode).to.eql(400)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmSignUp(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#changeUsername', () => {
    describe('[username is not taken]', () => {
      beforeEach(() => {
        stubMethod(INITIATE_AUTH, null, { code: USER_NOT_FOUND_EXCEPTION })
      })

      it(successPathTestName, async () => {
        stubMethod(UPDATE_USER_ATTRIBUTES, {})

        const userManagementService = new UserManagementService(options)
        const response = await userManagementService.changeUsername(cognitoTokens, email)

        expect(response).to.exist
      })

      it('should use email message parameters when provided', async () => {
        const messageParameters: MessageParameters = {
          message: 'Fake message',
          htmlMessage: 'Fake html message',
          subject: 'Fake subject',
        }

        AWSMock.mock('CognitoIdentityServiceProvider', UPDATE_USER_ATTRIBUTES, (params: any, callback: any) => {
          expect(params.ClientMetadata).to.equal(messageParameters)
          callback(null, {})
        })

        const userManagementService = new UserManagementService(options)
        const response = await userManagementService.changeUsername(cognitoTokens, email, messageParameters)
        expect(response).to.exist
      })
    })

    it('throws `COR-7 / 409` when new username already exists', async () => {
      stubMethod(INITIATE_AUTH, null, {})
      stubMethod(UPDATE_USER_ATTRIBUTES, {})

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.changeUsername(cognitoTokens, email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-7')
      expect(httpStatusCode).to.eql(409)
    })
  })

  describe('#confirmChangeUsername', () => {
    it(successPathTestName, async () => {
      stubMethod(VERIFY_USER_ATTRIBUTE, {})

      const userManagementService = new UserManagementService(options)
      const response = await userManagementService.confirmChangeUsername(cognitoTokens, email, confirmationCode)

      expect(response).to.exist
    })

    it(otpExpiredErrorTestName, async () => {
      const error = { code: EXPIRED_CODE_EXCEPTION }

      stubMethod(VERIFY_USER_ATTRIBUTE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmChangeUsername(cognitoTokens, email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-2')
      expect(httpStatusCode).to.eql(400)
    })

    it(otpMismatchErrorTestName, async () => {
      const error = { code: CODE_MISMATCH_EXCEPTION }

      stubMethod(VERIFY_USER_ATTRIBUTE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmChangeUsername(cognitoTokens, email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-5')
      expect(httpStatusCode).to.eql(400)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(VERIFY_USER_ATTRIBUTE, null, error)

      const userManagementService = new UserManagementService(options)

      let responseError

      try {
        await userManagementService.confirmChangeUsername(cognitoTokens, email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      expect(responseError.code).to.eql(COGNITO_EXCEPTION)
    })
  })
})
