import { buildVCV1Skeleton, buildVCV1Unsigned } from '@affinidi/vc-common'
import { VCSNamePersonV1, getVCNamePersonV1Context } from '@affinidi/vc-data'

export const credential = buildVCV1Unsigned({
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
      id: 'did:jolo:6df6fd4a876dcd375fbc5d630e64e7529f27e9612aecbbbf3213861a2b0b7e9d',
    },
    type: 'NameCredentialPersonV1',
    context: getVCNamePersonV1Context(),
  }),
  issuanceDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
})

export const revocationListCredential = {
  '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/vc-revocation-list-2020/v1'],
  id: 'https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1',
  type: ['VerifiableCredential', 'RevocationList2020Credential'],
  credentialSubject: {
    id:
      'https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1#list',
    type: 'RevocationList2020',
    encodedList: 'H4sIAAAAAAAAA2MAAI3vAtIBAAAA',
  },
  issuer:
    'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ',
  issuanceDate: '2020-08-03T08:52:03.319Z',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2020-08-03T08:52:03Z',
    verificationMethod:
      'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ#primary',
    proofPurpose: 'assertionMethod',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..JX2ggF3jjy824YRf0RkvKoLVWAzGaLisf2S952q3q80tui4S7qrjxdsJpEw-YTNjDkNiTQRsTIlnKJtZhDyUIA',
  },
}

export const revocationListCredentialWithRevokedVC = {
  '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/vc-revocation-list-2020/v1'],
  id: 'https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1',
  type: ['VerifiableCredential', 'RevocationList2020Credential'],
  credentialSubject: {
    id:
      'https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1#list',
    type: 'RevocationList2020',
    encodedList: 'H4sIAAAAAAAAA2MCAKGODDwBAAAA',
  },
  issuer:
    'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ',
  issuanceDate: '2020-08-03T08:52:04.914Z',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2020-08-03T08:52:04Z',
    verificationMethod:
      'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ#primary',
    proofPurpose: 'assertionMethod',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..HRyAr4T0iXoZwrjXGJaTN-bqjiBR4DJumBTCqsII7mYw2CHJB7IySfWE1cIyJGv8gnwcFE0KIZQGRjVTTQTqPA',
  },
}

export const credentialStatus = {
  id: 'https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1#1',
  type: 'RevocationList2020Status',
  revocationListIndex: '1',
  revocationListCredential:
    'https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1',
}

