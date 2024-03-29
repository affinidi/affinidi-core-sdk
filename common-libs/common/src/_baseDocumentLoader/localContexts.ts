export const localContexts: Record<string, Record<string, any>> = {
  'https://www.w3.org/2018/credentials/v1': {
    '@context': {
      '@version': 1.1,
      '@protected': true,

      id: '@id',
      type: '@type',

      VerifiableCredential: {
        '@id': 'https://www.w3.org/2018/credentials#VerifiableCredential',
        '@context': {
          '@version': 1.1,
          '@protected': true,

          id: '@id',
          type: '@type',

          cred: 'https://www.w3.org/2018/credentials#',
          sec: 'https://w3id.org/security#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',

          credentialSchema: {
            '@id': 'cred:credentialSchema',
            '@type': '@id',
            '@context': {
              '@version': 1.1,
              '@protected': true,

              id: '@id',
              type: '@type',

              cred: 'https://www.w3.org/2018/credentials#',

              JsonSchemaValidator2018: 'cred:JsonSchemaValidator2018',
            },
          },
          credentialStatus: { '@id': 'cred:credentialStatus', '@type': '@id' },
          credentialSubject: { '@id': 'cred:credentialSubject', '@type': '@id' },
          evidence: { '@id': 'cred:evidence', '@type': '@id' },
          expirationDate: { '@id': 'cred:expirationDate', '@type': 'xsd:dateTime' },
          holder: { '@id': 'cred:holder', '@type': '@id' },
          issued: { '@id': 'cred:issued', '@type': 'xsd:dateTime' },
          issuer: { '@id': 'cred:issuer', '@type': '@id' },
          issuanceDate: { '@id': 'cred:issuanceDate', '@type': 'xsd:dateTime' },
          proof: { '@id': 'sec:proof', '@type': '@id', '@container': '@graph' },
          refreshService: {
            '@id': 'cred:refreshService',
            '@type': '@id',
            '@context': {
              '@version': 1.1,
              '@protected': true,

              id: '@id',
              type: '@type',

              cred: 'https://www.w3.org/2018/credentials#',

              ManualRefreshService2018: 'cred:ManualRefreshService2018',
            },
          },
          termsOfUse: { '@id': 'cred:termsOfUse', '@type': '@id' },
          validFrom: { '@id': 'cred:validFrom', '@type': 'xsd:dateTime' },
          validUntil: { '@id': 'cred:validUntil', '@type': 'xsd:dateTime' },
        },
      },

      VerifiablePresentation: {
        '@id': 'https://www.w3.org/2018/credentials#VerifiablePresentation',
        '@context': {
          '@version': 1.1,
          '@protected': true,

          id: '@id',
          type: '@type',

          cred: 'https://www.w3.org/2018/credentials#',
          sec: 'https://w3id.org/security#',

          holder: { '@id': 'cred:holder', '@type': '@id' },
          proof: { '@id': 'sec:proof', '@type': '@id', '@container': '@graph' },
          verifiableCredential: { '@id': 'cred:verifiableCredential', '@type': '@id', '@container': '@graph' },
        },
      },

      EcdsaSecp256k1Signature2019: {
        '@id': 'https://w3id.org/security#EcdsaSecp256k1Signature2019',
        '@context': {
          '@version': 1.1,
          '@protected': true,

          id: '@id',
          type: '@type',

          sec: 'https://w3id.org/security#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',

          challenge: 'sec:challenge',
          created: { '@id': 'http://purl.org/dc/terms/created', '@type': 'xsd:dateTime' },
          domain: 'sec:domain',
          expires: { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
          jws: 'sec:jws',
          nonce: 'sec:nonce',
          proofPurpose: {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,

              id: '@id',
              type: '@type',

              sec: 'https://w3id.org/security#',

              assertionMethod: { '@id': 'sec:assertionMethod', '@type': '@id', '@container': '@set' },
              authentication: { '@id': 'sec:authenticationMethod', '@type': '@id', '@container': '@set' },
            },
          },
          proofValue: 'sec:proofValue',
          verificationMethod: { '@id': 'sec:verificationMethod', '@type': '@id' },
        },
      },

      EcdsaSecp256r1Signature2019: {
        '@id': 'https://w3id.org/security#EcdsaSecp256r1Signature2019',
        '@context': {
          '@version': 1.1,
          '@protected': true,

          id: '@id',
          type: '@type',

          sec: 'https://w3id.org/security#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',

          challenge: 'sec:challenge',
          created: { '@id': 'http://purl.org/dc/terms/created', '@type': 'xsd:dateTime' },
          domain: 'sec:domain',
          expires: { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
          jws: 'sec:jws',
          nonce: 'sec:nonce',
          proofPurpose: {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,

              id: '@id',
              type: '@type',

              sec: 'https://w3id.org/security#',

              assertionMethod: { '@id': 'sec:assertionMethod', '@type': '@id', '@container': '@set' },
              authentication: { '@id': 'sec:authenticationMethod', '@type': '@id', '@container': '@set' },
            },
          },
          proofValue: 'sec:proofValue',
          verificationMethod: { '@id': 'sec:verificationMethod', '@type': '@id' },
        },
      },

      Ed25519Signature2018: {
        '@id': 'https://w3id.org/security#Ed25519Signature2018',
        '@context': {
          '@version': 1.1,
          '@protected': true,

          id: '@id',
          type: '@type',

          sec: 'https://w3id.org/security#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',

          challenge: 'sec:challenge',
          created: { '@id': 'http://purl.org/dc/terms/created', '@type': 'xsd:dateTime' },
          domain: 'sec:domain',
          expires: { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
          jws: 'sec:jws',
          nonce: 'sec:nonce',
          proofPurpose: {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,

              id: '@id',
              type: '@type',

              sec: 'https://w3id.org/security#',

              assertionMethod: { '@id': 'sec:assertionMethod', '@type': '@id', '@container': '@set' },
              authentication: { '@id': 'sec:authenticationMethod', '@type': '@id', '@container': '@set' },
            },
          },
          proofValue: 'sec:proofValue',
          verificationMethod: { '@id': 'sec:verificationMethod', '@type': '@id' },
        },
      },

      RsaSignature2018: {
        '@id': 'https://w3id.org/security#RsaSignature2018',
        '@context': {
          '@version': 1.1,
          '@protected': true,

          challenge: 'sec:challenge',
          created: { '@id': 'http://purl.org/dc/terms/created', '@type': 'xsd:dateTime' },
          domain: 'sec:domain',
          expires: { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
          jws: 'sec:jws',
          nonce: 'sec:nonce',
          proofPurpose: {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,

              id: '@id',
              type: '@type',

              sec: 'https://w3id.org/security#',

              assertionMethod: { '@id': 'sec:assertionMethod', '@type': '@id', '@container': '@set' },
              authentication: { '@id': 'sec:authenticationMethod', '@type': '@id', '@container': '@set' },
            },
          },
          proofValue: 'sec:proofValue',
          verificationMethod: { '@id': 'sec:verificationMethod', '@type': '@id' },
        },
      },

      proof: { '@id': 'https://w3id.org/security#proof', '@type': '@id', '@container': '@graph' },
    },
  },
  'https://w3id.org/vc-revocation-list-2020/v1': {
    '@context': {
      '@protected': true,
      RevocationList2020Credential: {
        '@id': 'https://w3id.org/vc-revocation-list-2020#RevocationList2020Credential',
        '@context': {
          '@protected': true,
          id: '@id',
          type: '@type',
          description: 'http://schema.org/description',
          name: 'http://schema.org/name',
        },
      },
      RevocationList2020: {
        '@id': 'https://w3id.org/vc-revocation-list-2020#RevocationList2020',
        '@context': {
          '@protected': true,
          id: '@id',
          type: '@type',
          encodedList: 'https://w3id.org/vc-revocation-list-2020#encodedList',
        },
      },
      RevocationList2020Status: {
        '@id': 'https://w3id.org/vc-revocation-list-2020#RevocationList2020Status',
        '@context': {
          '@protected': true,
          id: '@id',
          type: '@type',
          revocationListCredential: {
            '@id': 'https://w3id.org/vc-revocation-list-2020#revocationListCredential',
            '@type': '@id',
          },
          revocationListIndex: 'https://w3id.org/vc-revocation-list-2020#revocationListIndex',
        },
      },
    },
  },
  'https://identity.foundation/presentation-exchange/submission/v1': {
    '@context': {
      '@version': 1.1,
      PresentationSubmission: {
        '@id': 'https://identity.foundation/presentation-exchange/#presentation-submission',
        '@context': {
          '@version': 1.1,
          presentation_submission: {
            '@id': 'https://identity.foundation/presentation-exchange/#presentation-submission',
            '@type': '@json',
          },
        },
      },
    },
  },
}
