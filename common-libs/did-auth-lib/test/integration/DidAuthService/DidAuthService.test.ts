import { expect } from 'chai'

import { JwtService } from '@affinidi/tools-common'
import { Env } from '@affinidi/url-resolver'
import AffinidiDidAuthService from './../../../src/DidAuthService/DidAuthService'
import { verifierEncryptedSeed, verifierEncryptionKey, verifierFullDid, verifierDid } from '../../factory/verifier'
import { holderEncryptedSeed, holderEncryptionKey, holderDid } from '../../factory/holder'
const { TEST_SECRETS } = process.env
const { DEV_API_KEY_HASH } = JSON.parse(TEST_SECRETS)
const env = {
  environment: <Env>'dev',
  accessApiKey: DEV_API_KEY_HASH,
}

module.exports = function () {
  describe('AffinidiDidAuthService', () => {
    it('#createDidAuthRequest', async () => {
      const affinidiDidAuthServiceOptions = {
        encryptedSeed: verifierEncryptedSeed,
        encryptionKey: verifierEncryptionKey,
      }
      const affinidiDidAuthService = new AffinidiDidAuthService(affinidiDidAuthServiceOptions)
      const actualVerifierToken = await affinidiDidAuthService.createDidAuthRequestToken(holderDid)
      const actualVerifierTokenDecoded = JwtService.fromJWT(actualVerifierToken)

      expect(actualVerifierTokenDecoded.payload.iss).to.equal(verifierFullDid)
      expect(actualVerifierTokenDecoded.payload.aud).to.equal(holderDid)
      expect(actualVerifierTokenDecoded.payload.exp).not.to.be.undefined
      expect(actualVerifierTokenDecoded.payload.createdAt).not.to.be.undefined
    })

    it('#createDidAuthResponse', async () => {
      const verifierDidAuthServiceOptions = {
        encryptedSeed: verifierEncryptedSeed,
        encryptionKey: verifierEncryptionKey,
      }
      const verifierDidAuthService = new AffinidiDidAuthService(verifierDidAuthServiceOptions)
      const actualVerifierToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid)

      const holderDidAuthServiceOptions = {
        encryptedSeed: holderEncryptedSeed,
        encryptionKey: holderEncryptionKey,
      }
      const holderDidAuthService = new AffinidiDidAuthService(holderDidAuthServiceOptions)
      const actualHolderToken = await holderDidAuthService.createDidAuthResponseToken(actualVerifierToken)
      const actualHolderTokenDecoded = JwtService.fromJWT(actualHolderToken)

      expect(actualHolderTokenDecoded.payload.aud).not.to.equal('')
      expect(actualHolderTokenDecoded.payload.requestToken).to.equal(actualVerifierToken)
      expect(actualHolderTokenDecoded.payload.aud).to.equal(verifierDid)
      expect(actualHolderTokenDecoded.payload.exp).to.be.undefined
    })

    it('#verifyDidAuthResponse', async () => {
      const { environment, accessApiKey } = env

      const verifierDidAuthServiceOptions = {
        encryptedSeed: verifierEncryptedSeed,
        encryptionKey: verifierEncryptionKey,
      }

      const holderDidAuthServiceOptions = {
        encryptedSeed: holderEncryptedSeed,
        encryptionKey: holderEncryptionKey,
      }

      const verifierOptions = {
        environment,
        accessApiKey,
      }

      const holderDidAuthService = new AffinidiDidAuthService(holderDidAuthServiceOptions)
      const verifierDidAuthService = new AffinidiDidAuthService(verifierDidAuthServiceOptions)

      const didAuthRequestToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid)

      const didAuthResponseToken = await holderDidAuthService.createDidAuthResponseToken(didAuthRequestToken)

      const result = await verifierDidAuthService.verifyDidAuthResponseToken(didAuthResponseToken, verifierOptions)

      expect(result).to.equal(true)
    })
  })
}
