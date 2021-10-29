import { expect } from 'chai'
import { urlResolver, Service } from '../../src'

describe('UrlResolver', () => {
  describe('#resolve()', () => {
    it('should throw error if provided service is not supported', () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const service = 'non-supported-service' as Service
      const resolver = () => urlResolver.resolve(service, 'dev')
      expect(resolver).to.throw(`Service ${service} is not supported by url-resolver`)
    })

    it('should use predefined urls or templates', () => {
      const url = urlResolver.resolve(Service.SCHEMA_MANAGER, 'staging')
      expect(url).to.be.equal(`https://schema.stg.affinidi.com`)
    })

    it("should replace template's $service and $env variables with values", () => {
      const service = Service.METRICS
      const env = 'dev'
      const url = urlResolver.resolve(service, env)
      expect(url).to.be.equal(`https://${service}.${env}.affinity-project.org`)
    })
  })
})
