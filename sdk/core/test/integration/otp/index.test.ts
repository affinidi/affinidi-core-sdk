import 'mocha'

import '../env'

import { expect } from 'chai'
import { CommonNetworkMember } from '../../../src/CommonNetworkMember'
import { SdkOptions } from '../../../src/dto/shared.dto'

import { getOtp, generateUsername, generateEmail, getOptionsForEnvironment } from '../../helpers'
import { MessageParameters } from '../../../dist/dto'
import { TestmailHelper } from '../../helpers/TestmailHelper'

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)

const options: SdkOptions = getOptionsForEnvironment()

const DELAY = 1000
// prettier-ignore
const wait = (ms: any) => new global.Promise(resolve => setTimeout(resolve, ms))

const cognitoPassword = COGNITO_PASSWORD

const prepareOtpMessageParameters = (testId: number, suffix?: string): [string, string, MessageParameters] => {
  const messageParameters: MessageParameters = {
    message: `Your verification code is: {{CODE}} #${testId}`,
    subject: `Code #${testId}`,
  }

  const { env } = getOptionsForEnvironment(true)
  let tag = `${env}.${testId}.otp`
  if (suffix) {
    tag = `${tag}.${suffix}`
  }

  const username = TestmailHelper.generateEmailForTag(tag)
  return [username, tag, messageParameters]
}

const waitForOtpCode = async (tag: string, timestampFrom?: number): Promise<[string, number]> => {
  const { text, html } = await TestmailHelper.waitForNewEmail(tag, timestampFrom)

  // TODO: investigate why "text" is not provided sometimes
  const [messageCode, messageTestId] = (text || html).replace('Your verification code is: ', '').split(' #')
  return [messageCode, Number(messageTestId)]
}

