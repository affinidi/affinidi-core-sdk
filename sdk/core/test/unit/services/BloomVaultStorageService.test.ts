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
import { extractSDKVersion } from '../../../src/_helpers'
import { DidAuthService } from '../../../src/migration/credentials/DidAuthService'
import { MigrationHelper, VAULT_MIGRATION_SERVICE_URL } from '../../../src/migration/credentials'

let encryptionKey: string
let encryptedSeed: string
const region = 'eu-west-2'
const reqheaders: Record<string, string> = {}

const createBloomStorageService = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  return new BloomVaultStorageService(keysService, testPlatformTools, {
    vaultUrl: STAGING_BLOOM_VAULT_URL,
    accessApiKey: undefined,
    didAuthAdapter: undefined,
  })
}

describe('BloomVaultStorageService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    encryptionKey = testDids.password
    encryptedSeed = testDids.jolo.encryptedSeed

    reqheaders['X-SDK-Version'] = extractSDKVersion()
  })

  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it(' should not run `MigrationHelper.getMigrationStatus` and  `runMigration.MigrationHelper` if migration not started', async () => {
    await authorizeVault()
    const stubStatus = sinon.stub(MigrationHelper.prototype, 'getMigrationStatus').resolves(true)
    const stubMigrationProcess = sinon.stub(MigrationHelper.prototype, 'runMigration').resolves()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)

    expect(stubStatus.notCalled).to.be.true
    expect(stubMigrationProcess.notCalled).to.be.true
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('should return empty array if migration done', async () => {
    sinon.stub(DidAuthService.prototype, 'pullDidAuthRequestToken').returns(Promise.resolve('requestToken'))
    sinon.stub(DidAuthService.prototype, 'createDidAuthResponseToken').returns(Promise.resolve('responseToken'))
    sinon
      .stub(BloomVaultStorageService.prototype, 'didEthr')
      .returns('did:ethr:0x042f98f56ad0ca5d5fecc26e3930df37cd5a5d8a')

    await authorizeVault()

    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'true')
    const service = createBloomStorageService()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get(`/migration/done/${service.didEthr}`).reply(200, 'true')
    const credentials = await service.searchCredentials(region)

    expect(credentials).to.length(0)
  })

  it('should call `MigrationHelper.runMigration` method only once if migration done endpoint return false', async () => {
    sinon.stub(DidAuthService.prototype, 'pullDidAuthRequestToken').returns(Promise.resolve('requestToken'))
    sinon.stub(DidAuthService.prototype, 'createDidAuthResponseToken').returns(Promise.resolve('responseToken'))

    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])
    const stub = sinon.stub(MigrationHelper.prototype, 'runMigration').resolves()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'true')
    const service = createBloomStorageService()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get(`/migration/done/${service.didEthr}`).reply(200, 'false')
    const credentials = await service.searchCredentials(region)

    expect(stub.calledOnce).to.be.true
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials', async () => {
    await authorizeVault()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials for multpiple pages with empty values', async () => {
    await authorizeVault()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    const page = Array(100).fill({ id: 0, cyphertext: JSON.stringify(signedCredential) })
    page[5] = { id: 0, cyphertext: null }

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/0/99').reply(200, page)
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, page)
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/200/299')
      .reply(200, Array(50).fill({ id: 0, cyphertext: JSON.stringify(signedCredential) }))
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/300/399').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(248)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentialsByTypes', async () => {
    await authorizeVault()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region, [signedCredential.type])
    expect(credentials).to.length(1)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getCredentials with types=[[]] except which do not have type property', async () => {
    await authorizeVault()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
        { id: 2, cyphertext: JSON.stringify({ ...signedCredential, type: [] }) },
        { id: 3, cyphertext: JSON.stringify({ ...signedCredential, type: undefined }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region, [[]])
    expect(credentials).to.length(3)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials when multiple credential requirements and multiple credential intersect', async () => {
    await authorizeVault()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    const expectedFilteredCredentialsToReturn = [
      { bloomId: 2, type: ['Denis', 'Igor', 'Max', 'Artem'] },
      { bloomId: 3, type: ['Sasha', 'Alex', 'Stas'] },
    ]

    const credentials = [
      { type: ['Alex', 'Sergiy'] },
      { type: ['Stas'] },
      ...expectedFilteredCredentialsToReturn,
      { type: ['Roman'] },
      { type: ['Max', 'Sergiy'] },
    ]

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(credentials[0]) },
        { id: 1, cyphertext: JSON.stringify(credentials[1]) },
        { id: 2, cyphertext: JSON.stringify(credentials[2]) },
        { id: 3, cyphertext: JSON.stringify(credentials[3]) },
        { id: 4, cyphertext: JSON.stringify(credentials[4]) },
        { id: 5, cyphertext: JSON.stringify(credentials[5]) },
      ])

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const filteredCredentials = await service.searchCredentials(region, [['Denis'], ['Stas', 'Alex']])
    expect(filteredCredentials).to.length(2)
    expect(filteredCredentials).to.be.an('array')
    expect(filteredCredentials).to.eql(expectedFilteredCredentialsToReturn)
  })

  it('#getAllCredentialsWithError', async () => {
    await authorizeVault()
    nock(VAULT_MIGRATION_SERVICE_URL, { reqheaders }).get('/migration/started').reply(200, 'false')
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.searchCredentials(region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#getCredentialById', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credential = await service.getCredentialById(signedCredential.id, region)
    expect(credential.id).to.eql(signedCredential.id)
  })

  it('#getCredentialByIdWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.getCredentialById(signedCredential.id, region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#deleteCredentialById', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).delete('/data/0/0').reply(200, {})

    const service = createBloomStorageService()
    await service.deleteCredentialById(signedCredential.id, region)
  })

  it('#deleteCredentialByIdWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).get('/data/100/199').reply(200, [])

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .delete('/data/0/0')
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.getCredentialById(signedCredential.id, region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#deleteAllCredentials', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders }).delete('/data/0/99').reply(200, {})

    const service = createBloomStorageService()
    await service.deleteAllCredentials(region)
  })

  it('#deleteAllCredentialsWithError', async () => {
    await authorizeVault()

    nock(STAGING_BLOOM_VAULT_URL, { reqheaders })
      .delete('/data/0/99')
      .reply(500, { code: 'COR-0', message: 'internal server error' })

    const service = createBloomStorageService()
    try {
      await service.deleteAllCredentials(region)
    } catch (error) {
      expect(error.code).to.eql('COR-0')
    }
  })
})
