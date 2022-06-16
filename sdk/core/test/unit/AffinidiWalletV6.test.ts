import { AffinidiWalletV6, checkIsWallet } from '../helpers/AffinidiWallet'
import sinon from 'sinon'
import { expect } from 'chai'
import { UserManagementService } from '@affinidi/user-management'
import * as AnchoringHandler from '../../src/services/anchoringHandler'
import KeyManagementService from '../../src/services/KeyManagementService'
import { generateTestDIDs } from '../factory/didFactory'

const sdkOptions = { env: 'dev', apiKey: 'fakeApiKey' } as const
const accessToken = 'dummy_token'
const refreshToken = 'refresh_dummy_token'
const idToken = 'dummy_token'

let walletPassword: string
let encryptedSeed: string

const stubConfirmAuthRequests = (opts = { walletPassword, encryptedSeed }) => ({
  confirmSignUp: sinon.stub(UserManagementService.prototype, 'completeSignUpForEmailOrPhone').resolves({
    cognitoTokens: { accessToken, idToken, refreshToken },
    shortPassword: opts.walletPassword,
  }),
  signUpWithUsernameAndConfirm: sinon
    .stub(UserManagementService.prototype, 'signUpWithUsernameAndConfirm')
    .resolves({ accessToken, idToken, refreshToken }),
  logInWithPassword: sinon
    .stub(UserManagementService.prototype, 'logInWithPassword')
    .resolves({ accessToken, idToken, refreshToken }),
  logInWithRefreshToken: sinon
    .stub(UserManagementService.prototype, 'logInWithRefreshToken')
    .resolves({ accessToken, idToken, refreshToken }),
  markRegistrationComplete: sinon.stub(UserManagementService.prototype, 'markRegistrationComplete').resolves(),
  reencryptSeed: sinon.stub(KeyManagementService.prototype, 'reencryptSeed').resolves({
    encryptionKey: opts.walletPassword,
    updatedEncryptedSeed: opts.encryptedSeed,
  }),
  pullEncryptionKey: sinon
    .stub(KeyManagementService.prototype as any, '_pullEncryptionKey')
    .resolves(opts.walletPassword),
  pullKeyAndSeed: sinon.stub(KeyManagementService.prototype, 'pullKeyAndSeed').resolves({
    encryptedSeed: opts.encryptedSeed,
    encryptionKey: opts.walletPassword,
  }),
  anchorDid: sinon.stub(AnchoringHandler, 'anchorDid').resolves({
    did: 'did:method:sajncsyjJHgsdj_jcs',
  }),
})

describe('AffinidiWalletV6', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    walletPassword = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('#signUpWithUsername', () => {
    it('should return wallet', async () => {
      stubConfirmAuthRequests()
      const wallet = await AffinidiWalletV6.signUpWithUsername(sdkOptions, 'username', 'passworD1')

      checkIsWallet(wallet)
      expect(wallet.did).to.exist
    })

    it('should mark user registration status as complete', async () => {
      const mocks = stubConfirmAuthRequests()
      await AffinidiWalletV6.signUpWithUsername(sdkOptions, 'username', 'passworD1')

      expect(mocks.markRegistrationComplete).to.be.calledOnce
    })

    it('should not mark user registration status as complete', async () => {
      const mocks = stubConfirmAuthRequests()
      mocks.reencryptSeed.rejects(new Error('Error'))

      try {
        await AffinidiWalletV6.signUpWithUsername(sdkOptions, 'username', 'passworD1')
        expect.fail()
        // eslint-disable-next-line no-empty
      } catch (err) {}

      expect(mocks.markRegistrationComplete).not.to.be.called
    })
  })

  describe('#completeSignUp', () => {
    it('should return wallet', async () => {
      stubConfirmAuthRequests()
      const wallet = await AffinidiWalletV6.completeSignUp(sdkOptions, 'sign-up-token', '123456')

      checkIsWallet(wallet)
      expect(wallet.did).to.exist
    })

    it('should mark user registration status as complete', async () => {
      const mocks = stubConfirmAuthRequests()
      await AffinidiWalletV6.completeSignUp(sdkOptions, 'sign-up-token', '123456')

      expect(mocks.markRegistrationComplete).to.be.calledOnce
    })

    it('should not mark user registration status as complete', async () => {
      const mocks = stubConfirmAuthRequests()
      mocks.reencryptSeed.rejects(new Error('Error'))

      try {
        await AffinidiWalletV6.completeSignUp(sdkOptions, 'sign-up-token', '123456')
        expect.fail()
        // eslint-disable-next-line no-empty
      } catch (err) {}

      expect(mocks.markRegistrationComplete).not.to.be.called
    })
  })

  describe('#logIn with arbitrary username', () => {
    it('should return wallet', async () => {
      stubConfirmAuthRequests()
      const wallet = await AffinidiWalletV6.logInWithPassword(sdkOptions, 'username', 'passworD1')

      checkIsWallet(wallet)
      expect(wallet.did).to.exist
    })
  })

  describe('#logIn with refresh token', () => {
    it('should return wallet', async () => {
      stubConfirmAuthRequests()
      const wallet = await AffinidiWalletV6.logInWithRefreshToken(sdkOptions, refreshToken)

      checkIsWallet(wallet)
      expect(wallet.did).to.exist
    })
  })
})
