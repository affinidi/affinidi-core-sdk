'use strict'

import nock from 'nock'
import sinon from 'sinon'

import { DidAuthClientService, Signer } from '@affinidi/affinidi-did-auth-lib'
import { DidDocumentService, JwtService, KeysService, LocalKeyVault } from '@affinidi/common'
import { resolveUrl, Service } from '@affinidi/url-resolver'

import AffinidiVaultEncryptionService from '../../../src/services/AffinidiVaultEncryptionService'
import BloomVaultStorageService from '../../../src/services/BloomVaultStorageService'
import { generateTestDIDs } from '../../factory/didFactory'
import { testPlatformTools } from '../../helpers/testPlatformTools'
import { expect } from 'chai'
import { authorizeVault } from './../../helpers'
import signedCredential from '../../factory/signedCredential'
import { extractSDKVersion } from '../../../src/_helpers'
import { MigrationHelper } from '../../../src/migration/credentials'
import { DidAuthAdapter } from '../../../src/shared/DidAuthAdapter'

const bloomVaultUrl = resolveUrl(Service.BLOOM_VAUlT, 'staging')
const migrationUrl = resolveUrl(Service.VAULT_MIGRATION, 'staging')
const registryUrl = resolveUrl(Service.REGISTRY, 'staging')

let encryptionKey: string
let encryptedSeed: string
let audienceDid: string
let requestToken: string
const region = 'eu-west-2'
const reqheaders: Record<string, string> = {}

const createBloomStorageService = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  const encryptionService = new AffinidiVaultEncryptionService(keysService, testPlatformTools)
  const documentService = DidDocumentService.createDidDocumentService(keysService)
  const keyVault = new LocalKeyVault(keysService)
  const signer = new Signer({
    did: documentService.getMyDid(),
    keyId: documentService.getKeyId(),
    keyVault,
  })
  const didAuthService = new DidAuthClientService(signer)
  const didAuthAdapter = new DidAuthAdapter(audienceDid, didAuthService)
  return new BloomVaultStorageService(keysService, testPlatformTools, {
    vaultUrl: bloomVaultUrl,
    migrationUrl,
    accessApiKey: '',
    didAuthAdapter,
    encryptionService,
  })
}

const mockDidAuth = () => {
  nock(migrationUrl)
    .post('/did-auth/create-did-auth-request')
    .reply(200, JSON.stringify(requestToken), { 'content-type': 'application/json' })

  nock(registryUrl, { reqheaders }).post('/api/v1/did-auth/create-did-auth-response').reply(200, {})
}

