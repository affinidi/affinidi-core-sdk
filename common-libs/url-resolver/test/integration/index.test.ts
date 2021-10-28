import got from 'got'
import { expect } from 'chai'
import resolveUrl, { Services } from '../../src'

describe('resolveUrl', () => {
  const envs = ['dev', 'staging', 'prod']
  const services = Object.values(Services)
  const specificCaseServices = [Services.SCHEMA_MANAGER]
  const commonCaseServices = services.filter((service) => !specificCaseServices.includes(service))

  commonCaseServices.forEach((service) => {
    it(`should provide valid urls for ${service}`, async () => {
      const urls = envs.map((env) => resolveUrl(service, env))

      const responses = await Promise.all(
        urls.map(async (url) => got(`${url}/health`).then((res) => JSON.parse(res.body))),
      )

      responses.forEach((response) => {
        expect(response).to.have.property('status', 'Ok')
      })
    })
  })

  it('should provide valid urls for affinidi-schema-manager', async () => {
    {
      const url = resolveUrl(Services.SCHEMA_MANAGER, 'dev')
      const response = await got(`${url}/health`).then((res) => JSON.parse(res.body))
      expect(response).to.have.property('status', 'Ok')
    }
    {
      const urls = ['staging', 'prod'].map((env) => resolveUrl(Services.SCHEMA_MANAGER, env))
      const responses = await Promise.all(urls.map(async (url) => got(url)))
      responses.forEach((response) => {
        expect(response).to.have.property('statusMessage', 'OK')
      })
    }
  })
})
