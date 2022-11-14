import { expect } from 'chai'
import sinon from 'sinon'
import { TrueCallerService } from '../../src'
import { generateTrueCallerToken, testPayload } from '../helpers/generateTrueCallerToken'

const token = generateTrueCallerToken()

describe.only('Truecaller service', () => {
  it('should successfully verify `Truecaller` token', async () => {
    const trucallerService = new TrueCallerService()

    sinon.stub(TrueCallerService.prototype, 'fetchTrueCallerPublicKey').resolves({
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
})