export const legacyCredential = {
  '@context': [
    {
      id: '@id',
      type: '@type',
      cred: 'https://w3id.org/credentials#',
      schema: 'http://schema.org/',
      dc: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      sec: 'https://w3id.org/security#',
      Credential: 'cred:Credential',
      issuer: { '@id': 'cred:issuer', '@type': '@id' },
      issued: { '@id': 'cred:issued', '@type': 'xsd:dateTime' },
      claim: { '@id': 'cred:claim', '@type': '@id' },
      credential: { '@id': 'cred:credential', '@type': '@id' },
      expires: { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
      proof: { '@id': 'sec:proof', '@type': '@id' },
      EcdsaKoblitzSignature2016: 'sec:EcdsaKoblitzSignature2016',
      created: { '@id': 'dc:created', '@type': 'xsd:dateTime' },
      creator: { '@id': 'dc:creator', '@type': '@id' },
      domain: 'sec:domain',
      nonce: 'sec:nonce',
      signatureValue: 'sec:signatureValue',
    },
    {
      ProofOfNameCredential: 'https://identity.jolocom.com/terms/ProofOfNameCredential',
      schema: 'http://schema.org/',
      familyName: 'schema:familyName',
      givenName: 'schema:givenName',
    },
  ],
  id: 'claimId:63b5d11c0d1b5566',
  issuer: 'did:jolo:6df6fd4a876dcd375fbc5d630e64e7529f27e9612aecbbbf3213861a2b0b7e9d',
  issued: '2020-01-17T07:06:35.403Z',
  type: ['Credential', 'ProofOfNameCredential'],
  expires: '2021-01-16T07:06:35.337Z',
  claim: {
    givenName: 'DenisUpdated',
    familyName: 'Popov',
    id: 'did:jolo:6df6fd4a876dcd375fbc5d630e64e7529f27e9612aecbbbf3213861a2b0b7e9d',
  },
  name: 'Name',
}

export const signedCredentialWithPolygon = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      NameCredentialPersonV1: {
        '@id': 'https://schema.affinity-project.org/NameCredentialPersonV1',
        '@context': { '@version': 1.1, '@protected': true },
      },
      data: {
        '@id': 'https://schema.affinity-project.org/data',
        '@context': [
          null,
          {
            '@version': 1.1,
            '@protected': true,
            '@vocab': 'https://schema.org/',
            NamePerson: {
              '@id': 'https://schema.affinity-project.org/NamePerson',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
                name: 'https://schema.org/name',
                givenName: 'https://schema.org/givenName',
                fullName: 'https://schema.org/fullName',
              },
            },
            PersonE: {
              '@id': 'https://schema.affinity-project.org/PersonE',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
              },
            },
            OrganizationE: {
              '@id': 'https://schema.affinity-project.org/OrganizationE',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
                hasCredential: 'https://schema.org/hasCredential',
                industry: 'https://schema.affinity-project.org/industry',
                identifiers: 'https://schema.affinity-project.org/identifiers',
              },
            },
            Credential: {
              '@id': 'https://schema.affinity-project.org/Credential',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
                dateRevoked: 'https://schema.affinity-project.org/dateRevoked',
                recognizedBy: 'https://schema.affinity-project.org/recognizedBy',
              },
            },
            OrganizationalCredential: {
              '@id': 'https://schema.affinity-project.org/OrganizationalCredential',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
                credentialCategory: 'https://schema.affinity-project.org/credentialCategory',
                organizationType: 'https://schema.affinity-project.org/organizationType',
                goodStanding: 'https://schema.affinity-project.org/goodStanding',
                active: 'https://schema.affinity-project.org/active',
                primaryJurisdiction: 'https://schema.affinity-project.org/primaryJurisdiction',
                identifier: 'https://schema.org/identifier',
              },
            },
          },
        ],
      },
    },
  ],
  id: 'claimId:63b5d11c0d1b5566',
  type: ['VerifiableCredential', 'NameCredentialPersonV1'],
  holder: {
    id: 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630',
  },
  credentialSubject: {
    data: {
      '@type': ['Person', 'PersonE', 'NamePerson'],
      givenName: 'Affinidi',
      familyName: 'Project',
    },
  },
  issuanceDate: '2022-07-06T11:20:03.506Z',
  expirationDate: '2035-07-07T11:20:03.506Z',
  issuer: 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2022-07-07T11:39:26Z',
    verificationMethod: 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630#key-1',
    proofPurpose: 'assertionMethod',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..nl4YnpCTK-YwfKuKoCzVPl3AVfZtlMS4WR7NJivbDd4XamToMYQtVvokzim8SLXtKSUEzIOQsepenbDY0kcnfA',
  },
}

export const signedCredentialWithWeb = {

}

export const createUnsignedCredential = (
  holderId = 'did:polygon:testnet:0xb83cf29e1029313c20537b04f9b598e1f9cb3df5',
) => {
  return buildVCV1Unsigned({
    skeleton: buildVCV1Skeleton<VCSNamePersonV1>({
      id: 'claimId:63b5d11c0d1b5566',
      credentialSubject: {
        data: {
          '@type': ['Person', 'PersonE', 'NamePerson'],
          givenName: 'Affinidi',
          familyName: 'Project',
        },
      },
      holder: {
        id: holderId,
      },
      type: 'NameCredentialPersonV1',
      context: getVCNamePersonV1Context(),
    }),
    issuanceDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  })
}
