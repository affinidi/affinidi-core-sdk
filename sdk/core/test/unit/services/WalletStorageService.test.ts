'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import { DidAuthClientService, Signer } from '@affinidi/affinidi-did-auth-lib'
import { DidDocumentService, JwtService, KeysService, LocalKeyVault } from '@affinidi/common'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import KeyManagementService from '../../../src/services/KeyManagementService'
import WalletStorageService from '../../../src/services/WalletStorageService'
import {
  STAGING_AFFINIDI_VAULT_URL,
  STAGING_KEY_STORAGE_URL,
  STAGING_BLOOM_VAULT_URL,
} from '../../../src/_defaultConfig'

import { generateTestDIDs } from '../../factory/didFactory'
import { testPlatformTools } from '../../helpers/testPlatformTools'

import signedCredential from '../../factory/signedCredential'

import credentialShareRequestToken from '../../factory/credentialShareRequestToken'
import parsedCredentialShareRequestToken from '../../factory/parsedCredentialShareRequestToken'
import AffinidiVaultStorageService from '../../../src/services/AffinidiVaultStorageService'
import BloomVaultStorageService from '../../../src/services/BloomVaultStorageService'
import { DidAuthAdapter } from '../../../src/shared/DidAuthAdapter'
import { extractSDKVersion } from '../../../src/_helpers'

let walletPassword: string

let encryptedSeed: string

const region = 'eu-west-2'

const createWalletStorageService = () => {
  const keysService = new KeysService(encryptedSeed, walletPassword)
  const documentService = DidDocumentService.createDidDocumentService(keysService)
  const keyVault = new LocalKeyVault(keysService)
  const signer = new Signer({
    did: documentService.getMyDid(),
    keyId: documentService.getKeyId(),
    keyVault,
  })
  const didAuthService = new DidAuthClientService(signer)
  const didAuthAdapter = new DidAuthAdapter('', didAuthService)
  return new WalletStorageService(keysService, testPlatformTools, {
    bloomVaultUrl: STAGING_BLOOM_VAULT_URL,
    affinidiVaultUrl: STAGING_AFFINIDI_VAULT_URL,
    accessApiKey: undefined,
    storageRegion: region,
    didAuthAdapter,
  })
}

const createKeyManagementService = () => {
  return new KeyManagementService({
    keyStorageUrl: STAGING_KEY_STORAGE_URL,
    accessApiKey: undefined,
  })
}

