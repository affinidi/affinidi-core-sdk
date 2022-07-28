export const signedPresentation = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiablePresentation'],
  holder: {
    id:
      'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ',
  },
  verifiableCredential: [
    {
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
                  '@context': { '@version': 1.1, '@protected': true, '@vocab': 'https://schema.org/' },
                },
                OrganizationE: {
                  '@id': 'https://schema.affinity-project.org/OrganizationE',
                  '@context': {
                    '@version': 1.1,
                    '@protected': true,
                    '@vocab': 'https://schema.org/',
                    hasCredential: 'https://schema.org/hasCredential',
                    industry: 'https://schema.affinity-project.org/industry',
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
        id:
          'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ',
      },
      credentialSubject: {
        data: { '@type': ['Person', 'PersonE', 'NamePerson'], givenName: 'DenisUpdated', familyName: 'Popov' },
      },
      issuanceDate: '2020-01-17T07:06:35.403Z',
      issuer:
        'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZalJpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWpNMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16VmxaRFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqTkRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdUTkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPUWJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ',
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: '2020-08-06T21:13:07Z',
        verificationMethod: 'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw#primary',
        proofPurpose: 'assertionMethod',
        jws:
          'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..IxVRur3Ma2n1FsLbyO-CYC9VP-NdF8lpoVmZ_O644U94QxaQ1hhlNFr2_XU7xCVRkRWIVQ7qlSp5u3Kymz3ceQ',
      },
    },
  ],
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2020-08-06T21:13:07Z',
    verificationMethod: 'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw#primary',
    proofPurpose: 'authentication',
    challenge: 'challenge',
    domain: 'domain',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..wd0lKZBoQ5AvOnllqXvNHoy7grQKTjJGK-h4qe7MDEdSTbOieDCx_oNzEUdqqGvKQXrSJKK9JIFJMOO7iOxZbg',
  },
}

export const signedPresentationWithPolygon = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id: 'uuid:urn:11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
  type: ['VerifiablePresentation'],
  holder: {
    id: 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630',
  },
  verifiableCredential: [
    {
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
        created: '2022-07-07T12:10:15Z',
        verificationMethod: 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630#key-1',
        proofPurpose: 'assertionMethod',
        jws:
          'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..uegAoF-YRwY-ayVYsBTIke1cDV0ur8rFaOdXA2vqcyNGqzAEfAbic6t5nyuJy2ee0fGeqoVDzvH1PvDaDqDu3A',
      },
    },
  ],
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2022-07-07T12:10:15Z',
    verificationMethod: 'did:polygon:testnet:0xfd789b28fea8917dce28441d387ba1e2ddbc5630#key-1',
    proofPurpose: 'authentication',
    challenge: 'challenge',
    domain: 'domain',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..n0T10-n0cbAj4p_M4IZmcgdmufwI760mDwM0qoPy4dA4LqJmQgrdExvEoIRUAASRbzb9aBeV_fq7fwXImhx_ZQ',
  },
}
