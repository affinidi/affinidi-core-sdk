import { expect } from 'chai'
import resolveUrl, { Services } from '../../src'

describe('resolveUrl', () => {
  it('should use default templates if no additional had been provided', () => {
    const url = resolveUrl(Services.METRICS, 'dev')
    expect(url).to.be.equal('https://affinity-metrics.dev.affinity-project.org')
  })

  it('should use additional template if it has been provided', () => {
    const url = resolveUrl(Services.METRICS, 'dev', 'https://{{service}}.{{env}}.example.com')
    expect(url).to.be.equal('https://affinity-metrics.dev.example.com')
  })

  it("should replace template's $service and $env variables with values", () => {
    const url = resolveUrl('SERVICE_NAME', 'ENV', 'https://{{service}}.{{env}}.example.com')
    expect(url).to.be.equal('https://SERVICE_NAME.ENV.example.com')
  })

  it('should throw error if template empty', () => {
    const getUrl = () => resolveUrl('not-existing-service', 'dev', '')
    expect(getUrl).to.throw('Url template can not be empty')
  })
})
