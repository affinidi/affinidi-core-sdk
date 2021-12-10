import fetch from 'node-fetch'
import { expect } from 'chai'
import { Env, resolveUrl, Service } from '../../src'

describe('resolveUrl', () => {
  // should always be public for tests
  process.env.AFFINIDI_INTERNAL_SERVICE = undefined

  Object.values(Service).forEach((service) => {
    it(`should provide valid urls for ${service}`, async () => {
      const urls = ['dev', 'staging', 'prod'].map((env: Env) => resolveUrl(service, env))
      const responses = await Promise.all(urls.map(async (url) => fetch(url)))

      responses.forEach((response) => {
        expect(response.status).to.be.lessThan(500)
      })
    })
  })
})