describe('BloomVaultStorageService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    encryptionKey = testDids.password
    encryptedSeed = testDids.jolo.encryptedSeed
    audienceDid = testDids.elem.did

    const keysService = new KeysService(encryptedSeed, encryptionKey)
    const requestTokenObject = await keysService.signJWT({
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
      payload: {
        sub: '1234567890',
        name: 'John Doe',
        exp: Date.now() + 60 * 60 * 1000,
        createdAt: Date.now(),
        iss: 'did:elem:EiCH-xxcnkgZv6Qvjvo_UXn-8DUdUN3EtBJxolAQbQrCcA#',
      },
    })
    requestToken = JwtService.encodeObjectToJWT(requestTokenObject)

    reqheaders['X-SDK-Version'] = extractSDKVersion()
  })

  after(() => {
    nock.cleanAll()
  })

  beforeEach(() => {
    mockDidAuth()
  })

  afterEach(() => {
    sinon.restore()
  })

  it(' should not run `MigrationHelper.getMigrationStatus` and  `runMigration.MigrationHelper` if migration not started', async () => {
    await authorizeVault()
    const stubStatus = sinon.stub(MigrationHelper.prototype, 'getMigrationStatus').resolves('error')
    const stubMigrationProcess = sinon.stub(MigrationHelper.prototype, 'runMigration').resolves()

    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])
    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)

    expect(stubStatus.notCalled).to.be.true
    expect(stubMigrationProcess.notCalled).to.be.true
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('should return empty array if migration done', async () => {
    sinon
      .stub(BloomVaultStorageService.prototype, 'didEthr')
      .returns('did:ethr:0x042f98f56ad0ca5d5fecc26e3930df37cd5a5d8a')

    await authorizeVault()

    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'true', { 'content-type': 'application/json' })
    const service = createBloomStorageService()
    nock(migrationUrl, { reqheaders })
      .get(`/migration/done/${service.didEthr}`)
      .reply(200, 'true', { 'content-type': 'application/json' })
    const credentials = await service.searchCredentials(region)

    expect(credentials).to.length(0)
  })

  it('should call `MigrationHelper.runMigration` method only once if migration done endpoint return false', async () => {
    await authorizeVault()

    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])
    const stub = sinon.stub(MigrationHelper.prototype, 'runMigration').resolves()
    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'true', { 'content-type': 'application/json' })
    const service = createBloomStorageService()
    nock(migrationUrl, { reqheaders })
      .get(`/migration/done/${service.didEthr}`)
      .reply(200, 'false', { 'content-type': 'application/json' })
    nock(bloomVaultUrl, { reqheaders })
      .post(`/auth/request-token?did=${service.didEthr}`)
      .reply(200, { token: 'token' })
    const credentials = await service.searchCredentials(region)

    expect(stub.calledOnce).to.be.true
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials', async () => {
    await authorizeVault()
    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials for multpiple pages with empty values', async () => {
    await authorizeVault()
    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
    const page = Array(100).fill({ id: 0, cyphertext: JSON.stringify(signedCredential) })
    page[5] = { id: 0, cyphertext: null }

    nock(bloomVaultUrl, { reqheaders }).get('/data/0/99').reply(200, page)
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, page)
    nock(bloomVaultUrl, { reqheaders })
      .get('/data/200/299')
      .reply(200, Array(50).fill({ id: 0, cyphertext: JSON.stringify(signedCredential) }))
    nock(bloomVaultUrl, { reqheaders }).get('/data/300/399').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(248)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentialsByTypes', async () => {
    await authorizeVault()

    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region, [signedCredential.type])
    expect(credentials).to.length(1)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getCredentials with types=[[]] except which do not have type property', async () => {
    await authorizeVault()
    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, type: ['type1'] }) },
        { id: 2, cyphertext: JSON.stringify({ ...signedCredential, type: [] }) },
        { id: 3, cyphertext: JSON.stringify({ ...signedCredential, type: undefined }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credentials = await service.searchCredentials(region, [[]])
    expect(credentials).to.length(3)
    expect(credentials[0].id).to.eql(signedCredential.id)
  })

  it('#getAllCredentials when multiple credential requirements and multiple credential intersect', async () => {
    await authorizeVault()
    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
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

    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(credentials[0]) },
        { id: 1, cyphertext: JSON.stringify(credentials[1]) },
        { id: 2, cyphertext: JSON.stringify(credentials[2]) },
        { id: 3, cyphertext: JSON.stringify(credentials[3]) },
        { id: 4, cyphertext: JSON.stringify(credentials[4]) },
        { id: 5, cyphertext: JSON.stringify(credentials[5]) },
      ])

    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const filteredCredentials = await service.searchCredentials(region, [['Denis'], ['Stas', 'Alex']])
    expect(filteredCredentials).to.length(2)
    expect(filteredCredentials).to.be.an('array')
    expect(filteredCredentials).to.eql(expectedFilteredCredentialsToReturn)
  })

  it('#getAllCredentialsWithError', async () => {
    await authorizeVault()

    nock(migrationUrl, { reqheaders })
      .get('/migration/started')
      .reply(200, 'false', { 'content-type': 'application/json' })
    nock(bloomVaultUrl, { reqheaders })
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

    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    const service = createBloomStorageService()
    const credential = await service.getCredentialById(signedCredential.id, region)
    expect(credential.id).to.eql(signedCredential.id)
  })

  it('#getCredentialByIdWithError', async () => {
    await authorizeVault()

    nock(bloomVaultUrl, { reqheaders })
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

    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    nock(bloomVaultUrl, { reqheaders }).delete('/data/0/0').reply(200, {})

    const service = createBloomStorageService()
    await service.deleteCredentialById(signedCredential.id, region)
  })

  it('#deleteCredentialByIdWithError', async () => {
    await authorizeVault()

    nock(bloomVaultUrl, { reqheaders })
      .get('/data/0/99')
      .reply(200, [
        { id: 0, cyphertext: JSON.stringify(signedCredential) },
        { id: 1, cyphertext: JSON.stringify({ ...signedCredential, id: 'identifier' }) },
      ])
    nock(bloomVaultUrl, { reqheaders }).get('/data/100/199').reply(200, [])

    nock(bloomVaultUrl, { reqheaders })
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

    nock(bloomVaultUrl, { reqheaders }).delete('/data/0/99').reply(200, {})

    const service = createBloomStorageService()
    await service.deleteAllCredentials(region)
  })

  it('#deleteAllCredentialsWithError', async () => {
    await authorizeVault()

    nock(bloomVaultUrl, { reqheaders })
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
