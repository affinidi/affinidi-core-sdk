'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import { JwtService, KeysService } from '@affinidi/common'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import { DidAuthService } from '@affinidi/affinidi-did-auth-lib'
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
import { extractSDKVersion } from '../../../src/_helpers'

let walletPassword: string

let encryptedSeed: string

const region = 'eu-west-2'
const audienceDid =
  'did:elem:EiDz1CWpWrXmU_QUbaY6TJEe1HAlpS25d7nsZHESbrk6ZQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBellURmhNR0prWTJKak1HWm1aR1ZoTlRjMU1HSm1NakJsTmpsbU1ESXlaVGRrWkRNMU1qUTNZek5tTWpSbU5XSmxaREUwTnpGbU5HTmhOV1l6TkdKak5DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1JMU1HTTBaRFk1WkRrMU5tUTNOelJrTWpKaE5qaGhOR0U0WVRkbE5UazJaVGN5TURsaE5UTmpZalU1TVRneFpUWTVPRFpqT1RZek1UazJOelF3TXpZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiek1VcDhPQVljUm9ZaXJmOEo5SWRKa2xTSTFSOTlRTlpLZE5fdEo4SkFDRmNIYjMyQWU4WEZvLTZYUDl0bUF1N0ZjeTlJNjhnb2pJa2FDbmZNdmhXYlEifQ'

const createWalletStorageService = () => {
  const keysService = new KeysService(encryptedSeed, walletPassword)
  const didAuthService = new DidAuthService({ encryptedSeed, encryptionKey: walletPassword })
  return new WalletStorageService(didAuthService, keysService, testPlatformTools, {
    bloomVaultUrl: STAGING_BLOOM_VAULT_URL,
    affinidiVaultUrl: STAGING_AFFINIDI_VAULT_URL,
    accessApiKey: undefined,
    storageRegion: region,
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

    const response = await walletStorageService.saveCredentials([signedCredential], audienceDid)

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
      .withArgs(region, audienceDid, [signedCredential.type])
      .resolves([signedCredential])

    sinon
      .stub(BloomVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region, [signedCredential.type])
      .resolves([{ ...signedCredential, id: 'bloomId' }])

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = createWalletStorageService()

    const response = await walletStorageService.getCredentialsByShareToken(credentialShareRequestToken, audienceDid)

    expect(response).to.be.an('array')
    expect(response).to.length(2)
    expect(response).to.include(signedCredential)
  })

  it('#getCredentialsByShareToken when share request token not provided', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region, audienceDid)
      .resolves([signedCredential])

    sinon
      .stub(BloomVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region)
      .resolves([{ ...signedCredential, id: 'bloomId' }])

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = createWalletStorageService()

    const response = await walletStorageService.getCredentialsByShareToken(null, audienceDid)

    expect(response).to.be.an('array')
    expect(response).to.length(2)
    expect(response).to.include(signedCredential)
  })

  it('#getAllCredentials', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region, audienceDid)
      .resolves([signedCredential])

    sinon
      .stub(BloomVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region)
      .resolves([{ ...signedCredential, id: 'bloomId' }])

    const walletStorageService = createWalletStorageService()
    const response = await walletStorageService.getAllCredentials(audienceDid)

    expect(response).to.be.an('array')
    expect(response).to.length(2)
  })

  it('#getAllCredentials distinct duplicates', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'searchCredentials')
      .withArgs(region, audienceDid)
      .resolves([signedCredential])

    sinon.stub(BloomVaultStorageService.prototype, 'searchCredentials').withArgs(region).resolves([signedCredential])

    const walletStorageService = createWalletStorageService()
    const response = await walletStorageService.getAllCredentials(audienceDid)

    expect(response).to.be.an('array')
    expect(response).to.length(1)
    expect(response).to.eql([signedCredential])
  })

  it('#getCredentialById from Affinidi vault', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
      .withArgs(signedCredential.id, region, audienceDid)
      .resolves(signedCredential)

    const walletStorageService = createWalletStorageService()
    const response = await walletStorageService.getCredentialById(signedCredential.id, audienceDid)

    expect(response).to.eql(signedCredential)
  })

  it('#getCredentialById not found in Affinidi vault and checking in Bloom vault', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
      .withArgs(signedCredential.id, region, audienceDid)
      .throws({ code: 'AVT-2' })

    sinon
      .stub(BloomVaultStorageService.prototype, 'getCredentialById')
      .withArgs(signedCredential.id, region)
      .resolves(signedCredential)

    const walletStorageService = createWalletStorageService()
    const response = await walletStorageService.getCredentialById(signedCredential.id, audienceDid)

    expect(response).to.eql(signedCredential)
  })

  it('#getCredentialById not found', async () => {
    sinon
      .stub(AffinidiVaultStorageService.prototype, 'getCredentialById')
      .withArgs(signedCredential.id, region, audienceDid)
      .throws({ code: 'AVT-2' })

    sinon
      .stub(BloomVaultStorageService.prototype, 'getCredentialById')
      .withArgs(signedCredential.id, region)
      .throws({ code: 'AVT-3' })

    const walletStorageService = createWalletStorageService()
    try {
      await walletStorageService.getCredentialById(signedCredential.id, audienceDid)
    } catch (error) {
      expect(error.code).to.eql('AVT-3')
    }
  })

  it('#deleteCredentialById from Affinidi vault', async () => {
    const affinidiVaultStorageDeleteCall = sinon
      .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
      .withArgs(signedCredential.id, region, audienceDid)
      .resolves()

    const walletStorageService = createWalletStorageService()
    await walletStorageService.deleteCredentialById(signedCredential.id, audienceDid)

    expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
  })

  it('#deleteCredentialById not found in Affinidi vault and checking in Bloom vault', async () => {
    const affinidiVaultStorageDeleteCall = sinon
      .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
      .withArgs(signedCredential.id, region, audienceDid)
      .throws({ code: 'AVT-2' })

    const bloomVaultStorageDeleteCall = sinon
      .stub(BloomVaultStorageService.prototype, 'deleteCredentialById')
      .withArgs(signedCredential.id, region)
      .resolves()

    const walletStorageService = createWalletStorageService()
    await walletStorageService.deleteCredentialById(signedCredential.id, audienceDid)

    expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
    expect(bloomVaultStorageDeleteCall.calledOnce).to.be.true
  })

  it('#deleteCredentialById not found', async () => {
    const affinidiVaultStorageDeleteCall = sinon
      .stub(AffinidiVaultStorageService.prototype, 'deleteCredentialById')
      .withArgs(signedCredential.id, region, audienceDid)
      .throws({ code: 'AVT-2' })

    const bloomVaultStorageDeleteCall = sinon
      .stub(BloomVaultStorageService.prototype, 'deleteCredentialById')
      .withArgs(signedCredential.id, region)
      .throws({ code: 'AVT-3' })

    const walletStorageService = createWalletStorageService()
    try {
      await walletStorageService.deleteCredentialById(signedCredential.id, audienceDid)
    } catch (error) {
      expect(error.code).to.eql('AVT-3')
    }

    expect(affinidiVaultStorageDeleteCall.calledOnce).to.be.true
    expect(bloomVaultStorageDeleteCall.calledOnce).to.be.true
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
