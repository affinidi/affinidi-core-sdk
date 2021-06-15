import 'mocha'

import './env'

import { expect } from 'chai'
import { __dangerous } from '@affinidi/wallet-core-sdk'
import { MessageParameters } from '@affinidi/wallet-core-sdk/dist/dto'
import { AffinityWallet } from '../../src/AffinityWallet'

import { getOptionsForEnvironment } from '../helpers'

import { generateCredentials } from '../factory/signedCredentials'

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD } = JSON.parse(TEST_SECRETS)

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

const createInbox = () => new __dangerous.TestmailInbox({ prefix: env, suffix: 'otp.browser' })

const getCredentialIds = (credentials: any[]) => new Set(credentials.map((credential) => credential.id))

function checkIsString(value: string | unknown): asserts value is string {
  expect(value).to.be.a('string')
}

describe('WalletStorageService [OTP]', () => {
  it.skip('full flow with 100+ credentials', async () => {
    const inbox = createInbox()
    const password = COGNITO_PASSWORD
    const signUpToken = await AffinityWallet.signUp(inbox.email, password, options, messageParameters)
    checkIsString(signUpToken)
    const signUpCode = await waitForOtpCode(inbox)
    const commonNetworkMember = await AffinityWallet.confirmSignUp(signUpToken, signUpCode, options)
    console.log('signed up')

    const credentialsToSave = generateCredentials(220)
    await commonNetworkMember.saveCredentials(credentialsToSave.slice(0, 55))
    console.log('saved 55 credentials')
    await commonNetworkMember.saveCredentials(credentialsToSave.slice(55, 110))
    console.log('saved 110 credentials')
    await commonNetworkMember.saveCredentials(credentialsToSave.slice(110, 165))
    console.log('saved 165 credentials')
    await commonNetworkMember.saveCredentials(credentialsToSave.slice(165, 220))
    console.log('saved 220 credentials')

    {
      const credentials = await commonNetworkMember.getCredentials()
      console.log(`retrieved ${credentials.length} credentials`)
      expect(credentials).to.have.length(220)
      expect(getCredentialIds(credentials)).to.deep.equal(getCredentialIds(credentialsToSave))
    }

    {
      const credentialIdsToDelete = [credentialsToSave[90].id, credentialsToSave[150].id, credentialsToSave[210].id]

      const expectedIds = getCredentialIds(credentialsToSave)
      for (const id of credentialIdsToDelete) {
        expectedIds.delete(id)
        await commonNetworkMember.deleteCredential(id)
        console.log('deleted credential')
        const remaining = await commonNetworkMember.getCredentials()
        console.log(`There are ${remaining.length} credentials left`)
      }

      const credentials = await commonNetworkMember.getCredentials()
      console.log('retrieved credentials')
      expect(credentials).to.have.length(217)
      expect(getCredentialIds(credentials)).to.deep.equal(expectedIds)
    }
  }).timeout(600000)
})
