import nock from 'nock'
import { expect } from 'chai'

import { JwtService } from '@affinidi/tools-common'
import { Env, resolveUrl, Service } from '@affinidi/url-resolver'
import AffinidiDidAuthService from './../../../src/DidAuthService/DidAuthService'
import { mockVerifierElemDidDocument } from '../../factory/mockVerifierElemDidDocument'
import { mockHolderElemDidDocument } from '../../factory/mockHolderElemDidDocument'
import { verifierDid, verifierEncryptedSeed, verifierEncryptionKey, verifierFullDid } from '../../factory/verifier'
import { holderDid, holderEncryptedSeed, holderEncryptionKey, holderFullDid } from '../../factory/holder'
import DidAuthServerService from '../../../src/DidAuthService/DidAuthServerService'
import Signer from '../../../src/shared/Signer'
import { Affinidi, KeysService, LocalKeyVault } from '@affinidi/common'
import DidAuthClientService from '../../../src/DidAuthService/DidAuthClientService'
import { DEFAULT_REQUEST_TOKEN_VALID_IN_MS } from 'src/shared/constants'
import { CreateResponseTokenOptions } from 'src/shared/types'

const env = {
  environment: <Env>'dev',
  accessApiKey: 'mockAccessApiKeyToAffinidiRegistry1',
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createServerService(environment: Env, accessApiKey: string): DidAuthServerService {
  const signerOptions = {
    did: verifierFullDid,
    keyId: `${verifierDid}#primary`,
    keyVault: new LocalKeyVault(new KeysService(verifierEncryptedSeed, verifierEncryptionKey)),
  }

  const verifierSigner = new Signer(signerOptions)

  const affinidiOptions = {
    registryUrl: resolveUrl(Service.REGISTRY, environment),
    apiKey: accessApiKey,
  }
  const affinidi = new Affinidi(affinidiOptions, null as any)
  return new DidAuthServerService(verifierFullDid, verifierSigner, affinidi)
}

function createClientService(): DidAuthClientService {
  const signerOptions = {
    did: holderFullDid,
    keyId: `${holderDid}#primary`,
    keyVault: new LocalKeyVault(new KeysService(holderEncryptedSeed, holderEncryptionKey)),
  }

  const clientSigner = new Signer(signerOptions)

  return new DidAuthClientService(clientSigner)
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

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockVerifierElemDidDocument)

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
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

    const options: CreateResponseTokenOptions = {
      exp: Date.now() + DEFAULT_REQUEST_TOKEN_VALID_IN_MS
    }

    const didAuthResponseToken = await holderDidAuthService.createDidAuthResponseToken(didAuthRequestToken, options)

    const result = await verifierDidAuthService.verifyDidAuthResponseToken(didAuthResponseToken, verifierOptions)

    expect(result).to.equal(true)
    nock.cleanAll()
  })

  it('#verifyDidAuthResponse (new way)', async () => {
    const { environment, accessApiKey } = env

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockVerifierElemDidDocument)

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockHolderElemDidDocument)

    const clientService = createClientService()
    const serverService = createServerService(environment, accessApiKey)

    const didAuthRequestToken = await serverService.createDidAuthRequestToken(holderDid)

    const options: CreateResponseTokenOptions = {
      exp: Date.now() + DEFAULT_REQUEST_TOKEN_VALID_IN_MS
    }

    const didAuthResponseToken = await clientService.createDidAuthResponseToken(didAuthRequestToken, options)

    const result = await serverService.verifyDidAuthResponseToken(didAuthResponseToken)

    expect(result).to.equal(true)
    nock.cleanAll()
  })

  it('#verifyDidAuthResponse - `didAuthResponseToken` without `requestToken` in jwt `payload` should throw error', async () => {
    const { environment, accessApiKey } = env

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockVerifierElemDidDocument)

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
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

  it('#verifyDidAuthResponse -> invalid expiration for didAuthResponseToken ', async () => {
    const { environment, accessApiKey } = env

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockVerifierElemDidDocument)

    nock(`https://affinity-registry.apse1.${environment}.affinidi.io`)
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, mockHolderElemDidDocument)

    const clientService = createClientService()
    const serverService = createServerService(environment, accessApiKey)

    const didAuthRequestToken = await serverService.createDidAuthRequestToken(holderDid)

    const options: CreateResponseTokenOptions = undefined

    const didAuthResponseToken = await clientService.createDidAuthResponseToken(didAuthRequestToken, options)

    let invalidExpirationError
    try {
      await serverService.verifyDidAuthResponseToken(didAuthResponseToken)
    } catch (error) {
      invalidExpirationError = error
    }
    
    expect(invalidExpirationError).to.be.undefined
    expect(invalidExpirationError.message).to.be.equal('Token expired or invalid expiration')
    nock.cleanAll()
  })
})
