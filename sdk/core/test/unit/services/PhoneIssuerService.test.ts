import { expect } from 'chai'
import axios from 'axios'
import nock from 'nock'

import { PhoneIssuerService } from '../../../src/services/PhoneIssuerService'

const basePath = 'https://issuer-phone-twillio.test.affinity-project.org'

const customAxios = axios.create({
  baseURL: basePath,
  adapter: require('axios/lib/adapters/http'),
})

describe('PhoneIssuerSerive', () => {
  let service: PhoneIssuerService

  beforeEach(() => {
    service = new PhoneIssuerService({ basePath })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('#initiate calls the initate endpoint', () => {
    it('with a SMS number', async () => {
      const response = {
        id: 'id',
        status: 'status',
        type: ['type'],
        success: true,
        data: {
          phoneNumber: 'phoneNumber',
        },
      }

      const scope = nock(basePath)
        .post('/api/initiate', {
          payload: {
            id: 'id',
            holder: 'holder',
            type: [],
            data: {
              phoneNumber: 'phoneNumber',
            },
          },
        })
        .reply(200, response)

      const result = await service.initiate({
        phoneNumber: 'phoneNumber',
        id: 'id',
        holder: 'holder',
        apiKey: 'apiKey',
        axios: customAxios,
      })

      expect(result).to.deep.eq(response)

      scope.done()
    })

    it('with a WhatsApp number', async () => {
      const response = {
        id: 'id',
        status: 'status',
        type: ['type'],
        success: true,
        data: {
          phoneNumber: 'phoneNumber',
          isWhatsAppNumber: true,
        },
      }

      const scope = nock(basePath)
        .post('/api/initiate', {
          payload: {
            id: 'id',
            holder: 'holder',
            type: [],
            data: {
              phoneNumber: 'phoneNumber',
              isWhatsAppNumber: true,
            },
          },
        })
        .reply(200, response)

      const result = await service.initiate({
        phoneNumber: 'phoneNumber',
        isWhatsAppNumber: true,
        id: 'id',
        holder: 'holder',
        apiKey: 'apiKey',
        axios: customAxios,
      })

      expect(result).to.deep.eq(response)

      scope.done()
    })
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
