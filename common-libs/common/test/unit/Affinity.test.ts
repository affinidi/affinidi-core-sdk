import { expect } from 'chai'
import { buildVCV1Unsigned, buildVCV1Skeleton } from '@affinidi/vc-common'
import { VCSNamePersonV1, getVCNamePersonV1Context } from '@affinidi/vc-data'
import nock from 'nock'

import { KeysService } from '../../src/services'
import { Affinity } from '../../src'
import {
  credential,
  credentialStatus,
  revocationListCredential,
  revocationListCredentialWithRevokedVC,
} from '../factory/credential'
import { generateTestDIDs } from '../factory/didFactory'

import { signedCredential, signedCredentialWithLongFormVerificationMethod } from '../factory/signedCredential'
import { legacySignedCredential } from '../factory/legacySignedCredential'
import { buildPresentation } from '../factory/presentation'
import { signedPresentation } from '../factory/signedPresentation'

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

const affinity = new Affinity(options)

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

let testDids

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
      .reply(200, { didDocument: joloDidDocument })
    nock('https://affinity-registry.staging.affinity-project.org')
      .post('/api/v1/did/resolve-did', /elem/gi)
      .reply(200, { didDocument: elemDidDocument })
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

  it('.fromJwt', async () => {
    const object = Affinity.fromJwt(jwt)

    expect(object).to.exist
    expect(object.payload).to.exist
    expect(object.payload.typ).to.be.equal('credentialOfferResponse')
  })

  it('#signJWTObject', async () => {
    const extendedPayload = Object.assign({}, jwtObject.payload, { exp: Date.now() + 1000 })
    jwtObject.payload = extendedPayload
    const signedJwtObject = await Affinity.signJWTObject(jwtObject, encryptedSeedJolo, password)

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

  it('#signPresentation (elem)', async () => {
    const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSNamePersonV1>({
        id: 'claimId:63b5d11c0d1b5566',
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'NamePerson'],
            givenName: 'DenisUpdated',
            familyName: 'Popov',
          },
        },
        holder: {
          id: didElem,
        },
        type: 'NameCredentialPersonV1',
        context: getVCNamePersonV1Context(),
      }),
      issuanceDate: '2020-01-17T07:06:35.403Z',
      expirationDate: '2021-01-16T07:06:35.337Z',
    })
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
    const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSNamePersonV1>({
        id: 'claimId:63b5d11c0d1b5566',
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'NamePerson'],
            givenName: 'DenisUpdated',
            familyName: 'Popov',
          },
        },
        holder: {
          id: didJolo,
        },
        type: 'NameCredentialPersonV1',
        context: getVCNamePersonV1Context(),
      }),
      issuanceDate: '2020-01-17T07:06:35.403Z',
      expirationDate: '2021-01-16T07:06:35.337Z',
    })
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

  it('#validatePresentation (elem) (new presentations)', async () => {
    const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSNamePersonV1>({
        id: 'claimId:63b5d11c0d1b5566',
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'NamePerson'],
            givenName: 'DenisUpdated',
            familyName: 'Popov',
          },
        },
        holder: {
          id: didElem,
        },
        type: 'NameCredentialPersonV1',
        context: getVCNamePersonV1Context(),
      }),
      issuanceDate: '2020-01-17T07:06:35.403Z',
      expirationDate: '2021-01-16T07:06:35.337Z',
    })
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

  // Will not pass until affinity-registry is updated
  it.skip('#validateCredential when credential is revokable (when not revoked)', async () => {
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

  it('#validatePresentation (jolo) (new presentations)', async () => {
    const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSNamePersonV1>({
        id: 'claimId:63b5d11c0d1b5566',
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'NamePerson'],
            givenName: 'DenisUpdated',
            familyName: 'Popov',
          },
        },
        holder: {
          id: didJolo,
        },
        type: 'NameCredentialPersonV1',
        context: getVCNamePersonV1Context(),
      }),
      issuanceDate: '2020-01-17T07:06:35.403Z',
      expirationDate: '2021-01-16T07:06:35.337Z',
    })
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
})

describe('Validation Snapshots', () => {
  it('#validateCredential (already created/legacy creds)', async () => {
    const result = await affinity.validateCredential(legacySignedCredential)

    console.log(result.error)

    expect(result.result).to.be.true
  })

  it('#validateCredential (already created creds with longform DID)', async () => {
    const result = await affinity.validateCredential(signedCredentialWithLongFormVerificationMethod)

    expect(result.result).to.be.false
  })

  it('#validateCredential (already created/new creds)', async () => {
    const result = await affinity.validateCredential(signedCredential)

    expect(result.result).to.be.true
  })
  it('#validatePresentation (existing presentations)', async () => {
    const result = await affinity.validatePresentation(signedPresentation)

    if (result.result === false) {
      console.log(result.error)
    }

    expect(result.result).to.be.true
  })
})