describe('WalletStorageService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    walletPassword = testDids.password

    encryptedSeed = testDids.jolo.encryptedSeed
  })
  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#saveCredentials', async () => {
    sinon.stub(AffinidiVaultStorageService.prototype, 'saveCredentials').resolves([
      {
        credentialId: signedCredential.id,
        credentialTypes: [],
        payload: 'encrypted',
      },
    ])

    const walletStorageService = createWalletStorageService()

    const response = await walletStorageService.saveCredentials([signedCredential])

    expect(response[0].credentialId).to.eql(signedCredential.id)
  })

  it('#pullEncryptedSeed', async () => {
    const encryptedSeed = 'encryptedSeed'
    const readMyKeyPath = '/api/v1/keys/readMyKey'

    sinon.stub(KeyManagementService.prototype as any, '_pullEncryptionKey')
    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => readMyKeyPath)
      .get(readMyKeyPath)
      .reply(200, { encryptedSeed })

    const keyManagementService = createKeyManagementService()
    const response = await keyManagementService.pullKeyAndSeed('accessToken')

    expect(response.encryptedSeed).to.include(encryptedSeed)
  })

  it('#getCredentialsByShareToken', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region, [signedCredential.type])
      .resolves([signedCredential])

    sinon
      .stub(BloomVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region, [signedCredential.type])
      .resolves([{ ...signedCredential, id: 'bloomId' }])

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = createWalletStorageService()

    const response = await walletStorageService.getCredentialsByShareToken(credentialShareRequestToken)

    expect(response).to.be.an('array')
    expect(response).to.length(2)
    expect(response).to.include(signedCredential)
  })

  it('#getCredentialsByShareToken when share request token not provided', async () => {
    sinon.stub(AffinidiVaultStorageService.prototype, 'searchCredentials').withArgs(region).resolves([signedCredential])

    sinon
      .stub(BloomVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region)
      .resolves([{ ...signedCredential, id: 'bloomId' }])

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = createWalletStorageService()

    const response = await walletStorageService.getCredentialsByShareToken(null)

    expect(response).to.be.an('array')
    expect(response).to.length(2)
    expect(response).to.include(signedCredential)
  })

  describe('#getAllCredentials', () => {
    it('should get from both Affinidi Vault and Bloom Vault', async () => {
      sinon
        .stub(AffinidiVaultStorageService.prototype, 'searchCredentials')
        .withArgs(region)
        .resolves([signedCredential])

      sinon
        .stub(BloomVaultStorageService.prototype, 'searchCredentials')
        .withArgs(region)
        .resolves([{ ...signedCredential, id: 'bloomId' }])

      const walletStorageService = createWalletStorageService()
      const response = await walletStorageService.getAllCredentials()

      expect(response).to.be.an('array')
      expect(response).to.length(2)
    })

    it('should remove duplicates from Affinidi Vault and Bloom Vault results', async () => {
      sinon
        .stub(AffinidiVaultStorageService.prototype, 'searchCredentials')
        .withArgs(region)
        .resolves([signedCredential])

      sinon.stub(BloomVaultStorageService.prototype, 'searchCredentials').withArgs(region).resolves([signedCredential])

      const walletStorageService = createWalletStorageService()
      const response = await walletStorageService.getAllCredentials()

      expect(response).to.be.an('array')
      expect(response).to.length(1)
      expect(response).to.eql([signedCredential])
    })
  })

  describe('#getCredentialById', () => {
    it('should get from Affinidi vault', async () => {
      sinon
        .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
        .withArgs(signedCredential.id, region)
        .resolves(signedCredential)

      const walletStorageService = createWalletStorageService()
      const response = await walletStorageService.getCredentialById(signedCredential.id)

      expect(response).to.eql(signedCredential)
    })

    it('should get from Bloom Vault if not found in Affinidi Vault', async () => {
      sinon
        .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-2' })

      sinon
        .stub(BloomVaultStorageService.prototype, 'getCredentialById')
        .withArgs(signedCredential.id, region)
        .resolves(signedCredential)

      const walletStorageService = createWalletStorageService()
      const response = await walletStorageService.getCredentialById(signedCredential.id)

      expect(response).to.eql(signedCredential)
    })

    it('should throw if Affinidi Vault throws something else than not found', async () => {
      sinon
        .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-3' })

      const walletStorageService = createWalletStorageService()
      try {
        await walletStorageService.getCredentialById(signedCredential.id)
      } catch (error) {
        expect(error.code).to.eql('AVT-3')
      }
    })

    it('should throw if Bloom Vault throws', async () => {
      sinon
        .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-2' })

      sinon
        .stub(BloomVaultStorageService.prototype, 'getCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-3' })

      const walletStorageService = createWalletStorageService()
      try {
        await walletStorageService.getCredentialById(signedCredential.id)
      } catch (error) {
        expect(error.code).to.eql('AVT-3')
      }
    })
  })

  describe('#deleteCredentialById', () => {
    it('should delete from Affinidi Vault', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
        .withArgs(signedCredential.id, region)
        .resolves()

      const walletStorageService = createWalletStorageService()
      await walletStorageService.deleteCredentialById(signedCredential.id)

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
    })

    it('should delete from Bloom Vault in case not found in Affinidi Vault', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-2' })

      const bloomVaultStorageDeleteCall = sinon
        .stub(BloomVaultStorageService.prototype, 'deleteCredentialById')
        .withArgs(signedCredential.id, region)
        .resolves()

      const walletStorageService = createWalletStorageService()
      await walletStorageService.deleteCredentialById(signedCredential.id)

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
      expect(bloomVaultStorageDeleteCall.calledOnce).to.be.true
    })

    it('should throw if Bloom Vault throws', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-2' })

      const bloomVaultStorageDeleteCall = sinon
        .stub(BloomVaultStorageService.prototype, 'deleteCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-3' })

      const walletStorageService = createWalletStorageService()
      try {
        await walletStorageService.deleteCredentialById(signedCredential.id)
      } catch (error) {
        expect(error.code).to.eql('AVT-3')
      }

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
      expect(bloomVaultStorageDeleteCall.calledOnce).to.be.true
    })

    it('should throw if Affinidi Vault throws something else than not found', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
        .withArgs(signedCredential.id, region)
        .throws({ code: 'AVT-3' })

      const walletStorageService = createWalletStorageService()
      try {
        await walletStorageService.deleteCredentialById(signedCredential.id)
      } catch (error) {
        expect(error.code).to.eql('AVT-3')
      }

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
    })
  })

  describe('#deleteAllCredentials', () => {
    it('should remove from both Affinidi Vault and Bloom Vault', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteAllCredentials')
        .withArgs(region)
        .resolves()

      const bloomVaultStorageDeleteCall = sinon
        .stub(BloomVaultStorageService.prototype, 'deleteAllCredentials')
        .withArgs(region)
        .resolves()

      const walletStorageService = createWalletStorageService()
      await walletStorageService.deleteAllCredentials()

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
      expect(bloomVaultStorageDeleteCall.calledOnce).to.be.true
    })

    it('should throw if Affinidi Vault throw', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteAllCredentials')
        .withArgs(region)
        .throws({ code: 'AVT-2' })

      const bloomVaultStorageDeleteCall = sinon
        .stub(BloomVaultStorageService.prototype, 'deleteAllCredentials')
        .withArgs(region)
        .resolves()

      const walletStorageService = createWalletStorageService()
      try {
        await walletStorageService.deleteAllCredentials()
      } catch (error) {
        expect(error.code).to.eql('COR-0')
      }

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
      expect(bloomVaultStorageDeleteCall.calledOnce).to.be.false
    })

    it('should throw if Bloom Vault throw', async () => {
      const affinidiVaultStorageDeleteCall = sinon
        .stub(AffinidiVaultStorageService.prototype, 'deleteAllCredentials')
        .withArgs(region)
        .resolves()

      const bloomVaultStorageDeleteCall = sinon
        .stub(BloomVaultStorageService.prototype, 'deleteAllCredentials')
        .withArgs(region)
        .throws({ code: 'AVT-2' })

      const walletStorageService = createWalletStorageService()
      try {
        await walletStorageService.deleteAllCredentials()
      } catch (error) {
        expect(error.code).to.eql('COR-0')
      }

      expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
      expect(bloomVaultStorageDeleteCall.calledOnce).to.be.true
    })
  })

  it('#adminConfirmUser', async () => {
    const username = 'username'
    const adminConfirmUserPath = '/api/v1/userManagement/adminConfirmUser'

    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => adminConfirmUserPath)
      .post(adminConfirmUserPath)
      .reply(200, {})

    const keyStorageApiService = new KeyStorageApiService({
      keyStorageUrl: STAGING_KEY_STORAGE_URL,
      accessApiKey: undefined,
      sdkVersion: extractSDKVersion(),
    })
    const response = await keyStorageApiService.adminConfirmUser({ username })

    expect(response).to.exist
  })

  it('#getCredentialOffer', async () => {
    const idToken = 'idToken'
    const getCredentialOfferPath = '/api/v1/issuer/getCredentialOffer'

    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => getCredentialOfferPath)
      .get(getCredentialOfferPath)
      .reply(200, { offerToken: 'offerToken' })

    const returnedOffer = await WalletStorageService.getCredentialOffer(idToken, STAGING_KEY_STORAGE_URL, {} as any)

    expect(returnedOffer).to.eq('offerToken')
  })

  it('#getSignedCredentials', async () => {
    const idToken = 'idToken'
    const credentialOfferResponse = 'responseToken'
    const getSignedCredentialsPath = '/api/v1/issuer/getSignedCredentials'

    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => getSignedCredentialsPath)
      .post(getSignedCredentialsPath)
      .reply(200, { signedCredentials: ['signedCredential'] })

    const returnedOffer = await WalletStorageService.getSignedCredentials(idToken, credentialOfferResponse)

    expect(returnedOffer[0]).to.eq('signedCredential')
  })
})
