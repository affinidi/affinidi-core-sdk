'use strict'

import nock from 'nock'
import sinon from 'sinon'

import { KeysService, JwtService, DidDocumentService, LocalKeyVault } from '@affinidi/common'
import { DidAuthClientService, Signer } from '@affinidi/affinidi-did-auth-lib'
import { resolveUrl, Service } from '@affinidi/url-resolver'

import AffinidiVaultStorageService from '../../../src/services/AffinidiVaultStorageService'
import { DidAuthAdapter } from '../../../src/shared/DidAuthAdapter'
import { generateTestDIDs } from '../../factory/didFactory'
import { testPlatformTools } from '../../helpers/testPlatformTools'
import credential from '../../factory/signedCredential'
import { VaultCredential } from '../../../src/dto/vault.dto'
import { expect } from 'chai'
import { extractSDKVersion } from '../../../src/_helpers'

const affinidiVaultUrl = resolveUrl(Service.VAULT, 'staging')
const registryUrl = resolveUrl(Service.REGISTRY, 'staging')

let encryptionKey: string
let encryptedSeed: string
let audienceDid: string
let requestToken: string
const region = 'eu-west-2'
const reqheaders: Record<string, string> = {}

const createAffinidiStorageService = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  const documentService = DidDocumentService.createDidDocumentService(keysService)
  const keyVault = new LocalKeyVault(keysService)
  const signer = new Signer({
    did: documentService.getMyDid(),
    keyId: documentService.getKeyId(),
    keyVault,
  })
  const didAuthService = new DidAuthClientService(signer)
  const didAuthAdapter = new DidAuthAdapter(audienceDid, didAuthService)
  return new AffinidiVaultStorageService(keysService, testPlatformTools, {
    vaultUrl: affinidiVaultUrl,
    accessApiKey: undefined,
    didAuthAdapter,
  })
}

const mockDidAuth = () => {
  nock(affinidiVaultUrl, { reqheaders })
    .post('/api/v1/did-auth/create-did-auth-request')
    .reply(200, JSON.stringify(requestToken), { 'content-type': 'application/json' })

  nock(registryUrl, { reqheaders }).post('/api/v1/did-auth/create-did-auth-response').reply(200, {})
}

describe('AffinidiVaultStorageService', () => {
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

  afterEach(() => {
    sinon.restore()
  })

  it('#saveCredentials', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .put('/api/v1/credentials/' + credential.id)
      .reply(200, {
        credentialId: credential.id,
      } as VaultCredential)

    const service = createAffinidiStorageService()
    const credentials = await service.saveCredentials([credential], region)

    expect(credentials[0].credentialId).to.eql(credential.id)
  })

  it('#saveCredentialsWithError', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .put('/api/v1/credentials/' + credential.id)
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createAffinidiStorageService()
    try {
      await service.saveCredentials([credential], region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#getAllCredentials', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .get('/api/v1/credentials')
      .reply(200, {
        credentials: [
          {
            credentialId: credential.id,
            payload: JSON.stringify(credential),
          },
          {
            credentialId: credential.id,
            payload: JSON.stringify(credential),
          },
        ] as VaultCredential[],
      })

    const service = createAffinidiStorageService()
    const credentials = await service.searchCredentials(region)
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(credential.id)
  })

  it('#getAllCredentialsByTypes', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .get('/api/v1/credentials?types=' + JSON.stringify([credential.type]))
      .reply(200, {
        credentials: [
          {
            credentialId: credential.id,
            payload: JSON.stringify(credential),
          },
          {
            credentialId: credential.id,
            payload: JSON.stringify(credential),
          },
        ] as VaultCredential[],
      })

    const service = createAffinidiStorageService()
    const credentials = await service.searchCredentials(region, [credential.type])
    expect(credentials).to.length(2)
    expect(credentials[0].id).to.eql(credential.id)
  })

  it('#getAllCredentialsWithError', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .get('/api/v1/credentials')
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createAffinidiStorageService()
    try {
      await service.searchCredentials(region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#getCredentialById', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .get('/api/v1/credentials/' + credential.id)
      .reply(200, {
        credentialId: credential.id,
        payload: JSON.stringify({ id: credential.id }),
      } as VaultCredential)

    const service = createAffinidiStorageService()
    const result = await service.getCredentialById(credential.id, region)
    expect(result.id).to.eql(credential.id)
  })

  it('#getCredentialByIdWithError', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .get('/api/v1/credentials/' + credential.id)
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createAffinidiStorageService()
    try {
      await service.getCredentialById(credential.id, region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#deleteCredentialById', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .delete('/api/v1/credentials/' + credential.id)
      .reply(200, {})

    const service = createAffinidiStorageService()
    await service.deleteCredentialById(credential.id, region)
  })

  it('#deleteCredentialByIdWithError', async () => {
    mockDidAuth()

    nock(affinidiVaultUrl, { reqheaders })
      .delete('/api/v1/credentials/' + credential.id)
      .reply(500, { code: 'COM-1', message: 'internal server error' })

    const service = createAffinidiStorageService()
    try {
      await service.deleteCredentialById(credential.id, region)
    } catch (error) {
      expect(error.code).to.eql('COM-1')
    }
  })

  it('#deleteAllCredentials', async () => {
    mockDidAuth()

    const getAllResponse = {
      credentials: [
        {
          credentialId: credential.id,
          payload: JSON.stringify(credential),
        },
        {
          credentialId: credential.id + '1',
          payload: JSON.stringify({ ...credential, id: credential.id + '1' }),
        },
      ] as VaultCredential[],
    }

    nock(affinidiVaultUrl, { reqheaders }).get('/api/v1/credentials').reply(200, getAllResponse)

    for (const cred of getAllResponse.credentials) {
      nock(affinidiVaultUrl, { reqheaders })
        .delete('/api/v1/credentials/' + cred.credentialId)
        .reply(200, {})
    }

    const service = createAffinidiStorageService()
    await service.deleteAllCredentials(region)
  })
})
