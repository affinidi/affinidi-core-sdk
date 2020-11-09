'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import { JwtService } from '@affinidi/common'
import { authorizeVault } from './../../helpers'
import WalletStorageService from '../../../src/services/WalletStorageService'
import { STAGING_VAULT_URL, STAGING_KEY_STORAGE_URL } from '../../../src/_defaultConfig'

import { generateTestDIDs } from '../../factory/didFactory'

const signedCredential = require('../../factory/signedCredential')

const credentialShareRequestToken = require('../../factory/credentialShareRequestToken')
const parsedCredentialShareRequestToken = require('../../factory/parsedCredentialShareRequestToken')

let walletPassword: string

let encryptedSeed: string

const fetchCredentialsPath = '/data/0/99'

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
    await authorizeVault()

    const saveCredentialPath = '/data'

    nock(STAGING_VAULT_URL)
      .filteringPath(() => saveCredentialPath)
      .post(saveCredentialPath)
      .reply(200, {})

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)

    const response = await walletStorageService.saveCredentials([{}])

    expect(response).to.be.an('array')
  })

  it('#pullEncryptedSeed', async () => {
    const encryptedSeed = 'encryptedSeed'
    const readMyKeyPath = '/api/v1/keys/readMyKey'

    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => readMyKeyPath)
      .get(readMyKeyPath)
      .reply(200, { encryptedSeed })

    const response = await WalletStorageService.pullEncryptedSeed('accessToken')

    expect(response).to.include(encryptedSeed)
  })

  it('#filterCredentials', () => {
    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)

    const credentials = [signedCredential]
    const response = walletStorageService.filterCredentials(credentialShareRequestToken, credentials)

    expect(response).to.be.an('array')
    expect(response).to.include(signedCredential)
  })

  it('#filterCredentials when multiple credential requirements and multiple credential intersect', () => {
    const parsedCredentialShareRequestToken = {
      payload: {
        interactionToken: {
          credentialRequirements: [
            {
              type: ['Denis'],
            },
            {
              type: ['Stas', 'Alex'],
            },
          ],
        },
      },
    }

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)

    const expectedFilteredCredentialsToReturn = [
      { type: ['Denis', 'Igor', 'Max', 'Artem'] },
      { type: ['Sasha', 'Alex', 'Stas'] },
    ]

    const credentials = [
      { type: ['Alex', 'Sergiy'] },
      { type: ['Stas'] },
      ...expectedFilteredCredentialsToReturn,
      { type: ['Roman'] },
      { type: ['Max', 'Sergiy'] },
    ]

    const response = walletStorageService.filterCredentials(credentialShareRequestToken, credentials)

    expect(response).to.be.an('array')
    expect(response).to.eql(expectedFilteredCredentialsToReturn)
  })

  it('#filterCredentials when share request token not provided', () => {
    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)

    const credentials = [signedCredential]
    const response = walletStorageService.filterCredentials(null, credentials)

    expect(response).to.be.an('array')
    expect(response).to.include(signedCredential)
  })

  it('#fetchEncryptedCredentials', async () => {
    await authorizeVault()

    nock(STAGING_VAULT_URL).get(fetchCredentialsPath).reply(200, [signedCredential])

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)
    const response = await walletStorageService.fetchEncryptedCredentials()

    expect(response).to.be.an('array')
    expect(response).to.eql([signedCredential])
  })

  it('#fetchEncryptedCredentials throws `COR-14 / 404` when no credentials found', async () => {
    await authorizeVault()

    nock(STAGING_VAULT_URL).get(fetchCredentialsPath).reply(404, { message: 'error' })

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)

    let errorResponse

    try {
      await walletStorageService.fetchEncryptedCredentials()
    } catch (error) {
      errorResponse = error
    }

    const { code, httpStatusCode } = errorResponse

    expect(code).to.eql('COR-14')
    expect(httpStatusCode).to.eql(404)
  })

  it('#fetchEncryptedCredentials throws error returned from vault', async () => {
    await authorizeVault()

    nock(STAGING_VAULT_URL).get(fetchCredentialsPath).reply(500, { message: 'error' })

    const walletStorageService = new WalletStorageService(encryptedSeed, walletPassword)

    let errorResponse

    try {
      await walletStorageService.fetchEncryptedCredentials()
    } catch (error) {
      errorResponse = error
    }

    expect(errorResponse.httpStatusCode).to.eql(500)
  })

  it('#adminConfirmUser', async () => {
    const username = 'username'
    const adminConfirmUserPath = '/api/v1/userManagement/adminConfirmUser'

    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => adminConfirmUserPath)
      .post(adminConfirmUserPath)
      .reply(200, {})

    const response = await WalletStorageService.adminConfirmUser(username)

    expect(response).to.not.exist
  })

  it('#getCredentialOffer', async () => {
    const idToken = 'idToken'
    const getCredentialOfferPath = '/api/v1/issuer/getCredentialOffer'

    nock(STAGING_KEY_STORAGE_URL)
      .filteringPath(() => getCredentialOfferPath)
      .get(getCredentialOfferPath)
      .reply(200, { offerToken: 'offerToken' })

    const returnedOffer = await WalletStorageService.getCredentialOffer(idToken)

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
