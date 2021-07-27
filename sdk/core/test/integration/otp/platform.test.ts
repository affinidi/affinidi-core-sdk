import '../env'

import 'mocha'
import { expect } from 'chai'

import { isW3cCredential } from '../../../src/_helpers'
import { MessageParameters, SdkOptions } from '../../../src/dto'
import { TestmailInbox } from '../../../src/test-helpers'

import { getBasicOptionsForEnvironment } from '../../helpers'
import { CommonNetworkMemberWithEncryption } from '../../helpers/CommonNetworkMemberWithEncryption'
import { openAttestationDocument } from '../../factory/openAttestationDocument'
import { generateCredentials } from '../../factory/signedCredentials'

const AffinityWallet = CommonNetworkMemberWithEncryption

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

const options: SdkOptions = getBasicOptionsForEnvironment()
const { env } = options

const messageParameters: MessageParameters = {
  message: `Your verification code is: {{CODE}}`,
  subject: `Verification code`,
}

const waitForOtpCode = async (inbox: TestmailInbox): Promise<string> => {
  const { body } = await inbox.waitForNewEmail()
  return body.replace('Your verification code is: ', '')
}

const createInbox = () => new TestmailInbox({ prefix: env, suffix: 'otp.browser' })

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
    const credentialIdToDelete = isW3cCredential(firstCredential) ? firstCredential.id : firstCredential.data.id

    await commonNetworkMember.deleteCredentialById(credentialIdToDelete)
    credentials = await commonNetworkMember.getCredentials()

    const credentialIds = credentials.map((credential: any) => {
      return isW3cCredential(credential) ? credential.id : credential.data.id
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

    const signedCredentials = generateCredentials(4)

    await commonNetworkMember.saveCredentials(signedCredentials)

    let credentials = await commonNetworkMember.getCredentials()
    expect(credentials).to.have.length(4)

    const credentialIdToDelete = credentials[1].id

    await commonNetworkMember.deleteCredentialById(credentialIdToDelete)

    credentials = await commonNetworkMember.getCredentials()
    const credentialIds = credentials.map((credential: any) => credential.id)

    expect(credentialIds).to.not.include(credentialIdToDelete)
    expect(credentials).to.have.length(3)

    await commonNetworkMember.deleteAllCredentials()

    credentials = await commonNetworkMember.getCredentials()
    expect(credentials).to.have.length(0)
  })
})
