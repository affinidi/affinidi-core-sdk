import 'mocha'
import '../env'

import { expect } from 'chai'
import { SdkError } from '@affinidi/tools-common'
import { AffinidiWallet, checkIsWallet } from '../../helpers/AffinidiWallet'
import { SdkOptions } from '../../../src/dto/shared.dto'

import { generateUsername, getBasicOptionsForEnvironment, testSecrets } from '../../helpers'
import { MessageParameters } from '../../../dist/dto'
import { TestmailInbox } from '../../../src/test-helpers'

const parallel = require('mocha.parallel')

const { COGNITO_PASSWORD } = testSecrets

const options = getBasicOptionsForEnvironment()
const { env } = options

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

function checkIsString(value: string | unknown): asserts value is string {
  expect(value).to.be.a('string')
}

parallel('CommonNetworkMember [OTP]', () => {
  it('sends email with OTP code using the provided template (message parameters) when #signIn is called', async () => {
    const inbox = createInbox()

    const timestamp = String(Date.now())
    await AffinidiWallet.signIn(inbox.email, options, {
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

    const signInToken = await AffinidiWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const optionsWithSkippedBackupEncryptedSeed: SdkOptions = {
      ...options,
      skipBackupEncryptedSeed: true,
    }

    let { commonNetworkMember } = await AffinidiWallet.confirmSignIn(
      signInToken,
      signInCode,
      optionsWithSkippedBackupEncryptedSeed,
    )

    checkIsWallet(commonNetworkMember)

    const { password, accessToken, encryptedSeed } = commonNetworkMember

    commonNetworkMember = new AffinidiWallet(password, encryptedSeed, options)

    await commonNetworkMember.storeEncryptedSeed('', '', accessToken)
    await commonNetworkMember.signOut(options)

    const signInToken2 = await AffinidiWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken2)
    const signInCode2 = await waitForOtpCode(inbox)

    const result = await AffinidiWallet.confirmSignIn(signInToken2, signInCode2, options)
    checkIsWallet(result.commonNetworkMember)
  })

  it('registers new user after confirmation code from the first call to #signIn was ignored; #signUpConfirm returns { isNew: true }', async () => {
    const inbox = createInbox()

    await AffinidiWallet.signUp(inbox.email, null, options, messageParameters)
    await waitForOtpCode(inbox) // ignore first OTP code

    const signInToken = await AffinidiWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const { isNew, commonNetworkMember } = await AffinidiWallet.confirmSignIn(signInToken, signInCode, options)

    expect(isNew).to.be.true
    checkIsWallet(commonNetworkMember)
  })

  it('changes forgotten password after email was changed for user registered with email and password', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinidiWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await AffinidiWallet.confirmSignUp(signUpToken, signUpCode, options)
    checkIsWallet(commonNetworkMember)

    const newInbox = createInbox()

    await commonNetworkMember.changeUsername(newInbox.email, options, messageParameters)
    const changeUsernameCode = await waitForOtpCode(newInbox)

    await commonNetworkMember.confirmChangeUsername(newInbox.email, changeUsernameCode, options)
    await commonNetworkMember.signOut(options)
    // NOTE: try/catch added as a workaround because of issue NotAuthorizedException see https://github.com/aws-amplify/amplify-js/issues/9838
    try {
      commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(newInbox.email, password, options)
    } catch (err) {
      commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(newInbox.email, password, options)
    }

    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.signOut(options)

    await AffinidiWallet.forgotPassword(newInbox.email, options, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(newInbox)

    const newPassword = `${password}_updated`
    await AffinidiWallet.forgotPasswordSubmit(newInbox.email, forgotPasswordCode, newPassword, options)

    commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(newInbox.email, newPassword, options)
    checkIsWallet(commonNetworkMember)
  })

  it('changes forgotten password after email was changed for user registered with email but without password', async () => {
    const inbox = createInbox()

    const signUpToken = await AffinidiWallet.signUp(inbox.email, null, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await AffinidiWallet.confirmSignUp(signUpToken, signUpCode, options)
    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.signOut(options)

    await AffinidiWallet.forgotPassword(inbox.email, options, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(inbox)

    const password = COGNITO_PASSWORD
    await AffinidiWallet.forgotPasswordSubmit(inbox.email, forgotPasswordCode, password, options)

    commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(inbox.email, password, options)
    checkIsWallet(commonNetworkMember)

    const newInbox = createInbox()

    await commonNetworkMember.changeUsername(newInbox.email, options, messageParameters)
    const changeUsernameCode = await waitForOtpCode(newInbox)

    await commonNetworkMember.confirmChangeUsername(newInbox.email, changeUsernameCode, options)
    await commonNetworkMember.signOut(options)
    // NOTE: try/catch added as a workaround because of issue NotAuthorizedException see https://github.com/aws-amplify/amplify-js/issues/9838
    try {
      commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(newInbox.email, password, options)
    } catch (err) {
      commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(newInbox.email, password, options)
    }

    checkIsWallet(commonNetworkMember)
  })

  it('confirms signing up with resent confirmation code; allows to sign in with a correct confirmation code after 1 call to #confirmSignIn with wrong confirmation code', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinidiWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    await waitForOtpCode(inbox) // skip first OTP code

    await AffinidiWallet.resendSignUpConfirmationCode(inbox.email, options, messageParameters)
    const newSignUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinidiWallet.confirmSignUp(signUpToken, newSignUpCode, options)
    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.signOut(options)

    const signInToken = await AffinidiWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)

    let error
    try {
      await AffinidiWallet.confirmSignIn(signInToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.equal('COR-5')

    const signInCode = await waitForOtpCode(inbox)

    const result = await AffinidiWallet.confirmSignIn(signInToken, signInCode, options)
    checkIsWallet(result.commonNetworkMember)
  })

  it('throws COR-13 at the third call to #confirmSignIn with wrong confirmation code', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinidiWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinidiWallet.confirmSignUp(signUpToken, signUpCode, options)
    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.signOut(options)

    const loginToken = await AffinidiWallet.signIn(inbox.email, options)
    checkIsString(loginToken)

    let error
    try {
      await AffinidiWallet.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await AffinidiWallet.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await AffinidiWallet.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-13')
  })

  it('logs in with email and new password after adding email to username-only account and changing password', async () => {
    const username = generateUsername()
    const password = COGNITO_PASSWORD

    let commonNetworkMember = await AffinidiWallet.signUp(username, password, options)
    checkIsWallet(commonNetworkMember)

    const inbox = createInbox()

    await commonNetworkMember.changeUsername(inbox.email, options, messageParameters)
    const changeUsernameCode = await waitForOtpCode(inbox)

    await commonNetworkMember.confirmChangeUsername(inbox.email, changeUsernameCode, options)
    await commonNetworkMember.signOut(options)

    commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(inbox.email, password, options)
    checkIsWallet(commonNetworkMember)

    const newPassword = `${password}_updated`

    await commonNetworkMember.changePassword(password, newPassword, options)
    await commonNetworkMember.signOut(options)

    commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(inbox.email, newPassword, options)
    checkIsWallet(commonNetworkMember)
  })

  describe('for confirmed user registered with email and no password', () => {
    const createUser = async () => {
      const inbox = createInbox()

      const signUpToken = await AffinidiWallet.signUp(inbox.email, null, options, messageParameters)
      checkIsString(signUpToken)
      const signUpCode = await waitForOtpCode(inbox)

      const originalNetworkMember = await AffinidiWallet.confirmSignUp(signUpToken, signUpCode, options)

      return { inbox, originalNetworkMember }
    }

    it('logs user in without password using #signIn and #confirmSignIn', async () => {
      const { inbox } = await createUser()
      const signInToken = await AffinidiWallet.signIn(inbox.email, options, messageParameters)
      checkIsString(signInToken)
      const signInCode = await waitForOtpCode(inbox)

      const result = await AffinidiWallet.confirmSignIn(signInToken, signInCode, options)

      expect(result.isNew).to.be.false
      checkIsWallet(result.commonNetworkMember)
      expect(result.commonNetworkMember.did).to.exist
    })

    it('sends email with OTP code using the provided template (message parameters) when #passwordlessLogin is called', async () => {
      const { inbox } = await createUser()
      const timestamp = String(Date.now())
      await AffinidiWallet.passwordlessLogin(inbox.email, options, {
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

    it('logs user in without password using #passwordlessLogin and #completeLoginChallenge', async () => {
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.passwordlessLogin(inbox.email, options, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      const commonNetworkMember = await AffinidiWallet.completeLoginChallenge(loginToken, loginCode, options)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
    })

    it.skip('throws COR-13 at attempt to call #completeLoginChallenge with expired confirmation code', async function () {
      this.timeout(200_000)
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.passwordlessLogin(inbox.email, options, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      await wait(180_000) // wait for 3 minutes before completing the login challenge

      let error
      try {
        await AffinidiWallet.completeLoginChallenge(loginToken, loginCode, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-17')
    })

    it('throws "COR-7" at attempt to call #signUp with the same email and some password', async () => {
      const { inbox } = await createUser()
      const password = COGNITO_PASSWORD

      let error
      try {
        await AffinidiWallet.signUp(inbox.email, password, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })

    it('throws "COR-7" at attempt to change email of the newly registered (with email) account to the one used at the registration of the existing account', async () => {
      const { inbox } = await createUser()
      const newInbox = createInbox()
      const password = COGNITO_PASSWORD

      const signUpToken = await AffinidiWallet.signUp(newInbox.email, password, options, messageParameters)
      checkIsString(signUpToken)
      const signUpCode = await waitForOtpCode(newInbox)

      const commonNetworkMember = await AffinidiWallet.confirmSignUp(signUpToken, signUpCode, options)
      checkIsWallet(commonNetworkMember)

      let error
      try {
        await commonNetworkMember.changeUsername(inbox.email, options)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })

    it('allows to change email after password was reset for user registered with email', async () => {
      const { inbox, originalNetworkMember } = await createUser()
      await originalNetworkMember.signOut(options)

      const newInbox = createInbox()
      const newPassword = COGNITO_PASSWORD

      {
        await AffinidiWallet.forgotPassword(inbox.email, options, messageParameters)
        const forgotPasswordCode = await waitForOtpCode(inbox)
        await AffinidiWallet.forgotPasswordSubmit(inbox.email, forgotPasswordCode, newPassword, options)
      }

      {
        const commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(inbox.email, newPassword, options)
        checkIsWallet(commonNetworkMember)

        await commonNetworkMember.changeUsername(newInbox.email, options, messageParameters)
        const changeUsernameOtp = await waitForOtpCode(newInbox)

        await commonNetworkMember.confirmChangeUsername(newInbox.email, changeUsernameOtp, options)
        await commonNetworkMember.signOut(options)
      }

      {
        const commonNetworkMember = await AffinidiWallet.fromLoginAndPassword(newInbox.email, newPassword, options)
        checkIsWallet(commonNetworkMember)
      }
    })
  })
})
