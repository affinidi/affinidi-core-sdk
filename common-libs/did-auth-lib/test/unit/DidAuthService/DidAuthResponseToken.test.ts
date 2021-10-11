import { expect } from 'chai'

import { DidAuthResponseToken } from '../../../src/DidAuthService/DidAuthResponseToken'
import {
  exampleDidAuthRequestToken,
  exampleDidAuthResponseToken,
  exampleDidAuthResponseTokenWithoutRequestToken,
} from '../../factory/tokens'

describe('DidAuthResponseToken', () => {
  it('should parse correctly', () => {
    const didAuthResponseToken = DidAuthResponseToken.fromString(exampleDidAuthResponseToken)

    expect(didAuthResponseToken.requestToken.toString()).to.equal(exampleDidAuthRequestToken)
    expect(didAuthResponseToken.toString()).to.equal(exampleDidAuthResponseToken)
  })

  it('should give error without request token', () => {
    const callback = () => DidAuthResponseToken.fromString(exampleDidAuthResponseTokenWithoutRequestToken)

    expect(callback).to.throw
  })

  it('should give error with invalid token', () => {
    const invalidToken = 'invalid-token'

    const callback = () => DidAuthResponseToken.fromString(invalidToken)

    expect(callback).to.throw
  })
})
