'use strict'

import nock from 'nock'
import sinon from 'sinon'

import { KeysService } from '@affinidi/common'

import BloomVaultStorageService from '../../../src/services/BloomVaultStorageService'
import { generateTestDIDs } from '../../factory/didFactory'
import { testPlatformTools } from '../../helpers/testPlatformTools'
import { STAGING_BLOOM_VAULT_URL } from '../../../src/_defaultConfig'
import { expect } from 'chai'
import { authorizeVault } from './../../helpers'
import signedCredential from '../../factory/signedCredential'

let encryptionKey: string
let encryptedSeed: string
const region = 'eu-west-2'

const createBloomStorageService = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  return new BloomVaultStorageService(keysService, testPlatformTools, {
    vaultUrl: STAGING_BLOOM_VAULT_URL,
    accessApiKey: undefined,
  })
}

describe('BloomVaultStorageService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    encryptionKey = testDids.password
    encryptedSeed = testDids.jolo.encryptedSeed
  })

  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#getAllCredentials', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials for multpiple pages with empty values', async () => {
    await authorizeVault()

    const page = Array(100).fill({ id: 0, cyphertext: JSON.stringify(signedCredential) })
    page[5] = { id: 0, cyphertext: null }

    nock(STAGING_BLOOM_VAULT_URL).get('/data/0/99').reply(200, page)
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, page)
    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/200/299')
      .reply(200, Array(50).fill({ id: 0, cyphertext: JSON.stringify(signedCredential) }))
    nock(STAGING_BLOOM_VAULT_URL).get('/data/300/399').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(248)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentialsByTypes', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region, [signedCredential.type])
    expect(credentials).to.length(1)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getCredentials with types=[[]] except which do not have type property', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
        { id: 2, cyphertext: JSON.stringify({ ...signedCredential, type: [] }) },
        { id: 3, cyphertext: JSON.stringify({ ...signedCredential, type: undefined }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region, [[]])
    expect(credentials).to.length(3)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials when multiple credential requirements and multiple credential intersect', async () => {
    await authorizeVault()

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

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(credentials[0]) },
        { id: 1, cyphertext: JSON.stringify(credentials[1]) },
        { id: 2, cyphertext: JSON.stringify(credentials[2]) },
        { id: 3, cyphertext: JSON.stringify(credentials[3]) },
        { id: 4, cyphertext: JSON.stringify(credentials[4]) },
        { id: 5, cyphertext: JSON.stringify(credentials[5]) },
      ])

    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const filteredCredentials = await service.searchCredentials(region, [['Denis'], ['Stas', 'Alex']])
    expect(filteredCredentials).to.length(2)
    expect(filteredCredentials).to.be.an('array')
    expect(filteredCredentials).to.eql(expectedFilteredCredentialsToReturn)
  })

  it('#getAllCredentialsWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL).get('/data/0/99').reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.searchCredentials(region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#getCredentialById', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credential = await service.getCredentialById(signedCredential.id, region)
    expect(credential.id).to.eql(signedCredential.id)
  })

  it('#getCredentialByIdWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL).get('/data/0/99').reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.getCredentialById(signedCredential.id, region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#deleteCredentialById', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    nock(STAGING_BLOOM_VAULT_URL).delete('/data/0/0').reply(200, {})

    const service = createBloomStorageService()
    await service.deleteCredentialById(signedCredential.id, region)
  })

  it('#deleteCredentialByIdWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL)
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL).get('/data/100/199').reply(200, [])

    nock(STAGING_BLOOM_VAULT_URL).delete('/data/0/0').reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.getCredentialById(signedCredential.id, region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#deleteAllCredentials', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL).delete('/data/0/99').reply(200, {})

    const service = createBloomStorageService()
    await service.deleteAllCredentials(region)
  })

  it('#deleteAllCredentialsWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL).delete('/data/0/99').reply(500, { code: 'COR-0', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.deleteAllCredentials(region)
    } catch (error) {
      expect(error.code).to.eql('COR-0')
    }
  })
})
