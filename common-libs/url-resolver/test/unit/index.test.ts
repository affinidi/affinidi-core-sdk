import { expect } from 'chai'
import { resolveUrl, Service } from '../../src'

describe('resolveUrl', () => {
  it('should throw error if provided service is not supported', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const service = 'non-supported-service' as Service
    const resolver = () => resolveUrl(service, 'dev')
    expect(resolver).to.throw(`Service ${service} is not supported by url-resolver`)
  })

  it('should use predefined or default templates if no additional has been provided', () => {
    const service = Service.METRICS
    const env = 'dev'
    const url = resolveUrl(service, env)
    expect(url).to.be.equal(`https://${service}.${env}.affinity-project.org`)
  })

  it('should use additional template if it has been provided', () => {
    const service = Service.METRICS
    const url = resolveUrl(service, 'dev', 'https://{{service}}.example.com')
    expect(url).to.be.equal(`https://${service}.example.com`)
  })

  it("should replace template's $service and $env variables with values", () => {
    const service = Service.METRICS
    const env = 'dev'
    const url = resolveUrl(service, env, 'https://{{service}}.{{env}}.example.com')
    expect(url).to.be.equal(`https://${service}.${env}.example.com`)
  })

  it('should work with defined and undefined env variables', () => {
    const service = Service.METRICS
    const env = 'prod'
    let url = resolveUrl(service, env, process.env.METRICS_URL)
    expect(url).to.be.equal(`https://${service}.${env}.affinity-project.org`)

    process.env.METRICS_URL = 'https://metrics.affinidi.com'

    url = resolveUrl(service, env, process.env.METRICS_URL)
    expect(url).to.be.equal('https://metrics.affinidi.com')

    delete process.env.METRICS_URL
  })
})
