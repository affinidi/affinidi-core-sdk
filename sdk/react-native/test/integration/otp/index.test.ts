import 'mocha'

import '../env'

import { expect } from 'chai'
import { __dangerous } from '@affinidi/wallet-core-sdk'
import { MessageParameters } from '@affinidi/wallet-core-sdk/dist/dto'
import { AffinityWallet } from '../../../src/AffinityWallet'

import { getOptionsForEnvironment } from '../../helpers'
import { openAttestationDocument } from '../../factory/openAttestationDocument'
import { SdkError } from '@affinidi/wallet-core-sdk/dist/shared'

const signedCredentials = require('../../factory/signedCredentials')

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)

const credentialShareRequestToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.e' +
  'yJpbnRlcmFjdGlvblRva2VuIjp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOls' +
  'iQ3JlZGVudGlhbCIsIlRlc3REZW5pc0NyZWQiXSwiY29uc3RyYWludHMiOlt7Ij09IjpbeyJ2Y' +
  'XIiOiJpc3N1ZXIifSwiZGlkOmpvbG86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk' +
  '3YWQ0MzA4YTRhNjg2ZjhlZGE3MDlmMzM4N2QzMDNlNiJdfV19XSwiY2FsbGJhY2tVUkwiOiJod' +
  'HRwczovL2t1ZG9zLWlzc3Vlci1iYWNrZW5kLmFmZmluaXR5LXByb2plY3Qub3JnL2t1ZG9zX29' +
  'mZmVyaW5nLyJ9LCJleHAiOjE2MTI5NjE5NTY3NzAsInR5cCI6ImNyZWRlbnRpYWxSZXF1ZXN0I' +
  'iwianRpIjoiNDkyNjU3MmU2MzU0ZmIxOCIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmV' +
  'jZDU2MTA5YzU2MjM0MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5c' +
  'y0xIn0.4c0de5d6d44d77d38b4c8c7f5d099dee53f938c1baf8b35ded409fda9c44eac73f3' +
  '50b739ac0e5eb4add1961c88d9f0486b37be928bccf2b19fb5a1d2b7c9bbe'

const options: __dangerous.SdkOptions = getOptionsForEnvironment()
const { env } = options

const messageParameters: MessageParameters = {
  message: `Your verification code is: {{CODE}}`,
  subject: `Verification code`,
}

const waitForOtpCode = async (inbox: __dangerous.TestmailInbox): Promise<string> => {
  const { body } = await inbox.waitForNewEmail()
  return body.replace('Your verification code is: ', '')
}

const createInbox = () => new __dangerous.TestmailInbox({ prefix: env, suffix: 'otp.react-native' })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function checkIsString(value: string | unknown): asserts value is string {
  expect(value).to.be.a('string')
}

