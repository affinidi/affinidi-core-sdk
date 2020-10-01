'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'

import ApiService from '../../../src/services/ApiService'
import { STAGING_REGISTRY_URL } from '../../../src/_defaultConfig'

describe('ApiService', () => {
  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#execute', async () => {
    nock(STAGING_REGISTRY_URL).post('/api/v1/did/resolve-did').reply(200, {})

    const apiService = new ApiService()

    const { body, status } = await apiService.execute('registry.ResolveDid')

    expect(body).to.eql({})
    expect(status).to.eql(200)
  })
})
