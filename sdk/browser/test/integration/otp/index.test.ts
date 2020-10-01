import 'mocha'

import '../env'

import { expect } from 'chai'
import { __dangerous } from '@affinidi/wallet-core-sdk'

import { getOtp } from '../../helpers/getOtp'
import { AffinityWallet } from '../../../src/AffinityWallet'
import { getOptionsForEnvironment } from '../../helpers/getOptionsForEnvironment'

const signedCredentials = require('../../factory/signedCredentials')

// test agains `dev | prod` // if nothing specified, staging is used by default
const options: __dangerous.SdkOptions = getOptionsForEnvironment()

const DELAY = 1000
// prettier-ignore
const wait = (ms: any) => new global.Promise(resolve => setTimeout(resolve, ms))

const generateEmail = () => {
  const TIMESTAMP = Date.now().toString(16).toUpperCase()

  return `test.user-${TIMESTAMP}@gdwk.in`
}

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)
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

  it('#signUp, #init, #changeUsername', async () => {
    const cognitoUsername = generateEmail()

    const token = await AffinityWallet.signUp(cognitoUsername, cognitoPassword)

    await wait(DELAY)
    const signUpOtp = await getOtp()

    let networkMember = await AffinityWallet.confirmSignUp(token, signUpOtp, options)

    const { cognitoUserTokens } = networkMember

    expect(networkMember).to.exist

    networkMember = await AffinityWallet.init()

    networkMember.cognitoUserTokens = cognitoUserTokens

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
})