describe('AffinityWallet [OTP]', () => {
  it('Save Open Attestation credential and #deleteCredential scenario', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    await commonNetworkMember.saveCredentials([openAttestationDocument])

    let credentials = await commonNetworkMember.getCredentials(credentialShareRequestToken)
    expect(credentials).to.have.length(0)

    credentials = await commonNetworkMember.getCredentials()
    expect(credentials).to.have.length(1)

    const firstCredential = credentials[0]
    const credentialIdToDelete = __dangerous.isW3cCredential(firstCredential)
      ? firstCredential.id
      : firstCredential.data.id

    await commonNetworkMember.deleteCredential(credentialIdToDelete)
    credentials = await commonNetworkMember.getCredentials()

    const credentialIds = credentials.map((credential: any) => {
      return __dangerous.isW3cCredential(credential) ? credential.id : credential.data.id
    })

    expect(credentialIds).to.not.include(credentialIdToDelete)
    expect(credentials).to.have.length(0)
  })

  it('#deleteCredentials scenario', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    await commonNetworkMember.saveCredentials(signedCredentials)

    let credentials = await commonNetworkMember.getCredentials()
    expect(credentials).to.have.length(3)

    const credentialIdToDelete = credentials[1].id
    await commonNetworkMember.deleteCredential(credentialIdToDelete)

    credentials = await commonNetworkMember.getCredentials()
    const credentialIds = credentials.map((credential: any) => credential.id)

    expect(credentialIds).to.not.include(credentialIdToDelete)
    expect(credentials).to.have.length(2)

    await commonNetworkMember.deleteAllCredentials()

    credentials = await commonNetworkMember.getCredentials()
    expect(credentials).to.have.length(0)
  })

  it('#signIn with skipBackupEncryptedSeed and skipBackupCredentials, #storeEncryptedSeed, #signIn', async () => {
    const inbox = createInbox()

    const signInToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const confirmSignInOptions = Object.assign({}, options, {
      skipBackupEncryptedSeed: true,
      skipBackupCredentials: true,
      issueSignupCredential: true,
    })

    const { commonNetworkMember } = await AffinityWallet.confirmSignIn(signInToken, signInCode, confirmSignInOptions)

    expect(commonNetworkMember.credentials).not.to.be.empty
    expect(commonNetworkMember).to.be.an.instanceof(AffinityWallet)

    const { password, accessToken, encryptedSeed } = commonNetworkMember

    await commonNetworkMember.signOut(options)

    const commonNetworkMember2 = new AffinityWallet(password, encryptedSeed, options)

    await commonNetworkMember2.storeEncryptedSeed('', '', accessToken)
    await commonNetworkMember2.signOut(options)

    const signInToken2 = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken2)
    const signInCode2 = await waitForOtpCode(inbox)

    const result = await AffinityWallet.confirmSignIn(signInToken2, signInCode2, options)

    expect(result.commonNetworkMember).to.be.an.instanceof(AffinityWallet)
    expect(result.commonNetworkMember.credentials).to.be.empty
  })

  it('#signIn and #confirmSignIn WHEN user is UNCONFIRMED', async () => {
    const inbox = createInbox()

    await AffinityWallet.signUp(inbox.email, null, options, messageParameters)
    await waitForOtpCode(inbox) // ignore first OTP code

    const signInToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const { isNew, commonNetworkMember } = await AffinityWallet.confirmSignIn(signInToken, signInCode, options)

    expect(isNew).to.be.true
    expect(commonNetworkMember).to.be.instanceOf(AffinityWallet)
  })

  it('#signIn and #confirmSignIn WHEN user exists', async () => {
    const inbox = createInbox()

    const signUpToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signUpToken)
    const sighUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, sighUpCode, options)
    await commonNetworkMember.signOut()

    const signInToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const result = await AffinityWallet.confirmSignIn(signInToken, signInCode, options)

    expect(result.isNew).to.eql(false)
    expect(result.commonNetworkMember).to.be.instanceOf(AffinityWallet)
  })

  it('#signUp (without password), change password, change username', async () => {
    const inbox = createInbox()

    const signUpToken = await AffinityWallet.signUp(inbox.email, null, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    let commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(AffinityWallet)

    await commonNetworkMember.signOut()

    await AffinityWallet.forgotPassword(inbox.email, options, messageParameters)
    const forgotPasswordCode = await waitForOtpCode(inbox)

    const password = COGNITO_PASSWORD
    await AffinityWallet.forgotPasswordSubmit(inbox.email, forgotPasswordCode, password, options)

    commonNetworkMember = await AffinityWallet.fromLoginAndPassword(inbox.email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(AffinityWallet)

    const newInbox = createInbox()

    await commonNetworkMember.changeUsername(newInbox.email, options, messageParameters)
    const changeUsernameOtp = await waitForOtpCode(newInbox)

    await commonNetworkMember.confirmChangeUsername(newInbox.email, changeUsernameOtp, options)
    await commonNetworkMember.signOut()

    commonNetworkMember = await AffinityWallet.fromLoginAndPassword(newInbox.email, password, options)
    expect(commonNetworkMember).to.be.an.instanceof(AffinityWallet)
  })

  it('#signUp, #resendSignUpConfirmationCode, then #signIn (with 1 wrong OTP)', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    await waitForOtpCode(inbox) // skip first OTP code

    await AffinityWallet.resendSignUpConfirmationCode(inbox.email, options, messageParameters)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(AffinityWallet)

    await commonNetworkMember.signOut(options)

    const signInToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)

    let error
    try {
      await AffinityWallet.confirmSignIn(signInToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    const signInCode = await waitForOtpCode(inbox)

    await AffinityWallet.confirmSignIn(signInToken, signInCode, options)
  })

  it('#signIn throws `COR-13 / 400` when OTP is wrong 3 times', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    expect(commonNetworkMember).to.be.instanceOf(AffinityWallet)

    await commonNetworkMember.signOut(options)

    const loginToken = await AffinityWallet.signIn(inbox.email, options)
    checkIsString(loginToken)

    let error
    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-5')

    try {
      await AffinityWallet.confirmSignIn(loginToken, '123456', options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-13')
  })

  it.skip('Throws `COR-17 / 400` when OTP is expired', async () => {
    const inbox = createInbox()

    const signUpToken = await AffinityWallet.signUp(inbox.email, null, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)

    const loginToken = await AffinityWallet.passwordlessLogin(inbox.email, options, messageParameters)
    const loginCode = await waitForOtpCode(inbox)

    await wait(180_000) // wait for 3 minutes before completing the login challenge

    let error
    try {
      await AffinityWallet.completeLoginChallenge(loginToken, loginCode, options)
    } catch (err) {
      error = err
    }

    expect(error).to.be.instanceOf(SdkError)
    expect(error.name).to.eql('COR-17')
  }).timeout(200_000)

  it('#confirmSignIn logIn scenario', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    await commonNetworkMember.signOut()

    const signInToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const confirmSignInOptions = {
      ...options,
      issueSignupCredential: false,
    }

    const result = await AffinityWallet.confirmSignIn(signInToken, signInCode, confirmSignInOptions)

    expect(result.isNew).to.be.false
    expect(result.commonNetworkMember.did).to.exist
    expect(result.commonNetworkMember).to.be.an.instanceof(AffinityWallet)
  })

  it('#confirmSignIn logIn scenario with issueVC flag set', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD

    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpOtp = await waitForOtpCode(inbox)

    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpOtp, options)
    await commonNetworkMember.signOut(options)

    const signInToken = await AffinityWallet.signIn(inbox.email, options, messageParameters)
    checkIsString(signInToken)
    const signInCode = await waitForOtpCode(inbox)

    const confirmSignInOptions = {
      ...options,
      issueSignupCredential: true,
    }

    const result = await AffinityWallet.confirmSignIn(signInToken, signInCode, confirmSignInOptions)

    expect(result.isNew).to.be.false
    expect(result.commonNetworkMember.did).to.exist
    expect(result.commonNetworkMember).to.be.an.instanceof(AffinityWallet)
  })
})
