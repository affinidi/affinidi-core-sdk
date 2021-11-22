import { expect } from 'chai'
import { resolveUrl, Service } from '../../src'
import { envSetupUrls } from '../../src/urls'

describe('resolveUrl', () => {
  it('should throw error if provided service is not supported', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const service = 'non-supported-service' as Service
    const resolver = () => resolveUrl(service, 'dev')
    expect(resolver).to.throw(`Service ${service} is not supported by url-resolver`)
  })

  it('should use predefined urls or templates', () => {
    const url = resolveUrl(Service.SCHEMA_MANAGER, 'staging')
    expect(url).to.be.equal(`https://schema.stg.affinidi.com`)
  })

  it("should replace template's $service and $env variables with values", () => {
    const service = Service.METRICS
    const env = 'dev'
    const url = resolveUrl(service, env)
    expect(url).to.be.equal(`https://${service}.${env}.affinity-project.org`)
  })

  it("should override predefined urls or templates with user's url or template", () => {
    const service = Service.METRICS
    const url = resolveUrl(service, 'dev', 'https://{{service}}.example.com')
    expect(url).to.be.equal(`https://${service}.example.com`)
  })

  it('should override predefined urls or templates with env setup url', () => {
    const service = Service.METRICS
    envSetupUrls[service] = 'https://usage-stats.affinidi.xyz'
    const url = resolveUrl(service, 'dev')

    expect(url).to.be.equal('https://usage-stats.affinidi.xyz')

    envSetupUrls[service] = undefined
  })

  it('should return internal link', () => {
    process.env.AFFINIDI_INTERNAL_SERVICE = 'true'

    const service = Service.METRICS
    const url = resolveUrl(service, 'dev')
    expect(url).to.be.equal(`http://${service}.default.svc.cluster.local`)

    process.env.IS_AFFINIDI_INTERNAL_SERVICE = undefined
  })
})
