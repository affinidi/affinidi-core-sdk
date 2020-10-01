'use strict'

import { expect } from 'chai'
import DigestService from '../../../src/services/DigestService'

const tokenSignatureDigest =
  'e35eb6cf513540a7ebd4f3f07e472cf2764c9996a6c794' +
  '018cbd9cc6934aa03228d4c61e765d159cd4496775301438b331136b05029b5339305b33f1bad3efa5'

const tokenSignatureDigestForged =
  'e35eb6cf513540a7ebd4f3f07e472cf2764c9996a6c794' +
  '018cbd9cc6934aa03228d4c61e765d159cd4496775301438b331136b05029b5339305b33f1bad3efa5HelloToken'

import { didDocument } from '../../factory/didDocument'

const tokenObject = {
  header: {
    typ: 'JWT',
    alg: 'ES256K',
  },
  payload: {
    interactionToken: {
      credentialRequirements: [
        {
          type: ['Credential', 'ProfileCredential'],
        },
      ],
      callbackURL: 'https://api.dev.affinity-project.org',
    },
    typ: 'credentialRequest',
    iat: 1581062888594,
    exp: 1581066488594,
    jti: '416c47d70f79d7db',
    iss: 'did:jolo:0826b6e46b3df55c29f52b22221dac82f5968fc7f491a2ac474a3ad9cd80eecd#keys-1',
  },
  signature: tokenSignatureDigest,
}

const digestService = new DigestService()

describe('DigestService', () => {
  it('#getTokenDigest should return digest for token object', async () => {
    const { digest, signature } = digestService.getTokenDigest(tokenObject)

    expect(digest).to.exist
    expect(signature).to.exist

    expect(signature.toString('hex')).to.be.equal(tokenSignatureDigest)
  })

  it("#getTokenDigest returns digest and no signature is token's signature is invalid hex", async () => {
    const tokenObjectWithForgedSignature = Object.assign({}, tokenObject, { signature: tokenSignatureDigestForged })

    const { digest, signature } = digestService.getTokenDigest(tokenObjectWithForgedSignature)

    expect(digest).to.exist
    expect(signature).to.be.null
  })

  it('#getJsonLdDigest should return digest json-ld objects (DID, VC)', async () => {
    const { digest, signature } = await digestService.getJsonLdDigest(didDocument)

    expect(digest).to.exist
    expect(signature).to.exist
  })
})
