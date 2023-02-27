import { expect } from 'chai'
import sinon from 'sinon'
import { TrueCallerService } from '../../src'
import { generateTrueCallerToken, testPayload } from '../helpers/generateTrueCallerToken'
import { TrueCallerPublicKeyManager } from '../../src/TrueCallerPublicKeyManager'

const token = generateTrueCallerToken()

describe('Truecaller service', () => {
  it('should successfully verify `Truecaller` token', async () => {
    const trucallerService = new TrueCallerService()

    sinon.stub(TrueCallerPublicKeyManager.prototype, 'getKey').resolves({
      keyType: 'RSA',
      key: process.env.TEST_PUBLICKEY_TRUE_CALLER,
    })
    const verificationResult = await trucallerService.verifyProfile(token)
    expect(verificationResult).to.be.true
  })

  it('should parse payload of `Truecaller` profile/token', () => {
    const trucallerService = new TrueCallerService()

    const { timeStamp, verifier, phoneNumber } = trucallerService.parsePayloadProfileTrueCaller(token)

    expect(phoneNumber).to.be.eq(testPayload.phoneNumber)
    expect(timeStamp).to.be.eq(testPayload.requestTime)
    expect(verifier).to.be.eq(testPayload.verifier)
  })

  it('should parse payload with international symbols of `Truecaller` profile/token', () => {
    const payload = {
      ...testPayload,
      firstName: 'को',
      lastName: 'ब्रा',
    }
    const token = generateTrueCallerToken(payload)
    const trucallerService = new TrueCallerService()

    const { timeStamp, verifier, phoneNumber } = trucallerService.parsePayloadProfileTrueCaller(token)

    expect(phoneNumber).to.be.eq(payload.phoneNumber)
    expect(timeStamp).to.be.eq(payload.requestTime)
    expect(verifier).to.be.eq(payload.verifier)
  })
})
