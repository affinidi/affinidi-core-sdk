import fetch from 'node-fetch'
import { expect } from 'chai'
import { urlResolver, Service } from '../../src'

describe('UrlResolver', () => {
  const envs = ['dev', 'staging', 'prod']
  const services = Object.values(Service)
  const specificCaseServices = [Service.SCHEMA_MANAGER]
  const commonCaseServices = services.filter((service) => !specificCaseServices.includes(service))

  commonCaseServices.forEach((service) => {
    it(`should provide valid urls for ${service}`, async () => {
      const urls = envs.map((env) => urlResolver.resolve(service, env))

      const responses = await Promise.all(
        urls.map(async (url) => fetch(`${url}/health`).then((res) => res.json())),
      )

      responses.forEach((response) => {
        expect(response).to.have.property('status', 'Ok')
      })
    })
  })

  it('should provide valid urls for affinidi-schema-manager', async () => {
    {
      const url = urlResolver.resolve(Service.SCHEMA_MANAGER, 'dev')
      const response = await fetch(`${url}/health`).then((res) => res.json())
      expect(response).to.have.property('status', 'Ok')
    }
    {
      const urls = ['staging', 'prod'].map((env) =>
        urlResolver.resolve(Service.SCHEMA_MANAGER, env),
      )
      const responses = await Promise.all(urls.map(async (url) => fetch(url)))
      responses.forEach((response) => {
        expect(response).to.have.property('statusText', 'OK')
      })
    }
  })
})
