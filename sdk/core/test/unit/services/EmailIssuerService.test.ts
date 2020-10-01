import { expect } from 'chai'
import axios from 'axios'
import nock from 'nock'

import { EmailIssuerService } from '../../../src/services/EmailIssuerService'

const basePath = 'https://issuer-phone-twillio.test.affinity-project.org'

const customAxios = axios.create({
  baseURL: basePath,
  adapter: require('axios/lib/adapters/http'),
})

describe('EmailIssuerService', () => {
  let service: EmailIssuerService

  beforeEach(() => {
    service = new EmailIssuerService({ basePath })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('#initiate calls the initate endpoint', async () => {
    const response = {
      id: 'id',
      status: 'status',
      type: ['type'],
      success: true,
      data: {
        emailAddress: 'emailAddress',
      },
    }

    const scope = nock(basePath)
      .post('/api/initiate', {
        payload: {
          id: 'id',
          holder: 'holder',
          type: [],
          data: {
            emailAddress: 'emailAddress',
          },
        },
      })
      .reply(200, response)

    const result = await service.initiate({
      emailAddress: 'emailAddress',
      id: 'id',
      holder: 'holder',
      apiKey: 'apiKey',
      axios: customAxios,
    })

    expect(result).to.deep.eq(response)

    scope.done()
  })

  it('#verify calls the verify endpoint', async () => {
    const response = {
      id: 'id',
      success: true,
      type: ['type'],
      status: 'status',
      data: {
        code: 'code',
      },
      vcs: <any>[],
    }

    const scope = nock(basePath)
      .post('/api/verify', {
        payload: {
          id: 'id',
          holder: 'holder',
          type: [],
          data: {
            code: 'code',
          },
        },
      })
      .reply(200, response)

    const result = await service.verify({
      apiKey: 'apiKey',
      code: 'code',
      id: 'id',
      holder: 'holder',
      axios: customAxios,
    })

    expect(result).to.deep.eq(response)

    scope.done()
  })
})
