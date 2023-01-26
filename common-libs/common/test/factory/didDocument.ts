export const didDocument = {
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
  authentication: {
    type: 'Secp256k1SignatureAuthentication2018',
    publicKey: ['did:jolo:569d3f3c3fb5f43568a6fd615f1e09dee169bf98b201813d7f998e241be7ff0e#keys-1'],
  },
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

export const webDidDocument = {
  id: 'did:web:did.actor:alice',
  '@context': 'https://w3id.org/security/v2',
  publicKey: [
    {
      id: 'did:web:did.actor:alice#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '034837024ba864c75fb722b856534093b5ec76d21128579c886a001fd9678fe651',
    },
    {
      id: 'did:web:did.actor:alice#recovery',
      usage: 'recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: '02c30e2368d4ecd6d618cb3c13b1fb43269e6c8ec3346b2abce15e697152c6865c',
    },
    {
      id: 'did:web:did.actor:alice#secondary',
      usage: 'signing',
      type: 'RsaVerificationKey2018',
      publicKeyPem: 'publicrsa',
    },
    { id: 'did:web:did.actor:alice#bbs', type: 'Bls12381G2Key2020', usage: 'signing', publicKeyBase58: 'publicbbs' },
  ],
  authentication: [
    'did:web:did.actor:alice#primary',
    'did:web:did.actor:alice#secondary',
    'did:web:did.actor:alice#bbs',
  ],
  assertionMethod: [
    'did:web:did.actor:alice#primary',
    'did:web:did.actor:alice#secondary',
    'did:web:did.actor:alice#bbs',
  ],
}
