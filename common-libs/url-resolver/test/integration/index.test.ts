import fetch from 'node-fetch'
import { expect } from 'chai'
import { resolveUrl, Service } from '../../src'

const parallel = require('mocha.parallel')

const envs = ['dev', 'staging', 'prod'] as const

parallel('resolveUrl', () => {
  // should always be public for tests
  process.env.AFFINIDI_INTERNAL_SERVICE = undefined

  Object.values(Service).forEach((service) => {
    // Workaround for UCC-2207 until UCC-2176 is implemented
    if (service === Service.METRICS) {
      return
    }

    envs.forEach((env) => {
      it(`should provide valid urls for ${service} on ${env}`, async () => {
        const url = resolveUrl(service, env)
        const response = await fetch(url)
        expect(response.status).to.be.lessThan(500, `Got ${response.status} from ${url}`)
      })
    })
  })
})
