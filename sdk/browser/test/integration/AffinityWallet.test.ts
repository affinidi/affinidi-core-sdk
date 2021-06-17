import { expect } from 'chai'

import { __dangerous } from '@affinidi/wallet-core-sdk'
import { getOptionsForEnvironment, waitForConfirmationCodeInput } from '../helpers'

import { AffinityWallet, SdkOptions } from '../../src/AffinityWallet'

const signedCredential = require('../factory/signedCredential')

const { TEST_SECRETS } = process.env
const {
  PASSWORD,
  COGNITO_PASSWORD,
  COGNITO_USERNAME,
  COGNITO_USERNAME_NO_CREDENTIALS,
  ENCRYPTED_SEED_JOLO,
  ENCRYPTED_SEED_ELEM,
  DID_ELEM_SHORT,
  DID_ELEM_PARAMS,
  DID_ELEM,
} = JSON.parse(TEST_SECRETS)

const cognitoUsername = COGNITO_USERNAME
const cognitoPassword = COGNITO_PASSWORD

const data = { firstName: 'Denis', lastName: 'Popov' }
const did = DID_ELEM

const walletPassword = PASSWORD

const elemPassword = PASSWORD
const encryptedSeed = ENCRYPTED_SEED_JOLO

const elemEncryptedSeed = ENCRYPTED_SEED_ELEM

const didElemShort = DID_ELEM_SHORT
const didElem = `${didElemShort};${DID_ELEM_PARAMS}`

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

function checkIsString(value: string | unknown): asserts value is string {
  expect(value).to.be.a('string')
}

function checkIsAffinityWallet(value: AffinityWallet | unknown): asserts value is AffinityWallet {
  expect(value).to.be.an.instanceof(AffinityWallet)
}

describe('AffinityWallet', () => {
  it('.init returns SDK instance, initialize with default environment', async () => {
    await AffinityWallet.fromLoginAndPassword(cognitoUsername, cognitoPassword, options)

    const affinityWallet = await AffinityWallet.init(options)

    expect(affinityWallet.encryptedSeed).to.exist
  })

  it.skip('#createEncryptedMessage and #readEncryptedMessage (jolo)', async () => {
    const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, options)
    const encryptedMessage = await affinityWallet.createEncryptedMessage(did, data)

    expect(encryptedMessage).to.exist

    const message = await affinityWallet.readEncryptedMessage(encryptedMessage)

    expect(message).to.eql(data)
  })

  it('#createEncryptedMessage and #readEncryptedMessage (elem)', async () => {
    const affinityWallet = new AffinityWallet(elemPassword, elemEncryptedSeed, options)
    const encryptedMessage = await affinityWallet.createEncryptedMessage(didElem, data)

    expect(encryptedMessage).to.exist

    const message = await affinityWallet.readEncryptedMessage(encryptedMessage)

    expect(message).to.eql(data)
  })

  it('#createEncryptedMessage and #readEncryptedMessage when didDocument passed', async () => {
    const affinityWallet = new AffinityWallet(elemPassword, elemEncryptedSeed, options)
    const didDocument = await affinityWallet.resolveDid(didElem)
    const encryptedMessage = await affinityWallet.createEncryptedMessage(didDocument, data)

    expect(encryptedMessage).to.exist

    const message = await affinityWallet.readEncryptedMessage(encryptedMessage)

    expect(message).to.eql(data)
  })

  it('#getCredentials', async () => {
    const affinityWallet = await AffinityWallet.fromLoginAndPassword(cognitoUsername, cognitoPassword, options)

    const token = await affinityWallet.getCredentials(credentialShareRequestToken)

    expect(token).to.exist
  })

  it.skip('#saveCredentials', async () => {
    const affinityWallet = await AffinityWallet.fromLoginAndPassword(cognitoUsername, cognitoPassword, options)

    const results = await affinityWallet.saveCredentials([signedCredential])

    expect(results).to.exist
    expect(results[0].id).to.exist
  })

  it('#getCredentials returns [] if COR-14 was thrown', async () => {
    const cognitoUsername = COGNITO_USERNAME_NO_CREDENTIALS

    const affinityWallet = await AffinityWallet.fromLoginAndPassword(cognitoUsername, cognitoPassword, options)
    const credentials = await affinityWallet.getCredentials(credentialShareRequestToken)

    expect(credentials.length).to.be.equal(0)
  })

  it('#createEncryptedMessage #readEncryptedMessage', async () => {
    const affinityWallet = await AffinityWallet.fromLoginAndPassword(cognitoUsername, cognitoPassword, options)

    const did = affinityWallet.did

    const objToCrypt = { name: 'Hola, amigos' }

    const encryptedMessage = await affinityWallet.createEncryptedMessage(did, objToCrypt)
    const decryptedMessage = await affinityWallet.readEncryptedMessage(encryptedMessage)

    expect(decryptedMessage).to.eql(objToCrypt)
  })

  it.skip('#signUp, #confirmSignUp', async () => {
    const emailDev = 'DEVELOPER_EMAIL'
    const token = await AffinityWallet.signUp(emailDev, cognitoPassword, options)
    checkIsString(token)
    const confirmationCode = await waitForConfirmationCodeInput()

    const signUpOptions: SdkOptions = {
      env: options.env,
      issueSignupCredential: true,
      accessApiKey: options.accessApiKey,
    }

    const affinityWallet = await AffinityWallet.confirmSignUp(token, confirmationCode, signUpOptions)
    const credentialRequirements = [
      {
        type: ['Credential', 'EmailCredentialPersonV1'],
      },
    ]

    const callbackUrl = 'https://kudos-issuer-backend.affinity-project.org/kudos_offering/'

    const newCredentialShareRequestToken = await affinityWallet.generateCredentialShareRequestToken(
      credentialRequirements,
      affinityWallet.did,
      { callbackUrl },
    )

    const credentials = await affinityWallet.getCredentials(newCredentialShareRequestToken)

    expect(credentials).to.exist
  })

  it('#signUp when user registers with arbitrary username', async () => {
    const generateUsername = () => {
      const TIMESTAMP = Date.now().toString(16).toUpperCase()
      return `test.user-${TIMESTAMP}`
    }

    const cognitoUsername = generateUsername()

    const networkMemberSignUp = await AffinityWallet.signUp(cognitoUsername, cognitoPassword, options)
    checkIsAffinityWallet(networkMemberSignUp)

    expect(networkMemberSignUp.did).to.exist

    await networkMemberSignUp.signOut()

    const networkMemberFromLoginAndPassword = await AffinityWallet.fromLoginAndPassword(
      cognitoUsername,
      cognitoPassword,
      options,
    )
    checkIsAffinityWallet(networkMemberFromLoginAndPassword)
  })
})
