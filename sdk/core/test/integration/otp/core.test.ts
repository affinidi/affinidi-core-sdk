import 'mocha'
import '../env'

import { expect } from 'chai'
// import nock from 'nock'
import { SdkError } from '@affinidi/tools-common'

// import { TrueCallerService } from '@affinidi/user-management'
import {
  AffinidiWalletV6 as AffinidiWallet,
  AffinidiWallet as LegacyAffinidiWallet,
  checkIsWallet,
  AffinidiWallet as AffinityWallet,
} from '../../helpers/AffinidiWallet'
import { SdkOptions } from '../../../src/dto/shared.dto'

import {
  generateUsername,
  // getAllOptionsForEnvironment,
  getBasicOptionsForEnvironment,
  testSecrets,
} from '../../helpers'
import { MessageParameters } from '../../../dist/dto'
import { TestmailInbox } from '../../../src/test-helpers'
// import { trueCallerTestProfile } from '../../factory/trueCallerProfile'
// import { getOptionsFromEnvironment } from '../../../src/shared/getOptionsFromEnvironment'
// import { URL } from 'url'

const parallel = require('mocha.parallel')

const { COGNITO_PASSWORD } = testSecrets

const options = getBasicOptionsForEnvironment()
const { env } = options

// const allOptions = getAllOptionsForEnvironment()
// const allEnvOptions = getOptionsFromEnvironment(allOptions)

const messageParameters: MessageParameters = {
  message: `Your verification code is: {{CODE}}`,
  subject: `Verification code`,
}

const waitForOtpCode = async (inbox: TestmailInbox): Promise<string> => {
  const { body } = await inbox.waitForNewEmail()
  // return 6 digits from the message or message itself if there is no digits
  return (body.match(/\d{6}/) || [body])[0]
}

const createInbox = () => new TestmailInbox({ prefix: env, suffix: 'otp.core' })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function checkIsString(value: string | unknown): asserts value is string {
  expect(value).to.be.a('string')
}

