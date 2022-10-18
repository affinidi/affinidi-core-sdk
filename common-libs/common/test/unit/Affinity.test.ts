import { expect } from 'chai'
import nock from 'nock'
import sinon from 'sinon'
import { KeysService } from '../../src/services'
import { Affinity, DidResolver } from '../../src'
import { ecdsaCryptographyTools } from '../../src/shared/EcdsaCryptographyTools'
import {
  createUnsignedCredential,
  credential,
  credentialStatus,
  revocationListCredential,
  revocationListCredentialWithRevokedVC,
} from '../factory/credential'
import { generateTestDIDs } from '../factory/didFactory'
import { buildPresentation } from '../factory/presentation'
import { credentialsV1, revocationList2020V1 } from '../factory/w3'

const options = {
  registryUrl: 'https://affinity-registry.staging.affinity-project.org',
}

const jwtObject = {
  header: {
    typ: 'JWT',
    alg: 'ES256K',
  },
  payload: {
    data: 'data',
    exp: Date.now(),
    typ: 'type',
    jti: '',
    aud: '',
  },
}

const affinity = new Affinity(options, ecdsaCryptographyTools)

const jwt =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2Vu' +
  'Ijp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0e' +
  'S1wcm9qZWN0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic2VsZWN0ZWRDcmVkZW50aWFscy' +
  'I6W3sidHlwZSI6Ikt1ZG9zIiwicmVuZGVySW5mbyI6eyJsb2dvIjp7InVybCI6Imh0dHBzOi8' +
  'vc3RhdGljLmFmZmluaXR5LXByb2plY3Qub3JnL2xvZ28ucG5nIn0sImJhY2tncm91bmQiOnsi' +
  'dXJsIjoiaHR0cHM6Ly9zdGF0aWMuYWZmaW5pdHktcHJvamVjdC5vcmcvYmFja2dyb3VuZC5wb' +
  'mcifSwidGV4dCI6eyJjb2xvciI6IiNmZmZmZmYifSwicmVuZGVyQXMiOiJkb2N1bWVudCJ9LC' +
  'JtZXRhZGF0YSI6eyJhc3luY2hyb25vdXMiOmZhbHNlfX1dfSwidHlwIjoiY3JlZGVudGlhbE9' +
  'mZmVyUmVzcG9uc2UiLCJpYXQiOjE1NzkxNzIzODUxMDEsImV4cCI6MTU3OTE3NTk4NTEwMSwi' +
  'YXVkIjoiZGlkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmO' +
  'WY0NjJkMWZjOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjNiNzA4NDk5YWZmNDMiLCJpc3MiOi' +
  'JkaWQ6am9sbzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0Njl' +
  'jODIwMDdmZmYxM2UwNzY1NjQxI2tleXMtMSJ9.54953b6ae61625aa8be21a038707265efd9' +
  'b03db20ad810356029519188e92ae7bc61763f23c1d01dcb45ab1be130cbe2ea45890fbe3' +
  '5649a58786ee5bec8945'

let testDids: any

let password: string

let encryptedSeedJolo: string
let encryptedSeedElem: string

let didJolo: string
let joloDidDocument: { id: string }

let didElemShortForm: string
let elemDidDocument: { id: string }

let didElem: string

let joloSeed: string

