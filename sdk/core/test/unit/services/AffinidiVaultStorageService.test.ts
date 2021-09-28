'use strict'

import nock from 'nock'
import sinon from 'sinon'

import { KeysService, JwtService } from '@affinidi/common'
import { DidAuthAdapter } from '@affinidi/internal-api-clients'

import AffinidiVaultStorageService from '../../../src/services/AffinidiVaultStorageService'
import { generateTestDIDs } from '../../factory/didFactory'
import { testPlatformTools } from '../../helpers/testPlatformTools'
import { STAGING_AFFINIDI_VAULT_URL, STAGING_REGISTRY_URL } from '../../../src/_defaultConfig'
import credential from '../../factory/signedCredential'
import { VaultCredential } from '../../../src/dto/vault.dto'
import { expect } from 'chai'
import { extractSDKVersion } from '../../../src/_helpers'

let encryptionKey: string
let encryptedSeed: string
let audienceDid: string
let requestToken: string
const region = 'eu-west-2'
const reqheaders: Record<string, string> = {}

const createAffinidiStorageService = () => {
  const keysService = new KeysService(encryptedSeed, encryptionKey)
  const didAuthAdapter = new DidAuthAdapter(audienceDid, { encryptedSeed, encryptionKey })
  return new AffinidiVaultStorageService(keysService, testPlatformTools, {
    vaultUrl: STAGING_AFFINIDI_VAULT_URL,
    accessApiKey: undefined,
    didAuthAdapter,
  })
}

const mockDidAuth = () => {
  nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
    .post('/api/v1/did-auth/create-did-auth-request')
    .reply(200, `"${requestToken}"`)

  nock(STAGING_REGISTRY_URL, { reqheaders }).post('/api/v1/did-auth/create-did-auth-response').reply(200, {})
}

describe('AffinidiVaultStorageService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    encryptionKey = testDids.password
    encryptedSeed = testDids.jolo.encryptedSeed
    audienceDid = testDids.elem.did
    const keysService = new KeysService(encryptedSeed, encryptionKey)
    const jwtService = new JwtService()
    const requestTokenObject = await keysService.signJWT({
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
      payload: {
        sub: '1234567890',
        name: 'John Doe',
        exp: Date.now() + 60 * 60 * 1000,
        iat: Date.now(),
        iss: 'did:elem:EiCH-xxcnkgZv6Qvjvo_UXn-8DUdUN3EtBJxolAQbQrCcA#',
      },
    })
    requestToken = jwtService.encodeObjectToJWT(requestTokenObject)

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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
      .delete('/api/v1/credentials/' + credential.id)
      .reply(200, {})

    const service = createAffinidiStorageService()
    await service.deleteCredentialById(credential.id, region)
  })

  it('#deleteCredentialByIdWithError', async () => {
    mockDidAuth()

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
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

    nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders }).get('/api/v1/credentials').reply(200, getAllResponse)

    sinon.stub(DidAuthAdapter.prototype, 'isTokenExpired').returns(false)

    for (const cred of getAllResponse.credentials) {
      nock(STAGING_AFFINIDI_VAULT_URL, { reqheaders })
        .delete('/api/v1/credentials/' + cred.credentialId)
        .reply(200, {})
    }

    const service = createAffinidiStorageService()
    await service.deleteAllCredentials(region)
  })
})
