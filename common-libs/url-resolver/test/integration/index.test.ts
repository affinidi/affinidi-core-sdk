import fetch from 'node-fetch'
import { expect } from 'chai'
import { resolveUrl, Service } from '../../src'

describe('resolveUrl', () => {
  Object.values(Service).forEach((service) => {
    it(`should provide valid urls for ${service}`, async () => {
      const urls = ['dev', 'staging', 'prod'].map((env) => resolveUrl(service, env))
      const responses = await Promise.all(urls.map(async (url) => fetch(url)))

      responses.forEach((response) => {
        expect(response.status).to.be.lessThan(500)
      })
    })
  })
})
