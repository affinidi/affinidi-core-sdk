import { expect } from 'chai'

import { JwtService } from '@affinidi/tools-common'
import { Env } from '@affinidi/url-resolver'
import AffinidiDidAuthService from './../../../src/DidAuthService/DidAuthService'
import { DEFAULT_REQUEST_TOKEN_VALID_IN_MS, DEFAULT_MAX_TOKEN_VALID_IN_MS } from '../../../src/shared/constants'
import { verifierEncryptedSeed, verifierEncryptionKey, verifierFullDid, verifierDid } from './../../factory/verifier'
import { holderEncryptedSeed, holderEncryptionKey, holderDid } from './../../factory/holder'
const env = {
  environment: <Env>'dev',
  accessApiKey: '66ca5670a5578937c25eab723374bfe41f153829e69fb87b39849b5118bcfece',
}

module.exports = function () {
  describe('AffinidiDidAuthService', () => {
    it('#createDidAuthRequest with default expiry', async () => {
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

      const { createdAt, exp } = actualVerifierTokenDecoded.payload
      expect(exp).to.equal(createdAt + DEFAULT_REQUEST_TOKEN_VALID_IN_MS)
    })

    it('#createDidAuthRequest with custom expiry', async () => {
      const affinidiDidAuthServiceOptions = {
        encryptedSeed: verifierEncryptedSeed,
        encryptionKey: verifierEncryptionKey,
      }
      const affinidiDidAuthService = new AffinidiDidAuthService(affinidiDidAuthServiceOptions)
      const expiresAt = 60 * 1000
      const actualVerifierToken = await affinidiDidAuthService.createDidAuthRequestToken(holderDid, expiresAt)
      const actualVerifierTokenDecoded = JwtService.fromJWT(actualVerifierToken)

      expect(actualVerifierTokenDecoded.payload.iss).to.equal(verifierFullDid)
      expect(actualVerifierTokenDecoded.payload.aud).to.equal(holderDid)
      expect(actualVerifierTokenDecoded.payload.exp).not.to.be.undefined
      expect(actualVerifierTokenDecoded.payload.createdAt).not.to.be.undefined

      const { createdAt, exp } = actualVerifierTokenDecoded.payload
      expect(exp).to.equal(createdAt + expiresAt)
    })

    it('#createDidAuthResponse with default expiry', async () => {
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
      expect(actualHolderTokenDecoded.payload.exp).not.to.be.undefined
      expect(actualHolderTokenDecoded.payload.createdAt).not.to.be.undefined

      const { createdAt, exp } = actualHolderTokenDecoded.payload
      expect(exp).to.equal(createdAt + DEFAULT_MAX_TOKEN_VALID_IN_MS)
    })

    it('#createDidAuthResponse with custom expiry', async () => {
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
      const maxTokenValidInMs = 60 * 1000
      const actualHolderToken = await holderDidAuthService.createDidAuthResponseToken(actualVerifierToken, {
        maxTokenValidInMs,
      })
      const actualHolderTokenDecoded = JwtService.fromJWT(actualHolderToken)

      expect(actualHolderTokenDecoded.payload.aud).not.to.equal('')
      expect(actualHolderTokenDecoded.payload.requestToken).to.equal(actualVerifierToken)
      expect(actualHolderTokenDecoded.payload.aud).to.equal(verifierDid)
      expect(actualHolderTokenDecoded.payload.exp).not.to.be.undefined
      expect(actualHolderTokenDecoded.payload.createdAt).not.to.be.undefined

      const { createdAt, exp } = actualHolderTokenDecoded.payload
      expect(exp).to.equal(createdAt + maxTokenValidInMs)
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