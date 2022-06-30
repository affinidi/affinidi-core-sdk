import { expect } from 'chai'
import { getOptionsFromEnvironment } from '../../../src/shared/getOptionsFromEnvironment'

describe.only('getOptionsFromEnvironment', () => {
  const apiKey = '12f7b7d9-85d3-43a6-b8ea-4b80bb3fc689'
  it('should accept custom cognito settings', () => {
    const customUserPool = 'userpool_id'
    const customClientId = 'clientid'
    const region = 'test-region'
    const resultOptions = getOptionsFromEnvironment({
      env: 'prod',
      apiKey,
      userPoolId: customUserPool,
      clientId: customClientId,
      region,
    })
    expect(resultOptions.basicOptions.clientId).to.equal(customClientId)
    expect(resultOptions.basicOptions.userPoolId).to.equal(customUserPool)
    expect(resultOptions.region).to.equal(region)
  })

  it('should provide default cognito settings', () => {
    const resultOptions = getOptionsFromEnvironment({
      env: 'prod',
      apiKey,
    })
    expect(resultOptions.basicOptions.clientId).to.exist
    expect(resultOptions.basicOptions.userPoolId).to.exist
    expect(resultOptions.region).to.exist
  })

  it('should accept queryBloomVault', () => {
    const queryBloomVault = false
    const resultOptions = getOptionsFromEnvironment({
      env: 'prod',
      apiKey,
      queryBloomVault,
    })
    expect(resultOptions.otherOptions.queryBloomVault).to.equal(queryBloomVault)
  })
})
