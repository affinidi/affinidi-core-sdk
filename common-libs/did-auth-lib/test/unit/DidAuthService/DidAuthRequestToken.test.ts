import { expect } from 'chai'

import { DidAuthRequestToken } from '../../../src/DidAuthService/DidAuthRequestToken'
import { exampleDidAuthRequestToken, exampleDidAuthRequestTokenWithoutExp } from '../../factory/tokens'

describe('DidAuthRequestToken', () => {
  it('should parse token with exp time', () => {
    const didAuthRequestToken = DidAuthRequestToken.fromString(exampleDidAuthRequestToken)

    expect(didAuthRequestToken.iss).to.equal('did:elem:EiDSNNG824H3F7CfSfhDuoxDm98AgjwrvENdSwmmWdJHFA')
    expect(didAuthRequestToken.createdAt).to.equal(1629288970685)
    expect(didAuthRequestToken.exp).to.equal(1629289030685)
    expect(didAuthRequestToken.toString()).to.equal(exampleDidAuthRequestToken)
  })

  it('should parse token without exp time', () => {
    const didAuthRequestToken = DidAuthRequestToken.fromString(exampleDidAuthRequestTokenWithoutExp)

    expect(didAuthRequestToken.iss).to.equal('did:elem:EiDSNNG824H3F7CfSfhDuoxDm98AgjwrvENdSwmmWdJHFA')
    expect(didAuthRequestToken.createdAt).to.equal(1629289592908)
    expect(didAuthRequestToken.exp).to.be.undefined
    expect(didAuthRequestToken.toString()).to.equal(exampleDidAuthRequestTokenWithoutExp)
  })

  it('should give error with invalid token', () => {
    const invalidToken = 'invalid-token'

    const callback = () => DidAuthRequestToken.fromString(invalidToken)

    expect(callback).to.throw
  })
})
