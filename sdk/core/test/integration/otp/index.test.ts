import 'mocha'
import '../env'

import { expect } from 'chai'
import cryptoRandomString from 'crypto-random-string'

import { CommonNetworkMember } from '../../../src/CommonNetworkMember'
import { SdkOptions } from '../../../src/dto/shared.dto'
import SdkError from '../../../src/shared/SdkError'

import { generateUsername, getOptionsForEnvironment } from '../../helpers'
import { MessageParameters } from '../../../dist/dto'
import { TestmailHelper } from '../../helpers/TestmailHelper'

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)

const options: SdkOptions = getOptionsForEnvironment()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const prepareOtpMessageParameters = (
  testId: string,
  { suffix }: { suffix?: string } = {},
): [string, string, MessageParameters] => {
  const messageParameters: MessageParameters = {
    message: `Your verification code is: {{CODE}} #${testId}`,
    subject: `Code #${testId}`,
  }

  const { env } = getOptionsForEnvironment(true)
  let tag = `${env}.${testId}.otp`
  if (suffix) {
    tag = `${tag}.${suffix}`
  }

  const email = TestmailHelper.generateEmailForTag(tag)
  return [email, tag, messageParameters]
}

const waitForOtpCode = async (tag: string, timestampFrom?: number): Promise<[string, string]> => {
  const { text, html } = await TestmailHelper.waitForNewEmail(tag, timestampFrom)

  // TODO: investigate why "text" is not provided sometimes
  const [messageCode, messageTestId] = (text || html).replace('Your verification code is: ', '').split(' #')
  return [messageCode, messageTestId]
}