parallel('CommonNetworkMember [OTP]', () => {
  it.skip('sends email with OTP code using the provided template (message parameters) when #signIn is called', async () => {
    const inbox = createInbox()

    const timestamp = String(Date.now())
    await AffinidiWallet.initiateSignInPasswordless(options, inbox.email, {
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

    const signInToken = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const optionsWithSkippedBackupEncryptedSeed: SdkOptions = {
      ...options,
      skipBackupEncryptedSeed: true,
    }

    const { wallet: originalWallet } = await AffinidiWallet.completeSignInPasswordless(
      optionsWithSkippedBackupEncryptedSeed,
      signInToken,
      signInCode,
    )

    checkIsWallet(originalWallet)
    const { password, encryptedSeed } = originalWallet
    const { accessToken } = JSON.parse(originalWallet.serializeSession())

    const legacyWallet = new LegacyAffinidiWallet(password, encryptedSeed, options)
    await legacyWallet.storeEncryptedSeed('', '', accessToken)
    await legacyWallet.signOut(options)

    const signInToken2 = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email, messageParameters)
    checkIsString(signInToken2)
    const signInCode2 = await waitForOtpCode(inbox)

    const result = await AffinidiWallet.completeSignInPasswordless(options, signInToken2, signInCode2)
    checkIsWallet(result.wallet)
  })

  it('registers new user after confirmation code from the first call to #signIn was ignored; #signUpConfirm returns { isNew: true }', async () => {
    const inbox = createInbox()

    await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, null, messageParameters)
    await waitForOtpCode(inbox) // ignore first OTP code

    const signInToken = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const { isNew, wallet } = await AffinidiWallet.completeSignInPasswordless(options, signInToken, signInCode)

    expect(isNew).to.be.true
    checkIsWallet(wallet)
  })

  it('changes forgotten password after email was changed for user registered with email and password', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, password, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await AffinidiWallet.completeSignUp(options, signUpToken, signUpCode)
    checkIsWallet(commonNetworkMember)

    const newInbox = createInbox()

    const changeToken = await commonNetworkMember.initiateChangeEmail(newInbox.email, messageParameters)
    const changeUsernameCode = await waitForOtpCode(newInbox)

    await commonNetworkMember.completeChangeEmailOrPhone(changeToken, changeUsernameCode)
    await commonNetworkMember.logOut()
    // NOTE: try/catch added as a workaround because of issue NotAuthorizedException see https://github.com/aws-amplify/amplify-js/issues/9838
    try {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, newInbox.email, password)
    } catch (err) {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, newInbox.email, password)
    }

    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.logOut()

    const forgotToken = await AffinidiWallet.initiateForgotPassword(options, newInbox.email, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(newInbox)

    const newPassword = `${password}_updated`
    await AffinidiWallet.completeForgotPassword(options, forgotToken, forgotPasswordCode, newPassword)

    commonNetworkMember = await AffinidiWallet.logInWithPassword(options, newInbox.email, newPassword)
    checkIsWallet(commonNetworkMember)
  })

  it('changes forgotten password after email was changed for user registered with email but without password', async () => {
    const inbox = createInbox()

    const signUpToken = await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, null, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await AffinidiWallet.completeSignUp(options, signUpToken, signUpCode)
    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.logOut()

    const forgotToken = await AffinidiWallet.initiateForgotPassword(options, inbox.email, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(inbox)

    const password = COGNITO_PASSWORD
    await AffinidiWallet.completeForgotPassword(options, forgotToken, forgotPasswordCode, password)

    commonNetworkMember = await AffinidiWallet.logInWithPassword(options, inbox.email, password)
    checkIsWallet(commonNetworkMember)

    const newInbox = createInbox()

    const changeToken = await commonNetworkMember.initiateChangeEmail(newInbox.email, messageParameters)
    const changeUsernameCode = await waitForOtpCode(newInbox)

    await commonNetworkMember.completeChangeEmailOrPhone(changeToken, changeUsernameCode)
    await commonNetworkMember.logOut()
    // NOTE: try/catch added as a workaround because of issue NotAuthorizedException see https://github.com/aws-amplify/amplify-js/issues/9838
    try {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, newInbox.email, password)
    } catch (err) {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, newInbox.email, password)
    }

    checkIsWallet(commonNetworkMember)
  })

  it('confirms signing up with resent confirmation code; allows to sign in with a correct confirmation code after 1 call to #confirmSignIn with wrong confirmation code', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, password, messageParameters)
    checkIsString(signUpToken)
    await waitForOtpCode(inbox) // skip first OTP code

    await AffinidiWallet.resendSignUp(options, signUpToken, messageParameters)
    const newSignUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinidiWallet.completeSignUp(options, signUpToken, newSignUpCode)
    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.logOut()

    const signInToken = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email, messageParameters)
    checkIsString(signInToken)

    try {
      await AffinidiWallet.completeSignInPasswordless(options, signInToken, '123456')
      expect.fail('Expected it to throw')
    } catch (error) {
      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.equal('COR-5')
    }

    const signInCode = await waitForOtpCode(inbox)

    const result = await AffinidiWallet.completeSignInPasswordless(options, signInToken, signInCode)
    checkIsWallet(result.wallet)
  })

  it('throws COR-13 at the third call to #confirmSignIn with wrong confirmation code', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, password, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinidiWallet.completeSignUp(options, signUpToken, signUpCode)
    checkIsWallet(commonNetworkMember)

    await commonNetworkMember.logOut()

    const loginToken = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email)
    checkIsString(loginToken)

    let error
    try {
      await AffinidiWallet.completeSignInPasswordless(options, loginToken, '123456')
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await AffinidiWallet.completeSignInPasswordless(options, loginToken, '123456')
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await AffinidiWallet.completeSignInPasswordless(options, loginToken, '123456')
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-13')
  })

  it('throws COR-32 after X calls to #confirmSignIn with wrong confirmation code', async () => {
    const X = 15
    const inbox = createInbox()

    const signinToken = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email)

    const attempt = async (i: number) => {
      try {
        await AffinidiWallet.completeSignInPasswordless(options, signinToken, '123456')
        expect.fail('Error expected')
      } catch (error) {
        expect(error).to.be.instanceOf(SdkError)
        expect(error.name).to.eql(`COR-${i < X ? 5 : 32}`)
      }
    }

    await Array.from({ length: X + 1 }).reduce(
      /* eslint-disable-next-line no-unused-vars */
      async (attempts: Promise<void>, val, i) => attempts.then(() => attempt(i)),
      Promise.resolve(),
    )
  })

  it('logs in with email and new password after adding email to username-only account and changing password', async () => {
    const username = generateUsername()
    const password = COGNITO_PASSWORD

    let commonNetworkMember = await AffinidiWallet.signUpWithUsername(options, username, password)
    checkIsWallet(commonNetworkMember)

    const inbox = createInbox()

    const changeToken = await commonNetworkMember.initiateChangeEmail(inbox.email, messageParameters)
    const changeUsernameCode = await waitForOtpCode(inbox)

    await commonNetworkMember.completeChangeEmailOrPhone(changeToken, changeUsernameCode)
    await commonNetworkMember.logOut()

    try {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, inbox.email, password)
    } catch (err) {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, inbox.email, password)
    }

    checkIsWallet(commonNetworkMember)

    const newPassword = `${password}_updated`

    await commonNetworkMember.changePassword(password, newPassword)
    await commonNetworkMember.logOut()

    try {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, inbox.email, newPassword)
    } catch (err) {
      commonNetworkMember = await AffinidiWallet.logInWithPassword(options, inbox.email, newPassword)
    }

    checkIsWallet(commonNetworkMember)
  })

  describe('for confirmed user registered with email and no password', () => {
    const createUser = async () => {
      const inbox = createInbox()

      const signUpToken = await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, null, messageParameters)
      checkIsString(signUpToken)
      const signUpCode = await waitForOtpCode(inbox)

      const originalNetworkMember = await AffinidiWallet.completeSignUp(options, signUpToken, signUpCode)

      return { inbox, originalNetworkMember }
    }
    const getRandomInt = (min: number, max: number) => {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    const randomOTP = () => `${getRandomInt(100000, 999999)}`

    it('logs user in without password using #signIn and #confirmSignIn', async () => {
      const { inbox } = await createUser()
      const signInToken = await AffinidiWallet.initiateSignInPasswordless(options, inbox.email, messageParameters)
      checkIsString(signInToken)
      const signInCode = await waitForOtpCode(inbox)

      const result = await AffinidiWallet.completeSignInPasswordless(options, signInToken, signInCode)

      expect(result.isNew).to.be.false
      checkIsWallet(result.wallet)
      expect(result.wallet.did).to.exist
    })

    it.skip('sends email with OTP code using the provided template (message parameters) when #passwordlessLogin is called', async () => {
      const { inbox } = await createUser()
      const timestamp = String(Date.now())
      await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, {
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
      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      const commonNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, loginToken, loginCode)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
    })

    it.skip('throws COR-13 at attempt to call #completeLoginChallenge with expired confirmation code', async function () {
      this.timeout(200_000)
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      await wait(180_000) // wait for 3 minutes before completing the login challenge

      let error
      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, loginCode)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-17')
    })

    it('user can make typo in OPT ', async function () {
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-5 error expected')
      } catch (errFirstTry) {
        expect(errFirstTry).to.be.instanceOf(SdkError)
        expect(errFirstTry.name).to.eql('COR-5')
        expect(errFirstTry.context.newToken).to.exist
      }

      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-5 error expected')
      } catch (errSecondTry) {
        expect(errSecondTry).to.be.instanceOf(SdkError)
        expect(errSecondTry.name).to.eql('COR-5')
        expect(errSecondTry.context.newToken).to.exist
      }

      await wait(180)

      const commonNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, loginToken, loginCode)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
    })

    it('user get COR-13 on 3 wrong otp codes ', async function () {
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      await waitForOtpCode(inbox)

      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-5 error expected')
      } catch (errFirstTry) {
        expect(errFirstTry).to.be.instanceOf(SdkError)
        expect(errFirstTry.name).to.eql('COR-5')
        expect(errFirstTry.context.newToken).to.exist
      }

      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-5 error expected')
      } catch (errSecondTry) {
        expect(errSecondTry).to.be.instanceOf(SdkError)
        expect(errSecondTry.name).to.eql('COR-5')
        expect(errSecondTry.context.newToken).to.exist
      }

      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-13 error expected')
      } catch (errThirdTry) {
        expect(errThirdTry).to.be.instanceOf(SdkError)
        expect(errThirdTry.name).to.eql('COR-13')
      }

      await wait(680)
      const newLoginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      const commonNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, newLoginToken, loginCode)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
    })

    it('use newToken session from error for existing OTP', async function () {
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const loginCode = await waitForOtpCode(inbox)
      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-5 error expected')
      } catch (errFirstTry) {
        expect(errFirstTry).to.be.instanceOf(SdkError)
        expect(errFirstTry.name).to.eql('COR-5')
        expect(errFirstTry.context.newToken).to.exist
      }

      let newToken
      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
        expect.fail('COR-5 error expected')
      } catch (errSecondTry) {
        newToken = errSecondTry.context.newToken
        expect(newToken).to.exist
        expect(errSecondTry).to.be.instanceOf(SdkError)
        expect(errSecondTry.name).to.eql('COR-5')
      }

      const commonNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, newToken, loginCode)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
    })

    it('OTP code expire after use ', async function () {
      const { inbox } = await createUser()
      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const loginCode = await waitForOtpCode(inbox)

      const commonNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, loginToken, loginCode)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, loginCode)
        expect.fail('COR-5 error expected')
      } catch (errFirstTry) {
        expect(errFirstTry).to.be.instanceOf(SdkError)
        expect(errFirstTry.name).to.eql('COR-17')
      }

      await wait(680)
      const newLoginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      const newloginCode = await waitForOtpCode(inbox)

      const newNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, newLoginToken, newloginCode)
      checkIsWallet(newNetworkMember)
      expect(newNetworkMember.did).to.exist
    })

    // NUC-269
    it('user is able to login with a new session even if old was with wrong otp', async function () {
      const { inbox } = await createUser()

      const loginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      await waitForOtpCode(inbox)
      try {
        await AffinidiWallet.completeLogInPasswordless(options, loginToken, randomOTP())
      } catch (errFirstTry) {
        expect(errFirstTry).to.be.instanceOf(SdkError)
        expect(errFirstTry.name).to.eql('COR-5')
      }

      const newLoginToken = await AffinidiWallet.initiateLogInPasswordless(options, inbox.email, messageParameters)
      //await this.timeout(1000)
      const newLoginCode = await waitForOtpCode(inbox)

      const commonNetworkMember = await AffinidiWallet.completeLogInPasswordless(options, newLoginToken, newLoginCode)
      checkIsWallet(commonNetworkMember)
      expect(commonNetworkMember.did).to.exist
    })

    it('throws "COR-7" at attempt to call #signUp with the same email and some password', async () => {
      const { inbox } = await createUser()
      const password = COGNITO_PASSWORD

      let error
      try {
        await AffinidiWallet.initiateSignUpByEmail(options, inbox.email, password)
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

      const signUpToken = await AffinidiWallet.initiateSignUpByEmail(
        options,
        newInbox.email,
        password,
        messageParameters,
      )
      checkIsString(signUpToken)
      const signUpCode = await waitForOtpCode(newInbox)

      const commonNetworkMember = await AffinidiWallet.completeSignUp(options, signUpToken, signUpCode)
      checkIsWallet(commonNetworkMember)

      let error
      try {
        await commonNetworkMember.initiateChangeEmail(inbox.email)
      } catch (err) {
        error = err
      }

      expect(error).to.be.instanceOf(SdkError)
      expect(error.name).to.eql('COR-7')
    })

    it('passwordless signIn after email change for arbitrary username name', async () => {
      const generateUsername = () => {
        const TIMESTAMP = Date.now().toString(16).toUpperCase()
        return `test.user-${TIMESTAMP}`
      }

      const networkMemberSignUp = await AffinityWallet.signUp(generateUsername(), 'nuc27!testPassword', options)
      checkIsWallet(networkMemberSignUp)

      expect(networkMemberSignUp.did).to.exist
      const newInbox = createInbox()
      await networkMemberSignUp.changeUsername(newInbox.email, options)
      const changeUsernameOtp = await waitForOtpCode(newInbox)

      await networkMemberSignUp.confirmChangeUsername(newInbox.email, changeUsernameOtp, options)

      await networkMemberSignUp.signOut(options)

      const token = await AffinidiWallet.initiateSignInPasswordless(options, newInbox.email)
      const signInOtp = await waitForOtpCode(newInbox)
      const { wallet, isNew } = await AffinidiWallet.completeSignInPasswordless(options, token, signInOtp)
      expect(isNew).to.be.equal(false)
      checkIsWallet(wallet)
    })

    it('uncongirmed user can make signin', async () => {
      const newInbox = createInbox()

      await AffinityWallet.signUp(newInbox.email, 'nuc27!testPassword', options)
      await waitForOtpCode(newInbox)
      const token = await AffinidiWallet.initiateSignInPasswordless(options, newInbox.email)
      const signInOtp = await waitForOtpCode(newInbox)
      const { wallet } = await AffinidiWallet.completeSignInPasswordless(options, token, signInOtp)
      checkIsWallet(wallet)
    })

    it('allows to change email after password was reset for user registered with email', async () => {
      const { inbox, originalNetworkMember } = await createUser()
      try {
        await originalNetworkMember.logOut()
      } catch (e) {
        console.warn('originalNetworkMember.logOut()', e)
      }

      const newInbox = createInbox()
      const newPassword = COGNITO_PASSWORD

      {
        const token = await AffinidiWallet.initiateForgotPassword(options, inbox.email, messageParameters)
        const forgotPasswordCode = await waitForOtpCode(inbox)
        await AffinidiWallet.completeForgotPassword(options, token, forgotPasswordCode, newPassword)
      }

      {
        const commonNetworkMember = await AffinidiWallet.logInWithPassword(options, inbox.email, newPassword)
        checkIsWallet(commonNetworkMember)

        const changeToken = await commonNetworkMember.initiateChangeEmail(newInbox.email, messageParameters)
        const changeUsernameOtp = await waitForOtpCode(newInbox)

        await commonNetworkMember.completeChangeEmailOrPhone(changeToken, changeUsernameOtp)
        try {
          await commonNetworkMember.logOut()
        } catch (e) {
          console.warn('commonNetworkMember.logOut()', e)
        }
      }

      {
        const commonNetworkMember = await AffinidiWallet.logInWithPassword(options, newInbox.email, newPassword)
        checkIsWallet(commonNetworkMember)
      }
    })
  })
})

