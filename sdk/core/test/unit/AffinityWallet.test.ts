'use strict'

import sinon from 'sinon'
import { expect, use as chaiUse } from 'chai'
import sinonChai from 'sinon-chai'

import { LegacyNetworkMemberWithFactories as MockableNetworkMember } from '../../src/CommonNetworkMember/LegacyNetworkMemberWithFactories'
import { SdkOptions } from '../../src/dto'
import KeyManagementService from '../../src/services/KeyManagementService'
import { UserManagementService } from '@affinidi/user-management'
import WalletStorageService from '../../src/services/WalletStorageService'
import * as AnchoringHandler from '../../src/services/anchoringHandler'

import { AffinidiWalletWithEncryption as AffinityWallet, checkIsWallet } from '../helpers/AffinidiWallet'
import { generateTestDIDs } from '../factory/didFactory'
import { EncryptionService } from '@affinidi/common'

chaiUse(sinonChai)

const signedCredential = require('../factory/signedCredential')

let walletPassword: string

const email = 'user@email.com'
let encryptedSeed: string
const confirmationCode = '123456'
const signUpWithEmailResponseToken = `${email}::${EncryptionService.encrypt(walletPassword, 'testskey')}`

const accessToken = 'dummy_token'
const idToken = 'dummy_token'

const sdkOptions = { env: 'dev', apiKey: 'fakeApiKey' } as const

const stubConfirmAuthRequests = async (opts: { walletPassword: string; encryptedSeed: string }) => {
  sinon.stub(AnchoringHandler, 'anchorDid').resolves({
    did: 'did:method:sajncsyjJHgsdj_jcs',
  })
  return {
    confirmSignUp: sinon.stub(UserManagementService.prototype, 'completeSignUpForEmailOrPhone').resolves({
      cognitoTokens: { accessToken, idToken },
      shortPassword: opts.walletPassword,
    }),
    markRegistrationComplete: sinon.stub(UserManagementService.prototype, 'markRegistrationComplete').resolves(),
    reencryptSeed: sinon.stub(KeyManagementService.prototype, 'reencryptSeed').resolves({
      encryptionKey: opts.walletPassword,
      updatedEncryptedSeed: opts.encryptedSeed,
    }),

    getSignupCredentials: sinon
      .stub(MockableNetworkMember.prototype as any, '_getSignupCredentials')
      .resolves([signedCredential]),
    pullEncryptionKey: sinon
      .stub(KeyManagementService.prototype as any, '_pullEncryptionKey')
      .resolves(opts.walletPassword),
    pullKeyAndSeed: sinon.stub(KeyManagementService.prototype, 'pullKeyAndSeed').resolves({
      encryptedSeed: opts.encryptedSeed,
      encryptionKey: opts.walletPassword,
    }),
    saveCredentials: sinon.stub(MockableNetworkMember.prototype, 'saveCredentials'),
  }
}

describe('AffinityWallet', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    walletPassword = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
  })
  afterEach(() => {
    sinon.restore()
  })

  describe('#getCredentialById', () => {
    it('throws error', async () => {
      const error = 'Error'

      sinon.stub(WalletStorageService.prototype, 'getCredentialById').rejects({ code: error })

      const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)

      let responseError

      try {
        await affinityWallet.getCredentialById(signedCredential.id)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(error)
    })
  })

  it('#getCredentials throws error', async () => {
    const error = 'Error'

    sinon.stub(WalletStorageService.prototype, 'getAllCredentials').rejects({ code: error })

    const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)

    let responseError

    try {
      await affinityWallet.getCredentials()
    } catch (error) {
      responseError = error
    }

    const { code } = responseError

    expect(code).to.eql(error)
  })

  it('#saveCredentials', async () => {
    const credentials = [signedCredential]

    sinon.stub(WalletStorageService.prototype, 'saveCredentials').resolves([])

    const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)

    const token = await affinityWallet.saveCredentials(credentials)

    expect(token).to.exist
  })

  it('#confirmSignUp without VC issuance', async () => {
    const spys = await stubConfirmAuthRequests({ walletPassword, encryptedSeed })

    const response = await AffinityWallet.confirmSignUp(signUpWithEmailResponseToken, confirmationCode, sdkOptions)

    expect(response.did).to.exist
    checkIsWallet(response)
    expect(spys.markRegistrationComplete).to.have.been.called
    expect(spys.getSignupCredentials).not.to.have.been.called
  })

  it('#confirmSignUp with VC issuance', async () => {
    const spys = await stubConfirmAuthRequests({ walletPassword, encryptedSeed })
    const options: SdkOptions = { ...sdkOptions, issueSignupCredential: true }

    const response = await AffinityWallet.confirmSignUp(signUpWithEmailResponseToken, confirmationCode, options)

    expect(response.did).to.exist
    checkIsWallet(response)
    expect(spys.markRegistrationComplete).to.have.been.called
    expect(spys.getSignupCredentials).to.have.been.called
  })

  it('#confirmSignIn signUp scenario without VC issuance', async () => {
    const spys = await stubConfirmAuthRequests({ walletPassword, encryptedSeed })

    const { isNew, commonNetworkMember: affinityWallet } = await AffinityWallet.confirmSignIn(
      signUpWithEmailResponseToken,
      confirmationCode,
      sdkOptions,
    )

    expect(isNew).to.be.true
    expect(affinityWallet.did).to.exist
    checkIsWallet(affinityWallet)
    expect(spys.markRegistrationComplete).to.have.been.called
    expect(spys.getSignupCredentials).not.to.have.been.called
  })

  it('#confirmSignIn signUp scenario with VC issuance', async () => {
    const spys = await stubConfirmAuthRequests({ walletPassword, encryptedSeed })
    const options: SdkOptions = { ...sdkOptions, issueSignupCredential: true }

    const { isNew, commonNetworkMember: affinityWallet } = await AffinityWallet.confirmSignIn(
      signUpWithEmailResponseToken,
      confirmationCode,
      options,
    )

    expect(isNew).to.be.true
    expect(affinityWallet.did).to.exist
    checkIsWallet(affinityWallet)
    expect(spys.markRegistrationComplete).to.have.been.called
    expect(spys.getSignupCredentials).to.have.been.called
  })
})