describe('Affinity', () => {
  before(async () => {
    testDids = await generateTestDIDs()
    password = testDids.password

    encryptedSeedJolo = testDids.jolo.encryptedSeed
    joloSeed = testDids.jolo.seedHex
    didJolo = testDids.jolo.did
    joloDidDocument = testDids.jolo.didDocument

    encryptedSeedElem = testDids.elem.encryptedSeed
    didElem = testDids.elem.did
    didElemShortForm = didElem.substring(0, didElem.indexOf(';'))
    elemDidDocument = testDids.elem.didDocument
  })
  after(() => {
    nock.cleanAll()
  })

  beforeEach(() => {
    nock('https://affinity-registry.staging.affinity-project.org')
      .post('/api/v1/did/resolve-did', /jolo/gi)
      .times(Number.MAX_SAFE_INTEGER)
      .reply(200, { didDocument: joloDidDocument })

    nock('https://affinity-registry.staging.affinity-project.org')
      .post('/api/v1/did/resolve-did', /elem/gi)
      .times(Number.MAX_SAFE_INTEGER)
      .reply(200, { didDocument: elemDidDocument })

    nock('https://affinity-registry.staging.affinity-project.org')
      .post('/api/v1/did/resolve-did', /polygon/gi)
      .times(Number.MAX_SAFE_INTEGER)
      .reply(200, { didDocument: testDids.polygon.didDocument })

    nock('https://www.w3.org').get('/2018/credentials/v1').times(Number.MAX_SAFE_INTEGER).reply(200, credentialsV1)

    nock('https://w3id.org')
      .get('/vc-revocation-list-2020/v1')
      .times(Number.MAX_SAFE_INTEGER)
      .reply(200, revocationList2020V1)
  })

  it('#resolveDid', async () => {
    const didDocument = await affinity.resolveDid(didJolo)

    expect(didDocument).to.exist

    expect(didDocument.id).to.be.deep.equal(didJolo)
  })

  it('#resolveDid (elem)', async () => {
    const didDocument = await affinity.resolveDid(didElem)

    expect(didDocument).to.exist
    expect(didDocument.id).to.be.equal(didElemShortForm)
  })

  it('#resolveDid (polygon)', async () => {
    const didDocument = await affinity.resolveDid(testDids.polygon.did)

    expect(didDocument).to.exist
    expect(didDocument.id).to.be.equal(testDids.polygon.did)
  })

  it('.fromJwt', async () => {
    const object = Affinity.fromJwt(jwt)

    expect(object).to.exist
    expect(object.payload).to.exist
    expect(object.payload.typ).to.be.equal('credentialOfferResponse')
  })

  it('#signJWTObject (static method to be deprecated)', async () => {
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp: Date.now() + 1000 })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

    expect(signedJwtObject.signature).to.be.exist
  })

  it('#signJWTObject', async () => {
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp: Date.now() + 1000 })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

    expect(signedJwtObject.signature).to.be.exist
  })

  it('#signJWTObject (polygon)', async () => {
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp: Date.now() + 1000 })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await affinity.signJWTObject(jwtObject, testDids.polygon.encryptedSeed, password)

    expect(signedJwtObject.signature).to.be.exist
  })

  it('#encodeObjectToJWT', async () => {
    const exp = Date.now() + 2000
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

    const token = await Affinity.encodeObjectToJWT(signedJwtObject)
    expect(token).to.be.exist

    const object = Affinity.fromJwt(token)
    expect(object).to.exist
    expect(object.payload).to.exist
    expect(object.payload.exp).to.be.equal(exp)
  })

  it('#encodeObjectToJWT ()polygon', async () => {
    const exp = Date.now() + 2000
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, testDids.polygon.encryptedSeed, password)

    const token = await Affinity.encodeObjectToJWT(signedJwtObject)
    expect(token).to.be.exist

    const object = Affinity.fromJwt(token)
    expect(object).to.exist
    expect(object.payload).to.exist
    expect(object.payload.exp).to.be.equal(exp)
  })

  it('#validateJWT', async () => {
    const exp = Date.now() + 9000
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

    const token = await Affinity.encodeObjectToJWT(signedJwtObject)
    expect(token).to.be.exist

    let tokenValidationError

    try {
      await affinity.validateJWT(token)
    } catch (error) {
      tokenValidationError = error
    }

    expect(tokenValidationError).to.be.undefined
  })

  it('#validateJWT (polygon)', async () => {
    const exp = Date.now() + 9000
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, testDids.polygon.encryptedSeed, password)

    const token = await Affinity.encodeObjectToJWT(signedJwtObject)
    expect(token).to.be.exist

    let tokenValidationError

    try {
      await affinity.validateJWT(token)
    } catch (error) {
      tokenValidationError = error
    }

    expect(tokenValidationError).to.be.undefined
  })

  it('#validateJWT (When token expired)', async () => {
    const exp = Date.now() - 1000
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

    const token = await Affinity.encodeObjectToJWT(signedJwtObject)
    expect(token).to.be.exist

    let expiredTokenError

    try {
      await affinity.validateJWT(token)
    } catch (error) {
      expiredTokenError = error
    }

    expect(expiredTokenError).to.be.not.undefined
    expect(expiredTokenError.message).to.be.equal('Token expired')
  })

  it('#validateJWT (When initial token do not match)', async () => {
    const exp = Date.now() + 9000
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

    const token = await Affinity.encodeObjectToJWT(signedJwtObject)
    expect(token).to.be.exist

    let expiredTokenError

    try {
      await affinity.validateJWT(token, jwt)
    } catch (error) {
      expiredTokenError = error
    }

    expect(expiredTokenError).to.be.not.undefined
    expect(expiredTokenError.message).to.be.equal('The token nonce does not match the request')
  })

  it('#signCredential (jolo)', async () => {
    const createdCredential = await affinity.signCredential(credential, encryptedSeedJolo, password)

    const keyId = `${didJolo}#keys-1`
    expect(createdCredential).to.exist
    expect(createdCredential.proof).to.exist
    expect(createdCredential['@context']).to.exist
    expect(createdCredential.proof.verificationMethod).to.be.equal(keyId)
    expect(createdCredential.proof.jws).to.exist
  })

  it('#signCredential (elem)', async () => {
    const createdCredential = await affinity.signCredential(credential, encryptedSeedElem, password)

    const keyId = `${didElemShortForm}#primary`
    expect(createdCredential).to.exist
    expect(createdCredential.proof).to.exist
    expect(createdCredential['@context']).to.exist
    expect(createdCredential.proof.verificationMethod).to.be.equal(keyId)
    expect(createdCredential.proof.jws).to.exist
  })

  it('#signCredential (polygon)', async () => {
    const createdCredential = await affinity.signCredential(credential, testDids.polygon.encryptedSeed, password)

    const keyId = `${testDids.polygon.did}#key-1`
    expect(createdCredential).to.exist
    expect(createdCredential.proof).to.exist
    expect(createdCredential['@context']).to.exist
    expect(createdCredential.proof.verificationMethod).to.be.equal(keyId)
    expect(createdCredential.proof.jws).to.exist
  })

  it('#validateCredential (jolo)', async () => {
    const createdCredential = await affinity.signCredential(credential, encryptedSeedJolo, password)
    const result = await affinity.validateCredential(createdCredential)

    expect(result.result).to.be.true
  })

  it('#validateCredential (elem)', async () => {
    const createdCredential = await affinity.signCredential(credential, encryptedSeedElem, password)
    const result = await affinity.validateCredential(createdCredential)
    expect(result.result).to.be.true
  })

  it('#validateCredential (polygon)', async () => {
    const createdCredential = await affinity.signCredential(credential, testDids.polygon.encryptedSeed, password)
    const result = await affinity.validateCredential(createdCredential)
    expect(result.result).to.be.true
  })

  it("#validateCredential (elem) when holderKey is set and doesn't match", async () => {
    const createdCredential = await affinity.signCredential(credential, encryptedSeedElem, password)
    const result = await affinity.validateCredential(createdCredential, `${didJolo}#primary`)

    expect(result.result).to.be.false
  })

  it('#validateCredential (elem) when holderKey is set', async () => {
    const createdCredential = await affinity.signCredential(credential, encryptedSeedElem, password)
    const result = await affinity.validateCredential(createdCredential, `${credential.holder.id}#key`)

    expect(result.result).to.be.true
  })

  it("#validateCredential (polygon) when holderKey is set and doesn't match", async () => {
    const createdCredential = await affinity.signCredential(credential, testDids.polygon.encryptedSeed, password)
    const result = await affinity.validateCredential(createdCredential, `${didJolo}#primary`)

    expect(result.result).to.be.false
  })

  it('#validateCredential (polygon) when holderKey is set', async () => {
    const createdCredential = await affinity.signCredential(credential, testDids.polygon.encryptedSeed, password)
    const result = await affinity.validateCredential(createdCredential, `${credential.holder.id}#key`)

    expect(result.result).to.be.true
  })

  it('#signPresentation (elem)', async () => {
    const unsignedCredential = createUnsignedCredential(didElem)
    const createdCredential = await affinity.signCredential(unsignedCredential, encryptedSeedElem, password)
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], didElem),
      encryption: {
        seed: encryptedSeedElem,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const keyId = `${didElemShortForm}#primary`
    expect(createdPresentation).to.exist
    expect(createdPresentation.proof).to.exist
    expect(createdPresentation['@context']).to.exist
    expect(createdPresentation.proof.verificationMethod).to.be.equal(keyId)
    expect(createdPresentation.proof.jws).to.exist
  })

  it('#signPresentation (jolo)', async () => {
    const unsignedCredential = createUnsignedCredential(didJolo)
    const createdCredential = await affinity.signCredential(unsignedCredential, encryptedSeedJolo, password)
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], didElem),
      encryption: {
        seed: encryptedSeedJolo,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const keyId = `${didJolo}#keys-1`
    expect(createdPresentation).to.exist
    expect(createdPresentation.proof).to.exist
    expect(createdPresentation['@context']).to.exist
    expect(createdPresentation.proof.verificationMethod).to.be.equal(keyId)
    expect(createdPresentation.proof.jws).to.exist
  })

  it('#signPresentation (polygon)', async () => {
    const unsignedCredential = createUnsignedCredential(didElem)
    const createdCredential = await affinity.signCredential(
      unsignedCredential,
      testDids.polygon.encryptedSeed,
      password,
    )
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], testDids.polygon.did),
      encryption: {
        seed: testDids.polygon.encryptedSeed,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const keyId = `${testDids.polygon.did}#key-1`
    expect(createdPresentation).to.exist
    expect(createdPresentation.proof).to.exist
    expect(createdPresentation['@context']).to.exist
    expect(createdPresentation.proof.verificationMethod).to.be.equal(keyId)
    expect(createdPresentation.proof.jws).to.exist
  })

  it('#validatePresentation (elem) (new presentations)', async () => {
    const unsignedCredential = createUnsignedCredential(didElem)
    const createdCredential = await affinity.signCredential(unsignedCredential, encryptedSeedJolo, password)
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], didElem),
      encryption: {
        seed: encryptedSeedElem,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const result = await affinity.validatePresentation(createdPresentation)
    expect(result.result).to.be.true
  })

  it('#validatePresentation (polygon) (new presentations)', async () => {
    const unsignedCredential = createUnsignedCredential(testDids.polygon.did)
    const createdCredential = await affinity.signCredential(
      unsignedCredential,
      testDids.polygon.encryptedSeed,
      password,
    )
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], testDids.polygon.did),
      encryption: {
        seed: testDids.polygon.encryptedSeed,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const result = await affinity.validatePresentation(createdPresentation)
    expect(result.result).to.be.true
  })

  it('#validateCredential when credential is revokable (when not revoked)', async () => {
    nock('https://affinity-revocation.staging.affinity-project.org')
      .get('/api/v1/revocation/revocation-list-2020-credentials/1')
      .reply(200, revocationListCredential)

    const revokableCredential = Object.assign({}, credential, { credentialStatus })
    // eslint-disable-next-line
    // @ts-ignore
    revokableCredential['@context'].push('https://w3id.org/vc-revocation-list-2020/v1')
    const createdCredential = await affinity.signCredential(revokableCredential, encryptedSeedElem, password)
    const result = await affinity.validateCredential(createdCredential, `${credential.holder.id}#primary`)
    expect(result.result).to.be.true
  })

  it('#validateCredential when credential is revokable (polygon) (when not revoked)', async () => {
    nock('https://affinity-revocation.staging.affinity-project.org')
      .get('/api/v1/revocation/revocation-list-2020-credentials/1')
      .reply(200, revocationListCredential)

    const revokableCredential = Object.assign({}, credential, { credentialStatus })
    // eslint-disable-next-line
    // @ts-ignore
    revokableCredential['@context'].push('https://w3id.org/vc-revocation-list-2020/v1')
    const createdCredential = await affinity.signCredential(
      revokableCredential,
      testDids.polygon.encryptedSeed,
      password,
    )

    const result = await affinity.validateCredential(createdCredential, `${credential.holder.id}#key-1`)
    expect(result.result).to.be.true
  })

  it('#validatePresentation (jolo) (new presentations)', async () => {
    const unsignedCredential = createUnsignedCredential(didJolo)
    const createdCredential = await affinity.signCredential(unsignedCredential, encryptedSeedJolo, password)
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], didJolo),
      encryption: {
        seed: encryptedSeedJolo,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const result = await affinity.validatePresentation(createdPresentation)

    expect(result.result).to.be.true
  })

  it('#validatePresentation (polygon) (new presentations)', async () => {
    const unsignedCredential = createUnsignedCredential(testDids.polygon.did)
    console.dir({ unsignedCredential }, { depth: null })
    const createdCredential = await affinity.signCredential(
      unsignedCredential,
      testDids.polygon.encryptedSeed,
      password,
    )
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], testDids.polygon.did),
      encryption: {
        seed: testDids.polygon.encryptedSeed,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const result = await affinity.validatePresentation(createdPresentation)

    expect(result.result).to.be.true
  })

  it("#validatePresentation fails when the VP is not signed by the VC's holder", async () => {
    // In this case the ISSUER of the VC is the same as the signer of the VP.
    // But the holder of the issued VC is different than the signer of the VP.
    const createdCredential = await affinity.signCredential(credential, encryptedSeedElem, password)
    const createdPresentation = await affinity.signPresentation({
      vp: buildPresentation([createdCredential], didElem),
      encryption: {
        seed: encryptedSeedElem,
        key: password,
      },
      purpose: {
        challenge: 'challenge',
        domain: 'domain',
      },
    })

    const result = await affinity.validatePresentation(createdPresentation)
    expect(result.result).to.be.false
  })

  it('#validateCredential when credential is revokable (when revoked)', async () => {
    nock('https://affinity-revocation.staging.affinity-project.org')
      .get('/api/v1/revocation/revocation-list-2020-credentials/1')
      .reply(200, revocationListCredentialWithRevokedVC)

    const revokableCredential = Object.assign({}, credential, { credentialStatus })
    // eslint-disable-next-line
    // @ts-ignore
    revokableCredential['@context'].push('https://w3id.org/vc-revocation-list-2020/v1')

    const createdCredential = await affinity.signCredential(revokableCredential, encryptedSeedElem, password)
    const result = await affinity.validateCredential(createdCredential, `${credential.holder.id}#keys-1`)

    expect(result.result).to.be.false
  })

  it('#encryptSeed', async () => {
    const encryptedSeed = await Affinity.encryptSeed(joloSeed, password)

    expect(encryptedSeed).to.be.exist
  })

  it('#encryptSeed (+ check that decryption works as expected)', async () => {
    const encryptedSeed = await Affinity.encryptSeed(joloSeed, password)

    expect(encryptedSeed).to.be.exist
    const { seed: decryptedSeed } = KeysService.decryptSeed(encryptedSeed, password)
    expect(decryptedSeed.toString('hex')).to.be.equal(joloSeed)
  })

  describe('#resolveDid caching', () => {
    it('uses cache', async () => {
      const testDocument = { cache: 'test' }

      const mock = nock('https://affinity-registry.cachetest1.affinity-project.org')
        .post('/api/v1/did/resolve-did', /cache-test/gi)
        .times(1)
        .reply(200, { didDocument: testDocument })

      const affinity1 = new Affinity(
        { registryUrl: 'https://affinity-registry.cachetest1.affinity-project.org' },
        ecdsaCryptographyTools,
      )
      const result1 = await affinity1.resolveDid('cache-test')
      expect(result1).to.deep.equal(testDocument)
      const result2 = await affinity1.resolveDid('cache-test')
      expect(result2).to.deep.equal(testDocument)

      mock.done()
    })

    it('correctly handles different urls', async () => {
      const testDocument = { cache: 'test' }

      nock('https://affinity-registry.cachetest2.affinity-project.org')
        .post('/api/v1/did/resolve-did', /cache-test/gi)
        .times(1)
        .reply(200, { didDocument: testDocument })

      const affinity2 = new Affinity(
        { registryUrl: 'https://affinity-registry.cachetest2.affinity-project.org' },
        ecdsaCryptographyTools,
      )
      const result1 = await affinity2.resolveDid('cache-test1')
      expect(result1).to.deep.equal(testDocument)
      try {
        await affinity2.resolveDid('cache-test2')
        expect.fail('Second call should fail because DID is different and nock is only configured to respond once')
      } catch (err) {
        expect(err.message).to.contain('Nock: No match for request')
      }
    })

    it('correctly handles different service urls', async () => {
      const testDocument3 = { cache: 'test3' }
      const testDocument4 = { cache: 'test4' }

      nock('https://affinity-registry.cachetest3.affinity-project.org')
        .post('/api/v1/did/resolve-did', /cache-test/gi)
        .times(1)
        .reply(200, { didDocument: testDocument3 })

      nock('https://affinity-registry.cachetest4.affinity-project.org')
        .post('/api/v1/did/resolve-did', /cache-test/gi)
        .times(1)
        .reply(200, { didDocument: testDocument4 })

      const affinity3 = new Affinity(
        { registryUrl: 'https://affinity-registry.cachetest3.affinity-project.org' },
        ecdsaCryptographyTools,
      )
      const result3 = await affinity3.resolveDid('cache-test')
      expect(result3).to.deep.equal(testDocument3)

      const affinity4 = new Affinity(
        { registryUrl: 'https://affinity-registry.cachetest4.affinity-project.org' },
        ecdsaCryptographyTools,
      )
      const result4 = await affinity4.resolveDid('cache-test')
      expect(result4).to.deep.equal(testDocument4)
    })

    it('does not cache errors', async () => {
      const testDocument = { cache: 'test' }

      const affinity5 = new Affinity(
        { registryUrl: 'https://affinity-registry.cachetest5.affinity-project.org' },
        ecdsaCryptographyTools,
      )

      nock('https://affinity-registry.cachetest5.affinity-project.org')
        .post('/api/v1/did/resolve-did', /cache-test/gi)
        .times(1)
        .reply(500, { message: 'first call fail' })
      try {
        await affinity5.resolveDid('cache-test')
        expect.fail('should fail because nock is configured to return 500')
      } catch (error) {
        expect(error._originalError.message).to.equal('first call fail')
      }

      nock('https://affinity-registry.cachetest5.affinity-project.org')
        .post('/api/v1/did/resolve-did', /cache-test/gi)
        .times(1)
        .reply(200, { didDocument: testDocument })

      const result = await affinity5.resolveDid('cache-test')
      expect(result).to.deep.equal(testDocument)
    })
  })

  describe('#constructor', () => {
    it('should use options.didResolver if provided', async () => {
      const didResolver: DidResolver = {
        // @ts-ignore
        resolveDid: (did: string) => Promise.resolve({ id: did }),
      }

      const spyOnDidResolver = sinon.spy(didResolver, 'resolveDid')

      const affinity6 = new Affinity({ didResolver: didResolver }, ecdsaCryptographyTools)
      await affinity6.resolveDid(didElem)

      expect(spyOnDidResolver).to.have.been.calledOnce
    })
  })
})
