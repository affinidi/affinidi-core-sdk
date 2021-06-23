'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import { STAGING_REGISTRY_URL } from '../../../src/_defaultConfig'
import RegistryApiService from '../../../src/services/RegistryApiService'

describe('ApiService', () => {
  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#execute', async () => {
    nock(STAGING_REGISTRY_URL).post('/api/v1/did/resolve-did').reply(200, {})

    const apiService = new RegistryApiService({ registryUrl: STAGING_REGISTRY_URL, accessApiKey: undefined })

    const { body, status } = await apiService.resolveDid({ did: 'abc' })

    expect(body).to.eql({})
    expect(status).to.eql(200)
  })
})
