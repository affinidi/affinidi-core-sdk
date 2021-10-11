import { expect } from 'chai'

import { exampleDidAuthResponseToken } from '../../factory/tokens'
import { DidAuthResponseToken } from '../../../src/DidAuthService/DidAuthResponseToken'
import { LocalExpiringDidAuthResponseToken } from '../../../src/DidAuthService/LocalExpiringDidAuthResponseToken'

describe('LocalExpiringDidAuthResponseToken', () => {
  const didAuthResponseToken = DidAuthResponseToken.fromString(exampleDidAuthResponseToken)
  const didAuthRequestToken = didAuthResponseToken.requestToken
  const { DEFAULT_EXPIRY_BUFFER } = LocalExpiringDidAuthResponseToken
  const { createdAt, exp } = didAuthRequestToken
  // calculate how long the token would be valid for in total
  const totalValidityPeriodInMs = exp - createdAt

  describe('client time is behind the server', () => {
    it('should not expire before validInMs', () => {
      // request time is way before the server token creation time
      const tokenRequestTime = createdAt - totalValidityPeriodInMs
      const clientEndTime = tokenRequestTime + totalValidityPeriodInMs - DEFAULT_EXPIRY_BUFFER
      const validTimes = generateTimes(tokenRequestTime, clientEndTime)

      const localExpiringToken = LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
      )

      for (const validTime of validTimes) {
        expect(localExpiringToken.isExpiredAt(validTime)).to.be.false
      }
    })

    it('should expire if in expiry buffer', () => {
      // request time is way before the server token creation time
      const tokenRequestTime = createdAt - totalValidityPeriodInMs
      const expiredTime = tokenRequestTime + totalValidityPeriodInMs - DEFAULT_EXPIRY_BUFFER + 1

      const localExpiringToken = LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
      )

      expect(localExpiringToken.isExpiredAt(expiredTime + 1)).to.be.true
    })

    it('should expire if past validInMs', () => {
      // request time is way before the server token creation time
      const tokenRequestTime = createdAt - totalValidityPeriodInMs
      const clientEndTime = tokenRequestTime + totalValidityPeriodInMs + 1

      const localExpiringToken = LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
      )

      expect(localExpiringToken.isExpiredAt(clientEndTime)).to.be.true
    })
  })

  describe('client time is ahead the server', () => {
    it('should not expire before validInMs', () => {
      // request time is way past the server token exp time
      const tokenRequestTime = exp + totalValidityPeriodInMs
      const clientEndTime = tokenRequestTime + totalValidityPeriodInMs - DEFAULT_EXPIRY_BUFFER
      const validTimes = generateTimes(tokenRequestTime, clientEndTime)

      const localExpiringToken = LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
      )

      for (const validTime of validTimes) {
        expect(localExpiringToken.isExpiredAt(validTime)).to.be.false
      }
    })

    it('should expire if in expiry buffer', () => {
      // request time is way past the server token exp time
      const tokenRequestTime = exp + totalValidityPeriodInMs
      const expiredTime = tokenRequestTime + totalValidityPeriodInMs - DEFAULT_EXPIRY_BUFFER + 1

      const localExpiringToken = LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
      )

      expect(localExpiringToken.isExpiredAt(expiredTime + 1)).to.be.true
    })

    it('should expire if past validInMs', () => {
      // request time is way past the server token exp time
      const tokenRequestTime = exp + totalValidityPeriodInMs
      const clientEndTime = tokenRequestTime + totalValidityPeriodInMs + 1

      const localExpiringToken = LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
      )

      expect(localExpiringToken.isExpiredAt(clientEndTime)).to.be.true
    })
  })

  it('should fail if tried to initialize with invalid parameters', () => {
    const tokenRequestTime = 0

    const callback = () =>
      LocalExpiringDidAuthResponseToken.initialize(
        tokenRequestTime,
        didAuthResponseToken.toString(),
        Number.POSITIVE_INFINITY,
      )

    expect(callback).to.throw
  })
})

function generateTimes(startTime: number, endTime: number, stepMs: number = 1000): number[] {
  // include endTime for edge case check
  const times = [endTime, startTime]
  let curr = times[0] + stepMs

  while (curr < endTime) {
    times.push(curr)
    curr += stepMs
  }

  return times
}
