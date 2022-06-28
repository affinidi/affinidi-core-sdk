import { expect } from 'chai'
import { getOptionsFromEnvironment } from '../../../src/shared/getOptionsFromEnvironment'

describe('getOptionsFromEnvironment', () => {
  it('should accept custom cognito settings', () => {
    const customUserPool = 'userpool_id'
    const customClientId = 'clientid'
    const resultOptions = getOptionsFromEnvironment({
      env: 'prod',
      userPoolId: customUserPool,
      clientId: customClientId,
    })
    expect(resultOptions.basicOptions.clientId).to.equal(customClientId)
    expect(resultOptions.basicOptions.userPoolId).to.equal(customUserPool)
  })

  it('should provide default cognito settings', () => {
    const resultOptions = getOptionsFromEnvironment({
      env: 'prod',
    })
    expect(resultOptions.basicOptions.clientId).to.exist
    expect(resultOptions.basicOptions.userPoolId).to.exist
  })

  it('should accept queryBloomVault', () => {
    const queryBloomVault = false
    const resultOptions = getOptionsFromEnvironment({
      env: 'prod',
      queryBloomVault,
    })
    expect(resultOptions.otherOptions.queryBloomVault).to.equal(queryBloomVault)
  })
})