// describe('CommonNetworkMember [TrueCaller]', () => {
//   describe('#signInWithProfile', () => {
//     const trueCaller = new TrueCallerService()
//     const trueCallerUrl = trueCaller.getTrueCallerUrl()
//     const parsedUrl = new URL(trueCallerUrl)
//     const { phoneNumber } = trueCaller.parsePayloadProfileTrueCaller(trueCallerTestProfile)
//     /**
//      * `Truecaller` flow supposed to call public `Truecaller` endpoint
//      * that replies with `Truecaller` public key(rsa) used for `Truecaller` user token/profile verification.
//      * We have to mock it with our own public key in order to test our autogenerated fake `Truecaller` token/profile.
//      */
//     const mockTruecallerPublicKeyCall = () => {
//       nock(parsedUrl.origin)
//         .persist()
//         .get(parsedUrl.pathname)
//         .reply(200, [
//           {
//             keyType: 'RSA',
//             key: process.env.TEST_PUBLIC_KEY_STR,
//           },
//         ])
//     }
//
//     const deleteUserIfExists = async () => {
//       const userPoolId = allOptions.userPoolId
//       const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
//         region: allEnvOptions.region,
//         apiVersion: '2016-04-18',
//       })
//
//       const params = {
//         UserPoolId: userPoolId,
//         Limit: 1,
//         Filter: `phone_number = "${phoneNumber}"`,
//       }
//
//       const result = await cognitoidentityserviceprovider.listUsers(params).promise()
//
//       const userExists = result.Users.length > 0
//       if (userExists) {
//         const username = userExists && result.Users[0]?.Username
//
//         await cognitoidentityserviceprovider
//           .adminDeleteUser({
//             UserPoolId: userPoolId,
//             Username: username,
//           })
//           .promise()
//       }
//     }
//
//     beforeEach(async () => {
//       mockTruecallerPublicKeyCall()
//       await deleteUserIfExists()
//     })
//
//     after(() => {
//       nock.cleanAll()
//     })
//
//     it('sign up with truecaller token/profile', async () => {
//       const { wallet } = await AffinidiWallet.signInWithProfile(options, trueCallerTestProfile)
//       checkIsWallet(wallet)
//     })
//
//     it('login with truecaller token/profile(user was created with `signInWithProfile`)', async () => {
//       // create user with sign in method(truecaller flow)
//       await AffinidiWallet.signInWithProfile(options, trueCallerTestProfile)
//
//       // login user with sign in method(truecaller flow)
//       const { wallet } = await AffinidiWallet.signInWithProfile(options, trueCallerTestProfile)
//       checkIsWallet(wallet)
//     })
//
//     it('should throws UM-8 / 400 when token contains mismatch phone number', async () => {
//       try {
//         await AffinidiWallet.signInWithProfile(options, {
//           ...trueCallerTestProfile,
//           phoneNumber: '+919781611001',
//         })
//         expect.fail('The phone number should be the same in the payload and in the token body.')
//       } catch (err) {
//         console.log('err', JSON.stringify(err))
//         expect(err.code).to.equal('UM-8')
//         expect(err.httpStatusCode).to.equal(400)
//         expect(err.message).to.equal('Truecaller token/profile contains mismatched phone numbers.')
//       }
//     })
//   })
// })
