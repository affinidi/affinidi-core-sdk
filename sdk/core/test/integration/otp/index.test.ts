import 'mocha'
import '../env'

import { expect } from 'chai'
import { CommonNetworkMember } from '../../../src/CommonNetworkMember'
import { SdkOptions } from '../../../src/dto/shared.dto'
import SdkError from '../../../src/shared/SdkError'

import { generateUsername, getOptionsForEnvironment } from '../../helpers'
import { MessageParameters } from '../../../dist/dto'
import { TestmailInbox } from '../../helpers/TestmailInbox'

const { COGNITO_PASSWORD } = JSON.parse(process.env.TEST_SECRETS)

const options: SdkOptions = getOptionsForEnvironment()
const { env } = getOptionsForEnvironment(true)

const messageParameters: MessageParameters = {
  message: `Your verification code is: {{CODE}}`,
  subject: `Verification code`,
}

const waitForOtpCode = async (inbox: TestmailInbox): Promise<string> => {
  const { body } = await inbox.waitForNewEmail()
  return body.replace('Your verification code is: ', '')
}

const createInbox = () => new TestmailInbox({ prefix: env, suffix: 'otp.core' })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('CommonNetworkMember [OTP]', () => {
  it('#signIn should send email with OTP code using the provided template (message parameters)', async () => {
    const inbox = createInbox()

    const timestamp = String(Date.now())
    await CommonNetworkMember.signIn(inbox.email, options, {
      message: `Your verification code is: {{CODE}} #${timestamp}`,
      subject: `Code {{CODE}} #${timestamp}`,
    })

    const { subject, body } = await inbox.waitForNewEmail()
    const [messageCode, messageTimestamp] = body.replace('Your verification code is: ', '').split(' #')

    expect(subject).to.equal(`Code {{CODE}} #${timestamp}`) // code should not be replaced due to Cognito's security policy
    expect(messageTimestamp).to.equal(timestamp)
    expect(messageCode).to.be.lengthOf(6)
    expect(Number(messageCode)).not.to.be.NaN
  })

  it('#signIn with skipBackupEncryptedSeed, #storeEncryptedSeed, #signIn', async () => {
    const inbox = createInbox()

    const signInToken = await CommonNetworkMember.signIn(inbox.email, options, messageParameters)
    const signInCode = await waitForOtpCode(inbox)

    const optionsWithSkippedBackupEncryptedSeed: SdkOptions = {
      ...options,
      skipBackupEncryptedSeed: true,
    }

    let { commonNetworkMember } = await CommonNetworkMember.confirmSignIn(
      signInToken,
      signInCode,
      optionsWithSkippedBackupEncryptedSeed,
    )

    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const { password, accessToken, encryptedSeed } = commonNetworkMember

    commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    await commonNetworkMember.storeEncryptedSeed('', '', accessToken)
    await commonNetworkMember.signOut()

    const signInToken2 = await CommonNetworkMember.signIn(inbox.email, options, messageParameters)
    const signInCode2 = await waitForOtpCode(inbox)

    const result = await CommonNetworkMember.confirmSignIn(signInToken2, signInCode2, options)
    expect(result.commonNetworkMember).to.be.an.instanceOf(CommonNetworkMember)
  })

  it('#signIn and #confirmSignIn WHEN user is UNCONFIRMED', async () => {
    const inbox = createInbox()

    await CommonNetworkMember.signUp(inbox.email, null, options, messageParameters)
    await waitForOtpCode(inbox) // ignore first OTP code

    const signInToken = await CommonNetworkMember.signIn(inbox.email, options, messageParameters)
    const signInCode = await waitForOtpCode(inbox)

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(signInToken, signInCode, options)

    expect(isNew).to.be.true
    expect(commonNetworkMember).to.be.an.instanceOf(CommonNetworkMember)
  })

  it('#signUp with password, change email, forgot password, login with password', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await CommonNetworkMember.signUp(inbox.email, password, options, messageParameters)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, signUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    const newInbox = createInbox()

    await commonNetworkMember.changeUsername(newInbox.email, {}, messageParameters)
    const changeUsernameCode = await waitForOtpCode(newInbox)

    await commonNetworkMember.confirmChangeUsername(newInbox.email, changeUsernameCode)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newInbox.email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    await commonNetworkMember.signOut()

    await CommonNetworkMember.forgotPassword(newInbox.email, options, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(newInbox)

    const newPassword = `${password}_updated`
    await CommonNetworkMember.forgotPasswordSubmit(newInbox.email, forgotPasswordCode, newPassword, options)

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newInbox.email, newPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp without password, forget password, change email, login with password', async () => {
    const inbox = createInbox()

    const signUpToken = await CommonNetworkMember.signUp(inbox.email, null, options, messageParameters)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, signUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    await CommonNetworkMember.forgotPassword(inbox.email, options, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(inbox)

    const password = COGNITO_PASSWORD
    await CommonNetworkMember.forgotPasswordSubmit(inbox.email, forgotPasswordCode, password, options)

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(inbox.email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const newInbox = createInbox()

    await commonNetworkMember.changeUsername(newInbox.email, {}, messageParameters)
    const changeUsernameCode = await waitForOtpCode(newInbox)

    await commonNetworkMember.confirmChangeUsername(newInbox.email, changeUsernameCode)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(newInbox.email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp, #resendSignUpConfirmationCode, #confirmSignIn with 1 wrong OTP', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await CommonNetworkMember.signUp(inbox.email, password, options, messageParameters)
    await waitForOtpCode(inbox) // ignore first OTP code

    await CommonNetworkMember.resendSignUpConfirmationCode(inbox.email, options, messageParameters)
    const newSignUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, newSignUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const signInToken = await CommonNetworkMember.signIn(inbox.email, options, messageParameters)

    let error
    try {
      await CommonNetworkMember.confirmSignIn(signInToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.equal('COR-5')

    const signInCode = await waitForOtpCode(inbox)

    const result = await CommonNetworkMember.confirmSignIn(signInToken, signInCode, options)
    expect(result.commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
  })

  it('#confirmSignIn should throw "COR-13" after 3 consecutive wrong OTPs', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await CommonNetworkMember.signUp(inbox.email, password, options, messageParameters)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, signUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

    await commonNetworkMember.signOut()

    const loginToken = await CommonNetworkMember.signIn(inbox.email, options)

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

    const inbox = createInbox()

    await commonNetworkMember.changeUsername(inbox.email, options, messageParameters)
    const changeUsernameCode = await waitForOtpCode(inbox)

    await commonNetworkMember.confirmChangeUsername(inbox.email, changeUsernameCode, options)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(inbox.email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const newPassword = `${password}_updated`

    await commonNetworkMember.changePassword(password, newPassword, options)
    await commonNetworkMember.signOut()

    commonNetworkMember = await CommonNetworkMember.fromLoginAndPassword(inbox.email, newPassword, options)
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  describe('[with existing user]', () => {
    let inbox: TestmailInbox

    before(async () => {
      inbox = createInbox()

      const signUpToken = await CommonNetworkMember.signUp(inbox.email, null, options, messageParameters)
      const signUpCode = await waitForOtpCode(inbox)

      await CommonNetworkMember.confirmSignUp(signUpToken, signUpCode, options)
    })

    it('#signIn and #confirmSignIn', async () => {
      const signInToken = await CommonNetworkMember.signIn(inbox.email, options, messageParameters)
      const signInCode = await waitForOtpCode(inbox)

      const result = await CommonNetworkMember.confirmSignIn(signInToken, signInCode, options)

      expect(result.isNew).to.be.false
      expect(result.commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
    })

    it('#passwordlessLogin should send email with OTP code using the provided template (message parameters)', async () => {
      const timestamp = String(Date.now())
      await CommonNetworkMember.passwordlessLogin(inbox.email, options, {
        message: `Your verification code is: {{CODE}} #${timestamp}`,
        subject: `Code {{CODE}} #${timestamp}`,
      })

      const { body } = await inbox.waitForNewEmail()
      const [messageCode, messageTimestamp] = body.replace('Your verification code is: ', '').split(' #')

      // TODO: update "create-auth-challenge" lambda script to not to replace {{CODE}} in the subject
      // expect(subject).to.equal(`Code {{CODE}} #${timestamp}`) // should not be replaced due to Cognito's security policy
      expect(messageCode).to.be.lengthOf(6)
      expect(Number(messageCode)).not.to.be.NaN
      expect(messageTimestamp).to.equal(timestamp)
    })

    it('#passwordlessLogin and #completeLoginChallenge', async () => {
      const loginToken = await CommonNetworkMember.passwordlessLogin(inbox.email, options, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      const commonNetworkMember = await CommonNetworkMember.completeLoginChallenge(loginToken, loginCode, options)
      expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)
    })

    it.skip('#completeLoginChallenge should throw "COR-17" for expired OTP', async () => {
      const loginToken = await CommonNetworkMember.passwordlessLogin(inbox.email, options, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      await wait(180_000) // wait for 3 minutes before completing the login challenge

      let error
      try {
        await CommonNetworkMember.completeLoginChallenge(loginToken, loginCode, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-17')
    }).timeout(200_000)

    it('#signUp should throw "COR-7" error when signing user with already existing email', async () => {
      const password = COGNITO_PASSWORD

      let error
      try {
        await CommonNetworkMember.signUp(inbox.email, password, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })

    it('#changeUsername should throw "COR-7" error when when changing email to an already existing one', async () => {
      const newInbox = createInbox()
      const password = COGNITO_PASSWORD

      const signUpToken = await CommonNetworkMember.signUp(newInbox.email, password, options, messageParameters)
      const signUpCode = await waitForOtpCode(newInbox)

      const commonNetworkMember = await CommonNetworkMember.confirmSignUp(signUpToken, signUpCode, options)
      expect(commonNetworkMember).to.be.instanceOf(CommonNetworkMember)

      let error
      try {
        await commonNetworkMember.changeUsername(inbox.email, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })
  })
})
