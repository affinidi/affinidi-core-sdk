import 'mocha'

import '../env'

import { expect } from 'chai'
import { CommonNetworkMember } from '../../../src/CommonNetworkMember'
import { getOtp } from '../../helpers/getOtp'
import { SdkOptions } from '../../../src/dto/shared.dto'
import { getOptionsForEnvironment } from '../../helpers/getOptionsForEnvironment'

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)

// test agains `dev | prod` // if nothing specified, staging is used by default
const options: SdkOptions = getOptionsForEnvironment()

const { keyStorageUrl } = options

const DELAY = 1000
// prettier-ignore
const wait = (ms: any) => new global.Promise(resolve => setTimeout(resolve, ms))

const generateEmail = () => {
  const TIMESTAMP = Date.now().toString(16).toUpperCase()

  return `test.user-${TIMESTAMP}@gdwk.in`
}

const cognitoPassword = COGNITO_PASSWORD

describe('CommonNetworkMember (flows that require OTP)', () => {
  it('#signIn with skipBackupEncryptedSeed, #storeEncryptedSeed, #signIn', async () => {
    const cognitoUsername = generateEmail()

    const signInToken = await CommonNetworkMember.signIn(cognitoUsername, options)

    await wait(DELAY)
    let otp = await getOtp()

    const optionsWithSkippedBackupEncryptedSeed = Object.assign({}, options, { skipBackupEncryptedSeed: true })

    const { commonNetworkMember } = await CommonNetworkMember.confirmSignIn(signInToken, otp, optionsWithSkippedBackupEncryptedSeed)

    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)

    const { password, accessToken, encryptedSeed } = commonNetworkMember

    const networkMember = new CommonNetworkMember(password, encryptedSeed, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)

    await networkMember.storeEncryptedSeed('', '', accessToken)

    await networkMember.signOut()

    const token = await CommonNetworkMember.signIn(cognitoUsername, options)

    await wait(DELAY)
    otp = await getOtp()

    const result = await CommonNetworkMember.confirmSignIn(token, otp, options)

    expect(result.commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signIn and #confirmSignIn WHEN user is UNCONFIRMED', async () => {
    const cognitoUsername = generateEmail()

    await CommonNetworkMember.signUp(cognitoUsername, null, options)

    const token = await CommonNetworkMember.signIn(cognitoUsername, options)

    await wait(DELAY)
    const otp = await getOtp()

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(token, otp, options)

    expect(isNew).to.eql(true)
    expect(commonNetworkMember).to.exist
  })

  it('#signIn and #confirmSignIn WHEN user exists', async () => {
    const cognitoUsername = generateEmail()

    const signUptoken = await CommonNetworkMember.signIn(cognitoUsername, options)

    await wait(DELAY)
    const sighUpOtp = await getOtp()

    const networkMember = await CommonNetworkMember.confirmSignUp(signUptoken, sighUpOtp, options)

    await networkMember.signOut()

    const signInToken = await CommonNetworkMember.signIn(cognitoUsername, options)

    await wait(DELAY)
    const signInOtp = await getOtp()

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(signInToken, signInOtp, options)

    expect(isNew).to.eql(false)
    expect(commonNetworkMember).to.exist
  })

  it('#signUp, change email, change password, login', async () => {
    const cognitoUsername = generateEmail()

    const token = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, options)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    let networkMember = await CommonNetworkMember.confirmSignUp(token, signUpOtp, options)

    expect(networkMember).to.exist

    const newCognitoUsername = generateEmail()

    await networkMember.changeUsername(newCognitoUsername)

    await wait(DELAY)
    const changeUsernameOtp = await getOtp()

    await networkMember.confirmChangeUsername(newCognitoUsername, changeUsernameOtp)

    await networkMember.signOut()

    networkMember = await CommonNetworkMember.fromLoginAndPassword(newCognitoUsername, cognitoPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)

    await networkMember.signOut()

    const forgotPasswordResponse = await CommonNetworkMember.forgotPassword(newCognitoUsername, options)

    expect(forgotPasswordResponse).to.be.undefined

    const newPassword = COGNITO_PASSWORD

    await wait(DELAY)
    const forgotPasswordOtp = await getOtp()

    const forgotPasswordSubmitResponse = await CommonNetworkMember.forgotPasswordSubmit(
      newCognitoUsername,
      forgotPasswordOtp,
      newPassword,
      options,
    )

    expect(forgotPasswordSubmitResponse).to.be.undefined

    networkMember = await CommonNetworkMember.fromLoginAndPassword(newCognitoUsername, newPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#signUp (without password), change password, change username', async () => {
    const cognitoUsername = generateEmail()

    const token = await CommonNetworkMember.signUp(cognitoUsername, null, options)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    let networkMember = await CommonNetworkMember.confirmSignUp(token, signUpOtp, options)

    expect(networkMember).to.exist

    await networkMember.signOut()

    const forgotPasswordResponse = await CommonNetworkMember.forgotPassword(cognitoUsername, options)

    expect(forgotPasswordResponse).to.be.undefined

    const newPassword = COGNITO_PASSWORD

    await wait(DELAY)
    const forgotPasswordOtp = await getOtp()

    const forgotPasswordSubmitResponse = await CommonNetworkMember.forgotPasswordSubmit(
      cognitoUsername,
      forgotPasswordOtp,
      newPassword,
      options,
    )

    expect(forgotPasswordSubmitResponse).to.be.undefined

    networkMember = await CommonNetworkMember.fromLoginAndPassword(cognitoUsername, newPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)

    const newCognitoUsername = generateEmail()

    await networkMember.changeUsername(newCognitoUsername)

    await wait(DELAY)
    const changeUsernameOtp = await getOtp()

    await networkMember.confirmChangeUsername(newCognitoUsername, changeUsernameOtp)

    await networkMember.signOut()

    networkMember = await CommonNetworkMember.fromLoginAndPassword(newCognitoUsername, cognitoPassword, options)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)
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

  // DIFFERENT API-KEYS
  // it('#signUp, #confirmSignUp to staging env (when options has `dev` as environment)', async () => {
  //   const cognitoUsername = generateEmail()
  //   const optionsEnvDev = Object.assign({}, options, { env: 'dev' })

  //   const token = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword, optionsEnvDev)

  //   await wait(DELAY)
  //   const otp = await getOtp()

  //   const commonNetworkMember = await CommonNetworkMember.confirmSignUp(token, otp, optionsEnvDev)

  //   expect(commonNetworkMember).to.exist
  // })

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
})