describe.only('CommonNetworkMember [OTP]', () => {
  // testmail recommends to use unique IDs for each test run to avoid collisions
  let testId: string

  beforeEach(() => {
    testId = cryptoRandomString({ length: 10 })
  })

  it('#signIn with skipBackupEncryptedSeed, #storeEncryptedSeed, #signIn', async () => {
    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp1 = Date.now()
    const token1 = await CommonNetworkMember.signIn(email, options, messageParameters)

    const [otpCode1, testId1] = await waitForOtpCode(tag, timestamp1)
    expect(testId1).to.equal(testId)

    const optionsWithSkippedBackupEncryptedSeed: SdkOptions = {
      ...options,
      skipBackupEncryptedSeed: true,
    }

    let { commonNetworkMember } = await CommonNetworkMember.confirmSignIn(
      token1,
      otpCode1,
      optionsWithSkippedBackupEncryptedSeed,
    )

    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const { password, accessToken, encryptedSeed } = commonNetworkMember

    commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    await commonNetworkMember.storeEncryptedSeed('', '', accessToken)
    await commonNetworkMember.signOut()

    const timestamp2 = Date.now()
    const token2 = await CommonNetworkMember.signIn(email, options, messageParameters)

    const [otpCode2, testId2] = await waitForOtpCode(tag, timestamp2)
    expect(testId2).to.equal(testId)

    const result = await CommonNetworkMember.confirmSignIn(token2, otpCode2, options)
    expect(result.commonNetworkMember).to.be.an.instanceOf(CommonNetworkMember)
  })

  it('#signIn and #confirmSignIn WHEN user is UNCONFIRMED', async () => {
    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp1 = Date.now()
    await CommonNetworkMember.signUp(email, null, options, messageParameters)

    await waitForOtpCode(tag, timestamp1) // ignore first OTP code

    const timestamp2 = Date.now()
    const token = await CommonNetworkMember.signIn(email, options, messageParameters)

    const [otpCode] = await waitForOtpCode(tag, timestamp2)

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(token, otpCode, options)

    expect(isNew).to.be.true
    expect(commonNetworkMember).to.be.an.instanceOf(CommonNetworkMember)
  })

  it('#signUp with password, change email, forgot password, login with password', async () => {
    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)
    const password = COGNITO_PASSWORD

    const timestamp1 = Date.now()
    const token = await CommonNetworkMember.signUp(email, password, options, messageParameters)

    const [otpCode1] = await waitForOtpCode(tag, timestamp1)

    let commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otpCode1, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    const [newEmail, newTag, newMessageParameters] = prepareOtpMessageParameters(testId, { suffix: 'updated' })

    const timestamp2 = Date.now()
    await commonNetworkMember.changeUsername(newEmail, {}, newMessageParameters)

    const [otpCode2] = await waitForOtpCode(newTag, timestamp2)

    await commonNetworkMember.confirmChangeUsername(newEmail, otpCode2)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newEmail, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const timestamp3 = Date.now()
    await CommonNetworkMember.forgotPassword(newEmail, options, newMessageParameters)

    const [otpCode3] = await waitForOtpCode(newTag, timestamp3)

    const newPassword = `${password}_updated`
    await CommonNetworkMember.forgotPasswordSubmit(newEmail, otpCode3, newPassword, options)

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newEmail, newPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp without password, forget password, change email, login with password', async () => {
    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp1 = Date.now()
    const token = await CommonNetworkMember.signUp(email, null, options, messageParameters)

    const [otpCode1] = await waitForOtpCode(tag, timestamp1)

    let commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otpCode1, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const timestamp2 = Date.now()
    await CommonNetworkMember.forgotPassword(email, options, messageParameters)

    const [otpCode2] = await waitForOtpCode(tag, timestamp2)

    const password = COGNITO_PASSWORD
    await CommonNetworkMember.forgotPasswordSubmit(email, otpCode2, password, options)

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const [newEmail, newTag, newMessageParameters] = prepareOtpMessageParameters(testId, { suffix: 'updated' })

    const timestamp3 = Date.now()
    await commonNetworkMember.changeUsername(newEmail, {}, newMessageParameters)

    const [otpCode3] = await waitForOtpCode(newTag, timestamp3)

    await commonNetworkMember.confirmChangeUsername(newEmail, otpCode3)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newEmail, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp, #resendSignUpConfirmationCode, #confirmSignIn with 1 wrong OTP', async () => {
    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)
    const password = COGNITO_PASSWORD

    const timestamp1 = Date.now()
    const token1 = await CommonNetworkMember.signUp(email, password, options, messageParameters)

    await waitForOtpCode(tag, timestamp1) // ignore first OTP code

    const timestamp2 = Date.now()
    await CommonNetworkMember.resendSignUpConfirmationCode(email, options, messageParameters)

    const [otpCode1] = await waitForOtpCode(tag, timestamp2)

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token1, otpCode1, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const timestamp3 = Date.now()
    const token2 = await CommonNetworkMember.signIn(email, options, messageParameters)

    const [otpCode2] = await waitForOtpCode(tag, timestamp3)

    let error
    try {
      await CommonNetworkMember.confirmSignIn(token2, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.equal('COR-5')

    const result = await CommonNetworkMember.confirmSignIn(token2, otpCode2, options)
    expect(result.commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
  })

  it('#confirmSignIn should throw "COR-13" after 3 consecutive wrong OTPs', async () => {
    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)
    const password = COGNITO_PASSWORD

    const timestamp = Date.now()
    const token = await CommonNetworkMember.signUp(email, password, options, messageParameters)

    const [otpCode] = await waitForOtpCode(tag, timestamp)

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const loginToken = await CommonNetworkMember.signIn(email, options)

    let error
    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-13')
  })

  it('#signUp with username, add email, login with new email, change password, login with new password', async () => {
    const username = generateUsername()
    const password = COGNITO_PASSWORD

    let commonNetworkMember = await CommonNetworkMember.signUp(username, password, options)

    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const [email, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp = Date.now()
    await commonNetworkMember.changeUsername(email, options, messageParameters)

    const [otpCode] = await waitForOtpCode(tag, timestamp)

    await commonNetworkMember.confirmChangeUsername(email, otpCode, options)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const newPassword = `${password}_updated`

    await commonNetworkMember.changePassword(password, newPassword, options)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(email, newPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  describe('[with existing user]', () => {
    let email: string
    let tag: string
    let messageParameters: MessageParameters

    // reuse the same user for all subsequent tests to reduce OTP emails count
    before(async () => {
      ;[email, tag, messageParameters] = prepareOtpMessageParameters(testId, { suffix: 'existing' })

      const timestamp = Date.now()
      const token = await CommonNetworkMember.signUp(email, null, options, messageParameters)

      const [otpCode] = await waitForOtpCode(tag, timestamp)

      await CommonNetworkMember.confirmSignUp(token, otpCode, options)
    })

    it('#signIn and #confirmSignIn', async () => {
      const timestamp = Date.now()
      const token = await CommonNetworkMember.signIn(email, options, messageParameters)

      const [otpCode] = await waitForOtpCode(tag, timestamp)

      const result = await CommonNetworkMember.confirmSignIn(token, otpCode, options)

      expect(result.isNew).to.be.false
      expect(result.commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
    })

    it('#passwordlessLogin and #completeLoginChallenge', async () => {
      const timestamp = Date.now()
      const token = await CommonNetworkMember.passwordlessLogin(email, options, messageParameters)

      const [otpCode] = await waitForOtpCode(tag, timestamp)

      const commonNetworkMember = await CommonNetworkMember.completeLoginChallenge(token, otpCode, options)
      expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
    })

    // requires test timeout >= 180000 ms
    it.skip('#completeLoginChallenge should throw "COR-17" for expired OTP', async () => {
      const timestamp = Date.now()
      const token = await CommonNetworkMember.passwordlessLogin(email, options, messageParameters)

      const [otpCode] = await waitForOtpCode(tag, timestamp)

      await wait(3 * 60 * 1000) // wait for 3 minutes before completing the login challenge

      let error
      try {
        await CommonNetworkMember.completeLoginChallenge(token, otpCode, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-17')
    })

    it('#signUp should throw "COR-7" error when signing user with already existing email', async () => {
      const password = COGNITO_PASSWORD

      let error
      try {
        await CommonNetworkMember.signUp(email, password, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })

    it('#changeUsername should throw "COR-7" error when when changing email to an already existing one', async () => {
      const [newEmail, newTag, newMessageParameters] = prepareOtpMessageParameters(testId, { suffix: 'new' })
      const password = COGNITO_PASSWORD

      const timestamp = Date.now()
      const token = await CommonNetworkMember.signUp(newEmail, password, options, newMessageParameters)

      const [otpCode] = await waitForOtpCode(newTag, timestamp)

      const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otpCode, options)
      expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

      let error
      try {
        await commonNetworkMember.changeUsername(email, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })
  })
})
