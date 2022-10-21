'use strict'

import * as AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { expect, use as chaiUse } from 'chai'

import { UserManagementService } from '../../src/UserManagementService'
import { normalizeUsername } from '../../src/normalizeUsername'
import { MessageParameters } from '../../src/dto'

import { cognitoAccessToken } from '../factory/cognitoAccessToken'
import { cognitoAuthSuccessResponse } from '../factory/cognitoAuthSuccessResponse'
import { cognitoInitiateCustomAuthResponse } from '../factory/cognitoInitiateCustomAuthResponse'
import { cognitoSignInWithUsernameResponseToken } from '../factory/cognitoSignInWithUsernameResponseToken'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import {
  cognitoUserWithCompleteRegistration,
  cognitoUserWithIncompleteRegistration,
  cognitoUserWithoutRegistrationStatus,
} from '../factory/cognitoUser'

chaiUse(sinonChai)

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
const GET_USER = 'getUser'

const COGNITO_EXCEPTION = 'Exception'
const EXPIRED_CODE_EXCEPTION = 'ExpiredCodeException'
const CODE_MISMATCH_EXCEPTION = 'CodeMismatchException'
const USER_NOT_FOUND_EXCEPTION = 'UserNotFoundException'
const USERNAME_EXISTS_EXCEPTION = 'UsernameExistsException'
const INVALID_PASSWORD_EXCEPTION = 'InvalidPasswordException'
const INVALID_PARAMETER_EXCEPTION = 'InvalidParameterException'
const NOT_AUTHORIZED_EXCEPTION = 'NotAuthorizedException'

const options = {
  region: 'fakeRegion',
  clientId: 'fakeClientId',
  userPoolId: 'fakePoolId' as string,
}

let dependencies: { keyStorageApiService: KeyStorageApiService }

const cognitoTokens = { accessToken: cognitoAccessToken }

