'use strict'

import sinon from 'sinon'
import { expect, use as chaiUse } from 'chai'
import sinonChai from 'sinon-chai'

chaiUse(sinonChai)

import { CommonNetworkMember, __dangerous } from '@affinidi/wallet-core-sdk'
import KeyManagementService from '@affinidi/wallet-core-sdk/dist/services/KeyManagementService'
import UserManagementService from '@affinidi/wallet-core-sdk/dist/services/UserManagementService'
import { AffinityWallet, SdkOptions } from '../../src/AffinityWallet'

const signedCredential = require('../factory/signedCredential')
import { generateTestDIDs } from '../factory/didFactory'

const { WalletStorageService } = __dangerous

let walletPassword: string

const email = 'user@email.com'
let encryptedSeed: string
const confirmationCode = '123456'
const signUpWithEmailResponseToken = `${email}::${walletPassword}`

const accessToken = 'dummy_token'
const idToken = 'dummy_token'

const sdkOptions = { env: 'dev', apiKey: 'fakeApiKey' } as const

const stubConfirmAuthRequests = async (opts: { walletPassword: string; encryptedSeed: string }) => {
  return {
    confirmSignUp: sinon.stub(UserManagementService.prototype, 'confirmSignUpForEmailOrPhone').resolves({
      cognitoTokens: { accessToken, idToken },
      shortPassword: opts.walletPassword,
    }),
    reencryptSeed: sinon.stub(KeyManagementService.prototype, 'reencryptSeed').resolves({
      encryptionKey: opts.walletPassword,
      updatedEncryptedSeed: opts.encryptedSeed,
    }),

    getSignupCredentials: sinon
      .stub(CommonNetworkMember.prototype, 'getSignupCredentials')
      .resolves([signedCredential]),
    pullEncryptionKey: sinon
      .stub(KeyManagementService.prototype as any, '_pullEncryptionKey')
      .resolves(opts.walletPassword),
    pullKeyAndSeed: sinon.stub(KeyManagementService.prototype, 'pullKeyAndSeed').resolves({
      encryptedSeed: opts.encryptedSeed,
      encryptionKey: opts.walletPassword,
    }),
    saveCredentials: sinon.stub(AffinityWallet.prototype, 'saveCredentials'),
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

  describe('#getCredentialByIndex', () => {
    it('throws COR-14 if there are no credentials for the user', async () => {
      sinon.stub(WalletStorageService.prototype, 'fetchEncryptedCredentials').resolves([])

      const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)

      let responseError

      try {
        await affinityWallet.getCredentialByIndex(0)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql('COR-14')
    })

    it('throws error', async () => {
      const error = 'Error'

      sinon.stub(WalletStorageService.prototype, 'fetchEncryptedCredentials').rejects({ code: error })

      const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)

      let responseError

      try {
        await affinityWallet.getCredentialByIndex(0)
      } catch (error) {
        responseError = error
      }

      const { code } = responseError

      expect(code).to.eql(error)
    })
  })

  it('#getCredentials returns [] if there are no credentials for the user', async () => {
    sinon.stub(WalletStorageService.prototype, 'fetchEncryptedCredentials').rejects({ code: 'COR-14' })

    const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)
    const response = await affinityWallet.getCredentials()

    expect(response).to.eql([])
  })

  it('#getCredentials throws error', async () => {
    const error = 'Error'

    sinon.stub(WalletStorageService.prototype, 'fetchAllDecryptedCredentials').rejects({ code: error })

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

    sinon.stub(WalletStorageService.prototype, 'encryptAndSaveCredentials').resolves([])

    const affinityWallet = new AffinityWallet(walletPassword, encryptedSeed, sdkOptions)

    const token = await affinityWallet.saveCredentials(credentials)

    expect(token).to.exist
  })

  it('#confirmSignUp without VC issuance', async () => {
    const spys = await stubConfirmAuthRequests({ walletPassword, encryptedSeed })

    const response = await AffinityWallet.confirmSignUp(signUpWithEmailResponseToken, confirmationCode, sdkOptions)

    expect(response.did).to.exist
    expect(response).to.be.an.instanceof(AffinityWallet)
    expect(spys.getSignupCredentials).not.to.have.been.called
  })

  it('#confirmSignUp with VC issuance', async () => {
    const spys = await stubConfirmAuthRequests({ walletPassword, encryptedSeed })
    const options: SdkOptions = { ...sdkOptions, issueSignupCredential: true }

    const response = await AffinityWallet.confirmSignUp(signUpWithEmailResponseToken, confirmationCode, options)

    expect(response.did).to.exist
    expect(response).to.be.an.instanceof(AffinityWallet)
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
    expect(affinityWallet).to.be.an.instanceof(AffinityWallet)
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
    expect(affinityWallet).to.be.an.instanceof(AffinityWallet)
    expect(spys.getSignupCredentials).to.have.been.called
  })
})