describe.only('CommonNetworkMember (flows that require OTP)', () => {
  // testmail recommends to use unique IDs for each test run to avoid collisions
  let testId: number

  beforeEach(() => {
    testId = Date.now()
  })

  it('#signIn with skipBackupEncryptedSeed, #storeEncryptedSeed, #signIn', async () => {
    const [username, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp1 = Date.now()
    const token1 = await CommonNetworkMember.signIn(username, options, messageParameters)

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
    const token2 = await CommonNetworkMember.signIn(username, options, messageParameters)

    const [otpCode2, testId2] = await waitForOtpCode(tag, timestamp2)
    expect(testId2).to.equal(testId)

    const result = await CommonNetworkMember.confirmSignIn(token2, otpCode2, options)
    expect(result.commonNetworkMember).to.be.an.instanceOf(CommonNetworkMember)
  })

  it('#signIn and #confirmSignIn WHEN user is UNCONFIRMED', async () => {
    const [username, tag, messageParameters] = prepareOtpMessageParameters(testId)

    await CommonNetworkMember.signUp(username, null, options, messageParameters)

    const token = await CommonNetworkMember.signIn(username, options, messageParameters)

    // ignore the first OTP email
    const otpEmail1 = await TestmailHelper.waitForNewEmail(tag)
    const [otpCode] = await waitForOtpCode(tag, otpEmail1.timestamp + 1)

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(token, otpCode, options)

    expect(isNew).to.be.true
    expect(commonNetworkMember).to.be.an.instanceOf(CommonNetworkMember)
  })

  it('#signIn and #confirmSignIn WHEN user exists', async () => {
    const [username, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp1 = Date.now()
    const token1 = await CommonNetworkMember.signIn(username, options, messageParameters)

    const [otpCode1] = await waitForOtpCode(tag, timestamp1)

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token1, otpCode1, options)
    await commonNetworkMember.signOut()

    const timestamp2 = Date.now()
    const token2 = await CommonNetworkMember.signIn(username, options, messageParameters)

    const [otpCode2] = await waitForOtpCode(tag, timestamp2)

    const result = await CommonNetworkMember.confirmSignIn(token2, otpCode2, options)

    expect(result.isNew).to.be.false
    expect(result.commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
  })

  it('#signUp, change email, change password, login', async () => {
    const [username, tag, messageParameters] = prepareOtpMessageParameters(testId)
    const password = COGNITO_PASSWORD

    const timestamp1 = Date.now()
    const token = await CommonNetworkMember.signUp(username, password, options, messageParameters)

    const [otpCode1] = await waitForOtpCode(tag, timestamp1)

    let commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otpCode1, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    const [newUsername, newTag, newMessageParameters] = prepareOtpMessageParameters(testId, 'updated')

    const timestamp2 = Date.now()
    await commonNetworkMember.changeUsername(newUsername, {}, newMessageParameters)

    const [otpCode2] = await waitForOtpCode(newTag, timestamp2)

    await commonNetworkMember.confirmChangeUsername(newUsername, otpCode2)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newUsername, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const timestamp3 = Date.now()
    await CommonNetworkMember.forgotPassword(newUsername, options, newMessageParameters)

    const [otpCode3] = await waitForOtpCode(newTag, timestamp3)

    const newPassword = `${password}_updated`
    await CommonNetworkMember.forgotPasswordSubmit(newUsername, otpCode3, newPassword, options)

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newUsername, newPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp (without password), change password, change username', async () => {
    const [username, tag, messageParameters] = prepareOtpMessageParameters(testId)

    const timestamp1 = Date.now()
    const token = await CommonNetworkMember.signUp(username, null, options, messageParameters)

    const [otpCode1] = await waitForOtpCode(tag, timestamp1)

    let commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otpCode1, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const timestamp2 = Date.now()
    await CommonNetworkMember.forgotPassword(username, options, messageParameters)

    const [otpCode2] = await waitForOtpCode(tag, timestamp2)

    const newPassword = COGNITO_PASSWORD
    await CommonNetworkMember.forgotPasswordSubmit(username, otpCode2, newPassword, options)

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(username, newPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const [newUsername, newTag, newMessageParameters] = prepareOtpMessageParameters(testId, 'updated')

    const timestamp3 = Date.now()
    await commonNetworkMember.changeUsername(newUsername, {}, newMessageParameters)

    const [otpCode3] = await waitForOtpCode(newTag, timestamp3)

    await commonNetworkMember.confirmChangeUsername(newUsername, otpCode3)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newUsername, cognitoPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp, #resendSignUpConfirmationCode, then #signIn (with 1 wrong OTP)', async () => {
    const cognitoUsername = generateEmail()

    const signUpToken = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, options)

    await CommonNetworkMember.resendSignUpConfirmationCode(cognitoUsername, options)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, signUpOtp, options)

    expect(commonNetworkMember).to.exist

    await commonNetworkMember.signOut()

    // signIn with wrong OTP
    const loginToken = await CommonNetworkMember.signIn(cognitoUsername, options)

    let responseError
    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-5')

    await wait(DELAY)
    const loginOtp = await getOtp()

    let secondError

    try {
      await CommonNetworkMember.confirmSignIn(loginToken, loginOtp, options)
    } catch (error) {
      secondError = error
    }

    expect(secondError).to.not.exist
  })

  it('#signIn throws `COR-13 / 400` when OTP is wrong 3 times', async () => {
    const cognitoUsername = generateEmail()

    const signUpToken = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, options)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, signUpOtp, options)

    expect(commonNetworkMember).to.exist

    await commonNetworkMember.signOut()

    // signIn with wrong OTP
    const loginToken = await CommonNetworkMember.signIn(cognitoUsername, options)

    let responseError
    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-5')

    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-5')

    try {
      await CommonNetworkMember.confirmSignIn(loginToken, '123456', options)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-13')
  })

  it.skip('Throws `COR-17 / 400` when OTP is expired (answer provided > 3 minutes)', async () => {
    const cognitoUsername = generateEmail()

    const token = await CommonNetworkMember.passwordlessLogin(cognitoUsername, options)

    // NOTE: wait for 180s before providing the answer
    await wait(DELAY)
    const otp = await getOtp()

    let responseError

    try {
      await CommonNetworkMember.completeLoginChallenge(token, otp, options)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-17')
  })

  it('#passwordlessLogin with custom messages ', async () => {
    const stamp = `${Date.now()} stamp`
    const delimiter = ':'
    const messageParameters: MessageParameters = {
      message: `Your verification code is ${delimiter}${stamp}${delimiter}{{CODE}}.`,
      subject: `${stamp}${delimiter}{{CODE}}`,
    }

    const fullOptions = getOptionsForEnvironment(true)
    const tag = `${fullOptions.env}_passwordlessLogin_integration`
    const userName = TestmailHelper.generateEmailForTag(tag)
    const token = await CommonNetworkMember.passwordlessLogin(userName, fullOptions, messageParameters)
    await wait(DELAY)
    const [{ text, subject }] = await TestmailHelper.getEmailsForTag(tag)
    // eslint-disable-next-line no-unused-vars
    const [_, expectedStampFromMessage, __] = text.split(delimiter)
    const [expectedStampFromSubject, otp] = subject.split(delimiter)
    expect(expectedStampFromMessage).to.equal(stamp)
    expect(expectedStampFromSubject).to.equal(stamp)
    await CommonNetworkMember.completeLoginChallenge(token, otp, fullOptions)
  })

  it('#signUp or change user attribute is not possible for existing email', async () => {
    const cognitoUsername = generateEmail()

    const token = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, options)

    await wait(DELAY)
    const otp = await getOtp()

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otp, options)

    expect(commonNetworkMember).to.exist

    let responseError

    try {
      await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, options)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-7')

    // creating new user
    const cognitoUsernameNew = generateEmail()

    const tokenNew = await CommonNetworkMember.signUp(cognitoUsernameNew, cognitoPassword, options)

    await wait(DELAY)
    const otpNew = await getOtp()

    const commonNetworkMemberNew = await CommonNetworkMember.confirmSignUp(tokenNew, otpNew, options)

    expect(commonNetworkMemberNew).to.exist

    let responseErrorNew

    try {
      await commonNetworkMemberNew.changeUsername(cognitoUsername, options)
    } catch (error) {
      responseErrorNew = error
    }

    expect(responseErrorNew).to.exist
    expect(responseErrorNew.name).to.eql('COR-7')
  })

  it('#signUp with username, add email, signIn with email, change password', async () => {
    const cognitoUsername = generateUsername()

    let networkMember = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)

    const email = generateEmail()

    await networkMember.changeUsername(email, options)

    await wait(DELAY)
    const otp = await getOtp()

    await networkMember.confirmChangeUsername(email, otp, options)

    await networkMember.signOut()

    networkMember = await CommonNetworkMember.fromLoginAndPassword(email, cognitoPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)

    const newPassword = generateUsername() // test.user-175AB... - is OKAY

    await networkMember.changePassword(cognitoPassword, newPassword, options)

    await networkMember.signOut()

    networkMember = await CommonNetworkMember.fromLoginAndPassword(email, newPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)
  })
})
