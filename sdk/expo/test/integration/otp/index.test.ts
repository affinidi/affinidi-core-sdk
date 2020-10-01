import 'mocha'

import '../env'

import { expect } from 'chai'
import { __dangerous } from '@affinidi/wallet-core-sdk'

import { AffinityWallet } from '../../../src/AffinityWallet'
import { getOtp } from '../../helpers/getOtp'
import { getOptionsForEnvironment } from '../../helpers/getOptionsForEnvironment'

const signedCredentials = require('../../factory/signedCredentials')

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)

const options: __dangerous.SdkOptions = getOptionsForEnvironment()

const { keyStorageUrl } = options

const DELAY = 1000
// prettier-ignore
const wait = (ms: any) => new global.Promise(resolve => setTimeout(resolve, ms))

const generateEmail = () => {
  const TIMESTAMP = Date.now().toString(16).toUpperCase()

  return `test.user-${TIMESTAMP}@gdwk.in`
}

const cognitoPassword = COGNITO_PASSWORD

describe('AffinityWallet (flows that require OTP)', () => {
  it('#deleteCredentials scenario', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.signUp(cognitoUsername, cognitoPassword)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const networkMember = await AffinityWallet.confirmSignUp(token, signUpOtp, options)

    let credentials

    await networkMember.saveCredentials(signedCredentials)
    credentials = await networkMember.getCredentials()

    expect(credentials).to.have.length(3)

    const credentialIdToDelete = credentials[1].id

    await networkMember.deleteCredential(credentialIdToDelete)
    credentials = await networkMember.getCredentials()

    const credentialIds = credentials.map((credential: any) => credential.id)

    expect(credentialIds).to.not.include(credentialIdToDelete)
    expect(credentials).to.have.length(2)

    await networkMember.deleteAllCredentials()
    credentials = await networkMember.getCredentials()

    expect(credentials).to.have.length(0)
  })

  it('#signIn with skipBackupEncryptedSeed and skipBackupCredentials, #storeEncryptedSeed, #signIn', async () => {
    const cognitoUsername = generateEmail()

    const signInToken = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    let otp = await getOtp()

    const options = {
      skipBackupEncryptedSeed: true,
      skipBackupCredentials: true,
      issueSignupCredential: true,
    }

    const { commonNetworkMember } = await AffinityWallet.confirmSignIn(signInToken, otp, options)
    expect(commonNetworkMember.credentials).not.to.be.empty

    expect(commonNetworkMember).to.be.an.instanceof(AffinityWallet)

    const { password, accessToken, encryptedSeed } = commonNetworkMember

    const networkMember = new AffinityWallet(password, encryptedSeed)

    expect(networkMember).to.be.an.instanceof(AffinityWallet)

    await networkMember.storeEncryptedSeed('', '', accessToken)

    await networkMember.signOut()

    const token = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    otp = await getOtp()

    const result = await AffinityWallet.confirmSignIn(token, otp)

    expect(result.commonNetworkMember).to.be.an.instanceof(AffinityWallet)
    expect(result.commonNetworkMember.credentials).to.be.empty
  })

  it('#signIn and #confirmSignIn WHEN user is UNCONFIRMED', async () => {
    const cognitoUsername = generateEmail()

    await AffinityWallet.signUp(cognitoUsername)

    const token = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    const otp = await getOtp()

    const { isNew, commonNetworkMember } = await AffinityWallet.confirmSignIn(token, otp)

    expect(isNew).to.eql(true)
    expect(commonNetworkMember).to.exist
  })

  it('#signIn and #confirmSignIn WHEN user exists', async () => {
    const cognitoUsername = generateEmail()

    const signUptoken = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    const sighUpOtp = await getOtp()

    const networkMember = await AffinityWallet.confirmSignUp(signUptoken, sighUpOtp)

    await networkMember.signOut()

    const signInToken = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    const signInOtp = await getOtp()

    const { isNew, commonNetworkMember } = await AffinityWallet.confirmSignIn(signInToken, signInOtp)

    expect(isNew).to.eql(false)
    expect(commonNetworkMember).to.exist
  })

  it('#signUp (without password), change password, change username', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.signUp(cognitoUsername)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    let networkMember = await AffinityWallet.confirmSignUp(token, signUpOtp, options)

    expect(networkMember).to.exist

    await networkMember.signOut()

    const forgotPasswordResponse = await AffinityWallet.forgotPassword(cognitoUsername)

    expect(forgotPasswordResponse).to.be.undefined

    const newPassword = COGNITO_PASSWORD

    await wait(DELAY)
    const forgotPasswordOtp = await getOtp()

    const forgotPasswordSubmitResponse = await AffinityWallet.forgotPasswordSubmit(
      cognitoUsername,
      forgotPasswordOtp,
      newPassword,
    )

    expect(forgotPasswordSubmitResponse).to.be.undefined

    networkMember = await AffinityWallet.fromLoginAndPassword(cognitoUsername, newPassword)

    expect(networkMember).to.be.an.instanceof(AffinityWallet)

    const newCognitoUsername = generateEmail()

    await networkMember.changeUsername(newCognitoUsername)

    await wait(DELAY)
    const changeUsernameOtp = await getOtp()

    await networkMember.confirmChangeUsername(newCognitoUsername, changeUsernameOtp)

    await networkMember.signOut()

    networkMember = await AffinityWallet.fromLoginAndPassword(newCognitoUsername, cognitoPassword)

    expect(networkMember).to.be.an.instanceof(AffinityWallet)
  })

  it('#signUp, #resendSignUpConfirmationCode, then #signIn (with 1 wrong OTP)', async () => {
    const cognitoUsername = generateEmail()

    const signUpToken = await AffinityWallet.signUp(cognitoUsername, cognitoPassword)

    await AffinityWallet.resendSignUpConfirmationCode(cognitoUsername)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpOtp, options)

    expect(commonNetworkMember).to.exist

    await commonNetworkMember.signOut()

    // signIn with wrong OTP
    const loginToken = await AffinityWallet.signIn(cognitoUsername)

    let responseError
    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456', { keyStorageUrl })
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-5')

    await wait(DELAY)
    const loginOtp = await getOtp()

    let secondError

    try {
      await AffinityWallet.confirmSignIn(loginToken, loginOtp, { keyStorageUrl })
    } catch (error) {
      secondError = error
    }

    expect(secondError).to.not.exist
  })

  it('#signIn throws `COR-13 / 400` when OTP is wrong 3 times', async () => {
    const cognitoUsername = generateEmail()

    const signUpToken = await AffinityWallet.signUp(cognitoUsername, cognitoPassword)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpOtp, options)

    expect(commonNetworkMember).to.exist

    await commonNetworkMember.signOut()

    // signIn with wrong OTP
    const loginToken = await AffinityWallet.signIn(cognitoUsername)

    let responseError
    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456')
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-5')

    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456')
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-5')

    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456')
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-13')
  })

  it('#signUp, #confirmSignUp to staging env (when options has `dev` as environment)', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.signUp(cognitoUsername, cognitoPassword, { env: 'dev' })

    await wait(DELAY)
    const otp = await getOtp()

    const commonNetworkMember = await AffinityWallet.confirmSignUp(token, otp, { env: 'dev' })

    expect(commonNetworkMember).to.exist
  })

  it.skip('Throws `COR-17 / 400` when OTP is expired (answer provided > 3 minutes)', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.passwordlessLogin(cognitoUsername)

    // NOTE: wait for 180s before providing the answer
    await wait(DELAY)
    const otp = await getOtp()

    let responseError
    try {
      await AffinityWallet.completeLoginChallenge(token, otp)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
    expect(responseError.name).to.eql('COR-17')
  })

  it('#confirmSignIn logIn scenario', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.signUp(cognitoUsername, cognitoPassword)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const networkMember = await AffinityWallet.confirmSignUp(token, signUpOtp, options)

    await networkMember.signOut()

    const signInResponseToken = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    const confirmationCode = await getOtp()

    const { isNew, commonNetworkMember: affinityWallet } = await AffinityWallet.confirmSignIn(
      signInResponseToken,
      confirmationCode,
      { issueSignupCredential: false },
    )

    expect(isNew).to.be.false
    expect(affinityWallet.did).to.exist
    expect(affinityWallet).to.be.an.instanceof(AffinityWallet)
  })

  it('#confirmSignIn logIn scenario with issueVC flag set', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.signUp(cognitoUsername, cognitoPassword)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    const networkMember = await AffinityWallet.confirmSignUp(token, signUpOtp, options)

    await networkMember.signOut()

    const signInResponseToken = await AffinityWallet.signIn(cognitoUsername)

    await wait(DELAY)
    const confirmationCode = await getOtp()

    const { isNew, commonNetworkMember: affinityWallet } = await AffinityWallet.confirmSignIn(
      signInResponseToken,
      confirmationCode,
      { issueSignupCredential: true },
    )

    expect(isNew).to.be.false
    expect(affinityWallet.did).to.exist
    expect(affinityWallet).to.be.an.instanceof(AffinityWallet)
  })
})
