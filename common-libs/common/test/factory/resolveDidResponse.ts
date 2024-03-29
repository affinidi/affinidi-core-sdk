export const did = 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630'
export const did1 = 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5631'
export const did2 = 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5632'

export const resolvedDidDocument = {
  '@context': [
    {
      id: '@id',
      type: '@type',
      dc: 'http://purl.org/dc/terms/',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      schema: 'http://schema.org/',
      sec: 'https://w3id.org/security#',
      didv: 'https://w3id.org/did#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      AuthenticationSuite: 'sec:AuthenticationSuite',
      CryptographicKey: 'sec:Key',
      LinkedDataSignature2016: 'sec:LinkedDataSignature2016',
      authentication: 'sec:authenticationMethod',
      created: {
        '@id': 'dc:created',
        '@type': 'xsd:dateTime',
      },
      creator: {
        '@id': 'dc:creator',
        '@type': '@id',
      },
      digestAlgorithm: 'sec:digestAlgorithm',
      digestValue: 'sec:digestValue',
      domain: 'sec:domain',
      entity: 'sec:entity',
      expires: {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime',
      },
      name: 'schema:name',
      nonce: 'sec:nonce',
      normalizationAlgorithm: 'sec:normalizationAlgorithm',
      owner: {
        '@id': 'sec:owner',
        '@type': '@id',
      },
      privateKey: {
        '@id': 'sec:privateKey',
        '@type': '@id',
      },
      proof: 'sec:proof',
      proofAlgorithm: 'sec:proofAlgorithm',
      proofType: 'sec:proofType',
      proofValue: 'sec:proofValue',
      publicKey: {
        '@id': 'sec:publicKey',
        '@type': '@id',
        '@container': '@set',
      },
      publicKeyHex: 'sec:publicKeyHex',
      requiredProof: 'sec:requiredProof',
      revoked: {
        '@id': 'sec:revoked',
        '@type': 'xsd:dateTime',
      },
      signature: 'sec:signature',
      signatureAlgorithm: 'sec:signatureAlgorithm',
      signatureValue: 'sec:signatureValue',
    },
  ],
  id: 'did:jolo:569d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e',
  created: '2020-01-23T01:54:44.337Z',
  authentication: ['Secp256k1SignatureAuthentication2018'],
  proof: {
    type: 'EcdsaKoblitzSignature2016',
    created: '2020-01-23T01:54:44.337Z',
    creator: 'did:jolo:569d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e#keys-1',
    nonce: '8cee254c49208dda',
    signatureValue:
      '841927eaff90ed0f1f814d1caa87a68e14bb1823afb53d1d37cb7a249c718abc0b357518d8bdfda8ada019bb968ad325b3c5f0d9857d6492e5ac10babe341d0f',
  },
  publicKey: [
    {
      id: 'did:jolo:569d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e#keys-1',
      type: 'Secp256k1VerificationKey2018',
      owner: 'did:jolo:569d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e',
      publicKeyHex: '038a0788f938508f3f0479dcd7f291a2a0c39928641ff88dd621997f26d42e4658',
    },
  ],
}

export const response = {
  body: {
    requestBody: {
      did: did,
    },
    responseBody: {
      didDocument: resolvedDidDocument,
    },
  },
  status: 200,
}
