export const employmentVCRevoked: any = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      EmploymentCredentialPersonV1: {
        '@id': 'https://schema.affinity-project.org/EmploymentCredentialPersonV1',
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
            EmploymentPerson: {
              '@id': 'https://schema.affinity-project.org/EmploymentPerson',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
                worksFor: 'https://schema.org/worksFor',
              },
            },
            PersonEmployeeRoleE: {
              '@id': 'https://schema.affinity-project.org/PersonEmployeeRoleE',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'https://schema.org/',
                reference: 'https://schema.affinity-project.org/reference',
                skills: 'https://schema.affinity-project.org/skills',
                worksFor: 'https://schema.org/worksFor',
                offerLetter: 'https://schema.affinity-project.org/offerLetter',
                experienceLetter: 'https://schema.affinity-project.org/experienceLetter',
                salary: 'https://schema.affinity-project.org/salary',
              },
            },
            Salary: {
              '@id': 'https://schema.affinity-project.org/Salary',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': null,
                gross: 'https://schema.affinity-project.org/gross',
                net: 'https://schema.affinity-project.org/net',
                frequency: 'https://schema.affinity-project.org/frequency',
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
    'https://w3id.org/vc-revocation-list-2020/v1',
  ],
  id: 'claimId:95a6a7edbbe97f13',
  type: ['VerifiableCredential', 'EmploymentCredentialPersonV1'],
  holder: { id: 'did:elem:EiAbIJj45o2ecRHkhIULf4h4qXVFI4TUnT9mMm1hIf1bJw' },
  credentialSubject: {
    data: {
      '@type': ['Person', 'PersonE', 'EmploymentPerson'],
      worksFor: {
        '@type': ['EmployeeRole', 'PersonEmployeeRoleE'],
        reference: {
          '@type': 'ContactPoint',
          name: 'Linda Belcher',
          email: 'lindabelcher@gmail.com',
        },
        skills: ['burger', 'fries'],
        offerLetter: 'https://google.com',
        experienceLetter: 'https://google.com',
        worksFor: {
          '@type': ['Organization', 'OrganizationE'],
          name: "Bob's Burgers",
        },
        salary: {
          '@type': ['Salary'],
          gross: {
            '@type': 'MonetaryAmount',
            value: 10000,
            currency: 'INR',
          },
          net: { '@type': 'MonetaryAmount', value: 8000, currency: 'INR' },
          frequency: 'Monthly',
        },
      },
      name: 'Bob Belcher',
    },
  },
  issuanceDate: '2021-07-05T13:58:45.293Z',
  credentialStatus: {
    id:
      'https://revocation-api.prod.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/did:elem:EiCM2L-lG9xA4In9GLjmazqGFcXdHZdiAZcWkVrCveBhTQ/41#21',
    type: 'RevocationList2020Status',
    revocationListIndex: '21',
    revocationListCredential:
      'https://revocation-api.prod.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/did:elem:EiCM2L-lG9xA4In9GLjmazqGFcXdHZdiAZcWkVrCveBhTQ/41',
  },
  issuer:
    'did:elem:EiCM2L-lG9xA4In9GLjmazqGFcXdHZdiAZcWkVrCveBhTQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU56a3lNRGxtTW1Rd09XVmtOMlE1T0RZeVpXRTNNbVUwT1RKbU0yUmhaVEl3T1dWa05HVTRaREJrT0RnNE1EaGlNek14TkdJNFpXSmxPV1ZqTkRZMk5TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1KaE9UTmhZMk0zWkdNd016WTRaV1kyWm1ZellUUmtOVGs1T1RJME5qSmtNREZpTldabU5HRmpZek5rWmpNMU1tSmhNV1l3TkRjM01EQTJNR0poTnpJaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiWGlXdGJWelRNV0YzLXVnRWJvajQwbWtCdUNHa0hjR1oySVVaR24zVmFld3RGb3N3MTlqeWMtZVJwUHY3RGJ0UmxFaHRwUUlyaXQxejhrS0tlV2NVX3cifQ',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2021-07-05T13:58:46Z',
    verificationMethod: 'did:elem:EiCM2L-lG9xA4In9GLjmazqGFcXdHZdiAZcWkVrCveBhTQ#primary',
    proofPurpose: 'assertionMethod',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..PhW_uVczAZFD4S2BoP6x-tI1dPcOIbZ7CLfVdV3EUVRAzKgGjahUnlqz_d-JE5ZDmhuEp9pjyQk7alkVwt2Hvg',
  },
}
