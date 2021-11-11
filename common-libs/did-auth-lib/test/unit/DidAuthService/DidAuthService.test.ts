import nock from 'nock'
import { expect } from 'chai'

import { JwtService } from '@affinidi/tools-common'
import { Env } from '@affinidi/url-resolver'
import AffinidiDidAuthService from './../../../src/DidAuthService/DidAuthService'
import { mockVerifierElemDidDocument } from './../../factory/mockVerifierElemDidDocument'
import { mockHolderElemDidDocument } from './../../factory/mockHolderElemDidDocument'
import { verifierDid, verifierEncryptedSeed, verifierEncryptionKey, verifierFullDid } from './../../factory/verifier'
import { holderDid, holderEncryptedSeed, holderEncryptionKey } from './../../factory/holder'

const env = {
  environment: <Env>'dev',
  accessApiKey: 'mockAccessApiKeyToAffinidiRegistry1',
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
  })

  describe('#createDidAuthResponse', () => {
    const verifierDidAuthServiceOptions = {
      encryptedSeed: verifierEncryptedSeed,
      encryptionKey: verifierEncryptionKey,
    }
    const holderDidAuthServiceOptions = { encryptedSeed: holderEncryptedSeed, encryptionKey: holderEncryptionKey }
    const verifierDidAuthService = new AffinidiDidAuthService(verifierDidAuthServiceOptions)
    const holderDidAuthService = new AffinidiDidAuthService(holderDidAuthServiceOptions)

    it('should sign token', async () => {
      const actualVerifierToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid)

      const actualHolderToken = await holderDidAuthService.createDidAuthResponseToken(actualVerifierToken)
      const actualHolderTokenDecoded = JwtService.fromJWT(actualHolderToken)

      expect(actualHolderTokenDecoded.payload.aud).not.to.equal('')
      expect(actualHolderTokenDecoded.payload.requestToken).to.equal(actualVerifierToken)
      expect(actualHolderTokenDecoded.payload.aud).to.equal(verifierDid)
    })

    it('should give error if validity is longer than default', async () => {
      const expiresAt = Number.POSITIVE_INFINITY
      const actualVerifierToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid, expiresAt)

      let error: Error

      try {
        await holderDidAuthService.createDidAuthResponseToken(actualVerifierToken)
      } catch (err) {
        error = err
      }

      expect(error).not.to.be.undefined
      expect(error.message).to.equal('request token can not be valid more than max token validity period of 43200000ms')
    })

    it('should give error if validity is longer than given parameter', async () => {
      const maxTokenValidInMs = 10
      const expiresAt = Date.now() + maxTokenValidInMs * 100
      const actualVerifierToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid, expiresAt)

      let error: Error

      try {
        await holderDidAuthService.createDidAuthResponseToken(actualVerifierToken, { maxTokenValidInMs })
      } catch (err) {
        error = err
      }

      expect(error).not.to.be.undefined
      expect(error.message).to.equal('request token can not be valid more than max token validity period of 10ms')
    })
  })

  it('#verifyDidAuthResponse', async () => {
    const { environment, accessApiKey } = env

    nock(`https://affinity-registry.${environment}.affinity-project.org`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockVerifierElemDidDocument)

    nock(`https://affinity-registry.${environment}.affinity-project.org`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockHolderElemDidDocument)

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
    nock.cleanAll()
  })

  it('#verifyDidAuthResponse - `didAuthResponseToken` without `requestToken` in jwt `payload` should throw error', async () => {
    const { environment, accessApiKey } = env

    nock(`https://affinity-registry.${environment}.affinity-project.org`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockVerifierElemDidDocument)

    nock(`https://affinity-registry.${environment}.affinity-project.org`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockHolderElemDidDocument)

    const verifierDidAuthServiceOptions = {
      encryptedSeed: verifierEncryptedSeed,
      encryptionKey: verifierEncryptionKey,
    }

    const verifierOptions = {
      environment,
      accessApiKey,
    }

    const verifierDidAuthService = new AffinidiDidAuthService(verifierDidAuthServiceOptions)

    const wrongDidAuthResponseToken =
      'eyJraWQiOiIrN2NjazN5cGRCVzNVY29Ma2ZLQndlak16Y2ZUaTNaSXdvQTIrVEhGK2NRPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzMDgyMzE2OS04MjY3LTQ5NTQtOWMxZC04OWRlZjI5NjJkMGEiLCJldmVudF9pZCI6IjlmZmQ3MGEyLWU3MmUtNDIyZi1iNDg2LWUxNzgzMTRlNmI3NCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MjgxNDc5MTYsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9PZzB3ZXVsU2ciLCJleHAiOjE2MjgxNTE1MTYsImlhdCI6MTYyODE0NzkxNiwianRpIjoiYTljMTNlMzItYmVjYi00Mjk1LTg3MzMtOGIwM2UwMjFlYzU2IiwiY2xpZW50X2lkIjoiNGRzNzU2aTlqaTU0dGFnYWo4YXM5MDQxcWMiLCJ1c2VybmFtZSI6ImJic19pc3N1ZXIifQ.f3Jos0yRp_b4v7O3dGI76S7G6KLSAYZd1G-QfUeWl6yopLf0D22N_niib4AsXDuIDrx9C3npiakob01rBx4oF3mVUPnsjADJWIkizuAO39Nl9IeChGrKgu7joh7MAZ_yzQvxM9r4U2GIpGzdwh0i9QQ6A6eCEwbgT0zI0b7vATQorHtPsnnhl1Qz-Dq-d5YYAFCA-hP_GNROhgbgLUDZl8_pze-puODhGYITKYwmwGdJyKbP0GbvHlfC0u2d97UEsIBrfAkoX1yJCTa7RQgWMF-mtmHlfzGScPVUss7u50ClFXzF1IvOEwjUzW81M1IBWLdiOa9eDwIt5onyM76lTA'

    try {
      await verifierDidAuthService.verifyDidAuthResponseToken(wrongDidAuthResponseToken, verifierOptions)
    } catch (err) {
      expect(err.message).to.equal('Response does not contain request token')
    }

    nock.cleanAll()
  })

  it('#isTokenExpired - not expired', async () => {
    const verifierDidAuthServiceOptions = {
      encryptedSeed: verifierEncryptedSeed,
      encryptionKey: verifierEncryptionKey,
    }
    const verifierDidAuthService = new AffinidiDidAuthService(verifierDidAuthServiceOptions)
    const requestToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid)
    const token = requestToken
    const holderDidAuthServiceOptions = {
      encryptedSeed: holderEncryptedSeed,
      encryptionKey: holderEncryptionKey,
    }
    const holderDidAuthService = new AffinidiDidAuthService(holderDidAuthServiceOptions)
    const isTokenExpired = holderDidAuthService.isTokenExpired(token)

    expect(isTokenExpired).to.equal(false)
  })

  it('#isTokenExpired - expired', async () => {
    const verifierDidAuthServiceOptions = {
      encryptedSeed: verifierEncryptedSeed,
      encryptionKey: verifierEncryptionKey,
    }
    const verifierDidAuthService = new AffinidiDidAuthService(verifierDidAuthServiceOptions)
    const expirationDate = Date.now() + 100
    const requestToken = await verifierDidAuthService.createDidAuthRequestToken(holderDid, expirationDate)
    const token = requestToken
    const holderDidAuthServiceOptions = {
      encryptedSeed: holderEncryptedSeed,
      encryptionKey: holderEncryptionKey,
    }
    const holderDidAuthService = new AffinidiDidAuthService(holderDidAuthServiceOptions)

    await sleep(300)

    const isTokenExpired = holderDidAuthService.isTokenExpired(token)

    expect(isTokenExpired).to.equal(true)
  })

  it('#isTokenExpired - throws on invalid token', async () => {
    const token = 'invalidJWTString'
    const holderDidAuthServiceOptions = {
      encryptedSeed: holderEncryptedSeed,
      encryptionKey: holderEncryptionKey,
    }
    const holderDidAuthService = new AffinidiDidAuthService(holderDidAuthServiceOptions)

    expect(() => holderDidAuthService.isTokenExpired(token)).to.throw()
  })
})
