'use strict'

import nock from 'nock'
import { MockAgent, setGlobalDispatcher } from 'undici'
import sinon from 'sinon'
import { expect } from 'chai'

import RegistryApiService from '../../../src/services/RegistryApiService'

const STAGING_REGISTRY_URL = 'https://fake-registry.xyz'

const setupMockServices = () => {
  const undiciMockAgent = new MockAgent()
  undiciMockAgent.disableNetConnect()
  undiciMockAgent
    .get(STAGING_REGISTRY_URL)
    .intercept({
      method: 'POST',
      path: '/api/v1/did/resolve-did',
    })
    .reply(200, { didDocument: {} })
  setGlobalDispatcher(undiciMockAgent)
  nock(STAGING_REGISTRY_URL).post('/api/v1/did/resolve-did').reply(200, { didDocument: {} })
}

describe('ApiService', () => {
  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#execute', async () => {
    setupMockServices()
    const apiService = new RegistryApiService({ registryUrl: STAGING_REGISTRY_URL, accessApiKey: 'fakeKey' })

    const { body, status } = await apiService.resolveDid({ did: 'abc' })

    expect(body).to.eql({ didDocument: {} })
    expect(status).to.eql(200)
  })
})