describe('UserManagementService', () => {
  AWSMock.setSDKInstance(AWS)

  beforeEach(() => {
    dependencies = {
      keyStorageApiService: sinon.createStubInstance(KeyStorageApiService, {
        adminDeleteIncompleteUser: undefined,
      }),
    }
  })

  afterEach(() => {
    AWSMock.restore('CognitoIdentityServiceProvider')
    sinon.restore()
  })

  const stubMethod = (
    methodName: keyof AWS.CognitoIdentityServiceProvider,
    responseObject: any = null,
    errorObject: any = null,
  ) => {
    // eslint-disable-next-line no-unused-vars
    AWSMock.mock('CognitoIdentityServiceProvider', methodName, (params: any, callback: any) => {
      if (errorObject) callback(errorObject, null)
      else callback(null, responseObject)
    })
  }

  describe('#signInWithUsername', () => {
    it(successPathTestName, async () => {
      stubMethod(INITIATE_AUTH, cognitoInitiateCustomAuthResponse)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.initiateLogInPasswordless(email)

      expect(response).to.exist
    })

    it('throws `COR-4 / 404` when user not found', async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateLogInPasswordless(email)
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateLogInPasswordless(email)
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
      stubMethod(GET_USER, cognitoUserWithCompleteRegistration)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.completeLogInPasswordless(token, otp)

      expect(response.accessToken).to.exist
    })

    it(`${successPathTestName} for old users`, async () => {
      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, cognitoAuthSuccessResponse)
      stubMethod(GET_USER, cognitoUserWithoutRegistrationStatus)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.completeLogInPasswordless(token, otp)

      expect(response.accessToken).to.exist
    })

    it('throws COR-26 / 409 when user registration status is incomplete', async () => {
      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, cognitoAuthSuccessResponse)
      stubMethod(GET_USER, cognitoUserWithIncompleteRegistration)

      const userManagementService = new UserManagementService(options, dependencies)
      try {
        await userManagementService.completeLogInPasswordless(token, otp)
        expect.fail()
      } catch (err) {
        expect(err.code).to.eql('COR-26')
        expect(err.httpStatusCode).to.eql(409)
        expect(dependencies.keyStorageApiService.adminDeleteIncompleteUser).to.be.calledOnce
      }
    })

    it('throws `COR-13 / 400` when wrong username or password provided', async () => {
      const otp = '123456'
      const token = cognitoSignInWithUsernameResponseToken
      const error = { message: 'Incorrect username or password.' }

      stubMethod(RESPOND_TO_AUTH_CHALLENGE, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeLogInPasswordless(token, otp)
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeLogInPasswordless(token, otp)
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeLogInPasswordless(token, otp)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#logInWithPassword', () => {
    it(successPathTestName, async () => {
      stubMethod(INITIATE_AUTH, cognitoAuthSuccessResponse)
      stubMethod(GET_USER, cognitoUserWithCompleteRegistration)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.logInWithPassword('username', 'pAssword123')

      expect(response.accessToken).to.exist
    })

    it(`${successPathTestName} for old users`, async () => {
      stubMethod(INITIATE_AUTH, cognitoAuthSuccessResponse)
      stubMethod(GET_USER, cognitoUserWithoutRegistrationStatus)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.logInWithPassword('username', 'pAssword123')

      expect(response.accessToken).to.exist
    })

    it('throws COR-26 / 409 when user registration status is incomplete', async () => {
      stubMethod(INITIATE_AUTH, cognitoAuthSuccessResponse)
      stubMethod(GET_USER, cognitoUserWithIncompleteRegistration)

      const userManagementService = new UserManagementService(options, dependencies)
      try {
        await userManagementService.logInWithPassword('username', 'pAssword123')
        expect.fail()
      } catch (err) {
        expect(err.code).to.eql('COR-26')
        expect(err.httpStatusCode).to.eql(409)
        expect(dependencies.keyStorageApiService.adminDeleteIncompleteUser).to.be.calledOnce
      }
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }
      stubMethod(INITIATE_AUTH, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      try {
        await userManagementService.logInWithPassword('username', 'pAssword123')
        expect.fail()
      } catch (err) {
        expect(err.code).to.eql(COGNITO_EXCEPTION)
      }
    })
  })

  describe('#logInWithRefreshToken', () => {
    it(successPathTestName, async () => {
      stubMethod(INITIATE_AUTH, cognitoAuthSuccessResponse)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.logInWithRefreshToken('testRefreshToken')

      expect(response.accessToken).to.exist
    })

    it('throws COR-27', async () => {
      stubMethod(INITIATE_AUTH, undefined, { code: NOT_AUTHORIZED_EXCEPTION })

      const userManagementService = new UserManagementService(options, dependencies)
      try {
        await userManagementService.logInWithRefreshToken('testRefreshToken')
        expect.fail()
      } catch (err) {
        expect(err.code).to.eql('COR-27')
        expect(err.httpStatusCode).to.eql(401)
      }
    })

    it(cognitoErrorTestName, async () => {
      stubMethod(INITIATE_AUTH, null, { code: COGNITO_EXCEPTION })

      const userManagementService = new UserManagementService(options, dependencies)

      try {
        await userManagementService.logInWithRefreshToken('testRefreshToken')
        expect.fail()
      } catch (err) {
        expect(err.code).to.eql(COGNITO_EXCEPTION)
      }
    })
  })

  describe('#forgotPassword', () => {
    it(successPathTestName, async () => {
      stubMethod(FORGOT_PASSWORD, {})

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.initiateForgotPassword(email)
      expect(response).to.not.exist
    })

    it('throws `COR-4 / 404` when user not found', async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(FORGOT_PASSWORD, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateForgotPassword(email)
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateForgotPassword(email)
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

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.completeForgotPassword(email, confirmationCode, 'newPassword')
      expect(response).to.not.exist
    })

    it('throws `COR-3 / 400` when username is not email/phoneNumber', async () => {
      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeForgotPassword(username, confirmationCode, 'newPassword')
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeForgotPassword(email, confirmationCode, 'newPassword')
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeForgotPassword(email, confirmationCode, 'newPassword')
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeForgotPassword(email, confirmationCode, 'newPassword')
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeForgotPassword(email, confirmationCode, 'newPassword')
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeForgotPassword(email, confirmationCode, 'newPassword')
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#isUserUnconfirmed', () => {
    it('returns true when keyService returns user exists and unconfirmed', async () => {
      dependencies.keyStorageApiService.doesUserExist = () => Promise.resolve({ userExists: true, isUnconfirmed: true })

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.doesUnconfirmedUserExist(email)

      expect(response).to.be.true
    })

    it('returns false when keyService returns user does not exist', async () => {
      dependencies.keyStorageApiService.doesUserExist = () =>
        Promise.resolve({ userExists: false, isUnconfirmed: false })

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.doesUnconfirmedUserExist(email)

      expect(response).to.be.false
    })

    it('returns false when keyService returns user exists and confirmed', async () => {
      dependencies.keyStorageApiService.doesUserExist = () =>
        Promise.resolve({ userExists: true, isUnconfirmed: false })

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.doesUnconfirmedUserExist(email)

      expect(response).to.be.false
    })
  })

  describe('#resendSignUp', () => {
    it('success path', async () => {
      stubMethod(RESEND_CONFIRMATION_CODE, {})

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.resendSignUpByLogin(email)
      expect(response).to.not.exist
    })

    it('throws `COR-4 / 404` when UserNotFoundException', async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(RESEND_CONFIRMATION_CODE, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.resendSignUpByLogin(email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      expect(code).to.eql('COR-4')
      expect(username).to.eql(email)
      expect(httpStatusCode).to.eql(404)
    })

    it('throws `COR-8 / 409` when InvalidParameterException', async () => {
      const error = { code: INVALID_PARAMETER_EXCEPTION }

      stubMethod(RESEND_CONFIRMATION_CODE, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.resendSignUpByLogin(email)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      expect(code).to.eql('COR-8')
      expect(username).to.eql(email)
      expect(httpStatusCode).to.eql(409)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(RESEND_CONFIRMATION_CODE, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.resendSignUpByLogin(email)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#signUp', () => {
    it('success path', async () => {
      stubMethod(SIGN_UP, {})
      stubMethod(INITIATE_AUTH, null, { code: USER_NOT_FOUND_EXCEPTION })

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.initiateSignUpWithEmailOrPhone(email, 'password')

      expect(response).to.exist
    })

    it('throws `COR-7 / 409` when UsernameExistsException and isUserUnconfirmed === false', async () => {
      const error = { code: USERNAME_EXISTS_EXCEPTION }

      stubMethod(SIGN_UP, null, error)
      stubMethod(INITIATE_AUTH, null, {})

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateSignUpWithEmailOrPhone(email, 'password', undefined)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      expect(code).to.eql('COR-7')
      expect(username).to.eql(email)
      expect(httpStatusCode).to.eql(409)
    })

    it('throws `COR-6 / 400` when password requirements are not met', async () => {
      const error = { code: INVALID_PASSWORD_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, { code: USER_NOT_FOUND_EXCEPTION })
      stubMethod(SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateSignUpWithEmailOrPhone(email, 'password', undefined)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode } = responseError

      expect(code).to.eql('COR-6')
      expect(httpStatusCode).to.eql(400)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(INITIATE_AUTH, null, { code: USER_NOT_FOUND_EXCEPTION })
      stubMethod(SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateSignUpWithEmailOrPhone(email, 'password', undefined)
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
      stubMethod(GET_USER, cognitoUserWithIncompleteRegistration)

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.completeSignUpForEmailOrPhone(`${email}::`, confirmationCode)

      expect(response).to.exist
    })

    it(userNotFoundErrorTestName, async () => {
      const error = { code: USER_NOT_FOUND_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeSignUpForEmailOrPhone(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      expect(code).to.eql('COR-4')
      expect(username).to.eql(email)
      expect(httpStatusCode).to.eql(404)
    })

    it(otpExpiredErrorTestName, async () => {
      const error = { code: EXPIRED_CODE_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeSignUpForEmailOrPhone(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username, confirmationCode: otp } = context

      expect(code).to.eql('COR-2')
      expect(username).to.eql(email)
      expect(httpStatusCode).to.eql(400)
    })

    it(otpMismatchErrorTestName, async () => {
      const error = { code: CODE_MISMATCH_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeSignUpForEmailOrPhone(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code, httpStatusCode, context } = responseError
      const { username } = context

      expect(code).to.eql('COR-5')
      expect(username).to.eql(email)
      expect(httpStatusCode).to.eql(400)
    })

    it(cognitoErrorTestName, async () => {
      const error = { code: COGNITO_EXCEPTION }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeSignUpForEmailOrPhone(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(COGNITO_EXCEPTION)
    })

    it('throws `UM-1 / 400` when NotAuthorizedException to confirm again as the user already confirmed', async () => {
      const error = { code: 'NotAuthorizedException', message: 'User cannot be confirmed. Current status is CONFIRMED' }

      stubMethod(CONFIRM_SIGN_UP, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeSignUpForEmailOrPhone(email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql('UM-1')
    })
  })

  describe('#changeUsername', () => {
    describe('[username is not taken]', () => {
      beforeEach(() => {
        stubMethod(INITIATE_AUTH, null, { code: USER_NOT_FOUND_EXCEPTION })
      })

      it(successPathTestName, async () => {
        stubMethod(UPDATE_USER_ATTRIBUTES, {})

        const userManagementService = new UserManagementService(options, dependencies)
        const response = await userManagementService.initiateChangeLogin(cognitoTokens, email)

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

        const userManagementService = new UserManagementService(options, dependencies)
        const response = await userManagementService.initiateChangeLogin(cognitoTokens, email, messageParameters)
        expect(response).to.exist
      })
    })

    it('throws `COR-7 / 409` when new username already exists', async () => {
      stubMethod(INITIATE_AUTH, null, {})
      stubMethod(UPDATE_USER_ATTRIBUTES, {})

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.initiateChangeLogin(cognitoTokens, email)
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

      const userManagementService = new UserManagementService(options, dependencies)
      const response = await userManagementService.completeChangeLogin(cognitoTokens, email, confirmationCode)

      expect(response).to.exist
    })

    it(otpExpiredErrorTestName, async () => {
      const error = { code: EXPIRED_CODE_EXCEPTION }

      stubMethod(VERIFY_USER_ATTRIBUTE, null, error)

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeChangeLogin(cognitoTokens, email, confirmationCode)
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeChangeLogin(cognitoTokens, email, confirmationCode)
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

      const userManagementService = new UserManagementService(options, dependencies)

      let responseError: any

      try {
        await userManagementService.completeChangeLogin(cognitoTokens, email, confirmationCode)
      } catch (error) {
        responseError = error
      }

      expect(responseError.code).to.eql(COGNITO_EXCEPTION)
    })
  })

  describe('#markRegistrationComplete', () => {
    it(successPathTestName, async () => {
      stubMethod(UPDATE_USER_ATTRIBUTES, {})

      const userManagementService = new UserManagementService(options, dependencies)
      await userManagementService.markRegistrationComplete(cognitoTokens)
    })

    it('throws error from Cognito', async () => {
      stubMethod(UPDATE_USER_ATTRIBUTES, {}, new Error('Cognito Error'))
      const userManagementService = new UserManagementService(options, dependencies)

      try {
        await userManagementService.markRegistrationComplete(cognitoTokens)
        throw new Error('Test Error')
      } catch (err) {
        expect(err.message).to.eql('Cognito Error')
      }
    })
  })

  describe('#adminDeleteIncompleteUser', () => {
    it(successPathTestName, async () => {
      const userManagementService = new UserManagementService(options, dependencies)

      await userManagementService.adminDeleteIncompleteUser(cognitoTokens)

      expect(dependencies.keyStorageApiService.adminDeleteIncompleteUser).to.be.calledOnce
    })
  })
})
