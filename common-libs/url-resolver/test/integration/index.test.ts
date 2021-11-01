import fetch from 'node-fetch'
import { expect } from 'chai'
import { urlResolver, Service } from '../../src'

describe('UrlResolver', () => {
  Object.values(Service).forEach((service) => {
    it(`should provide valid urls for ${service}`, async () => {
      const urls = ['dev', 'staging', 'prod'].map((env) => urlResolver.resolve(service, env))
      const responses = await Promise.all(urls.map(async (url) => fetch(url)))

      responses.forEach((response) => {
        expect(response.status).to.be.lessThan(500)
      })
    })
  })
})
