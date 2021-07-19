'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import RegistryApiService from '../../../src/services/RegistryApiService'

const STAGING_REGISTRY_URL = 'https://fake/registry'

describe('ApiService', () => {
  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#execute', async () => {
    nock(STAGING_REGISTRY_URL).post('/api/v1/did/resolve-did').reply(200, {})

    const apiService = new RegistryApiService({ registryUrl: STAGING_REGISTRY_URL, accessApiKey: 'fakeKey' })

    const { body, status } = await apiService.resolveDid({ did: 'abc' })

    expect(body).to.eql({})
    expect(status).to.eql(200)
  })
})
