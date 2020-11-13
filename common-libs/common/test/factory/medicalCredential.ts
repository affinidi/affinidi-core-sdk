export const medicalCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      HealthPassportBundleCredentialV1: {
        '@id': 'https://schema.affinity-project.org/HealthPassportBundleCredentialV1',
        '@context': { '@version': 1.1, '@protected': true },
      },
      data: {
        '@id': 'https://schema.affinity-project.org/data',
        '@context': [
          null,
          {
            '@version': 1.1,
            '@protected': true,
            '@vocab': 'http://hl7.org/fhir/',
            Observation: {
              '@id': 'http://hl7.org/fhir/Observation',
              '@context': { '@version': 1.1, '@protected': true, '@vocab': 'http://hl7.org/fhir/' },
            },
            Immunization: {
              '@id': 'http://hl7.org/fhir/Immunization',
              '@context': { '@version': 1.1, '@protected': true, '@vocab': 'http://hl7.org/fhir/' },
            },
            Specimen: {
              '@id': 'http://hl7.org/fhir/Specimen',
              '@context': { '@version': 1.1, '@protected': true, '@vocab': 'http://hl7.org/fhir/' },
            },
            Organization: {
              '@id': 'http://hl7.org/fhir/Organization',
              '@context': { '@version': 1.1, '@protected': true, '@vocab': 'http://hl7.org/fhir/' },
            },
            BundleEntry: {
              '@id': 'http://hl7.org/fhir/BundleEntry',
              '@context': { '@version': 1.1, '@protected': true, '@vocab': 'http://hl7.org/fhir/' },
            },
            Bundle: {
              '@id': 'http://hl7.org/fhir/Bundle',
              '@context': { '@version': 1.1, '@protected': true, '@vocab': 'http://hl7.org/fhir/' },
            },
            BundleContainer: {
              '@id': 'https://schema.affinity-project.org/BundleContainer',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'null',
                fhirVersion: 'https://schema.affinity-project.org/fhirVersion',
                fhirBundle: 'https://schema.affinity-project.org/fhirBundle',
              },
            },
            Patient: {
              '@id': 'http://hl7.org/fhir/Patient',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
                resourceType: 'http://hl7.org/fhir/resourceType',
                identifier: 'http://hl7.org/fhir/identifier',
                active: 'http://hl7.org/fhir/active',
                name: 'http://hl7.org/fhir/name',
                gender: 'http://hl7.org/fhir/gender',
                birthDate: 'http://hl7.org/fhir/birthDate',
                telecom: 'http://hl7.org/fhir/telecom',
                address: 'http://hl7.org/fhir/address',
                contact: 'http://hl7.org/fhir/contact',
                communication: 'http://hl7.org/fhir/communication',
              },
            },
          },
        ],
      },
    },
  ],
  id: 'claimId:cd972e2af2d22c1b',
  type: ['VerifiableCredential', 'HealthPassportBundleCredentialV1'],
  holder: { id: 'did:elem:EiAkoJmYR0JE7LF-Nm_y8ZS7Lqwo0KplwbHfvV-MIA7cpQ' },
  credentialSubject: {
    data: {
      '@type': 'BundleContainer',
      fhirVersion: '4.0.1',
      fhirBundle: {
        '@type': 'Bundle',
        resourceType: 'Bundle',
        entry: [
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Patient',
              resourceType: 'Patient',
              active: true,
              telecom: [
                { system: 'phone', value: '+6518003339998' },
                {
                  system: 'email',
                  value: 'demo+4@affinidi.com',
                },
              ],
              name: [{ text: 'demo user2' }],
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                        code: 'PPN',
                        display: 'Passport number',
                      },
                    ],
                    text: 'PPN',
                  },
                  value: 'E78311778',
                },
                { type: { text: 'NRIC' }, value: 'S9098989C' },
              ],
              gender: 'male',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                  valueCodeableConcept: { text: 'SGP' },
                },
              ],
              birthDate: '1984-12-22',
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Specimen',
              resourceType: 'Specimen',
              status: 'available',
              type: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '258500001',
                    display: 'Nasopharyngeal swab',
                  },
                ],
              },
              collection: { collectedDateTime: '2020-10-11T06:15:00Z' },
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Observation',
              resourceType: 'Observation',
              effectiveDateTime: '',
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                        code: 'ACSN',
                        display: 'Accession ID',
                      },
                    ],
                    text: 'ACSN',
                  },
                  value: 'observation-identifier',
                },
              ],
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '260385009',
                    display: 'Negative',
                  },
                ],
              },
              performer: [
                {
                  resourceType: 'Practitioner',
                  name: [{ text: 'string' }],
                  qualification: [
                    {
                      identifier: [{ value: 'MCR 123214' }],
                      issuer: { identifier: { value: 'MOH' } },
                      code: {},
                    },
                  ],
                },
              ],
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '94531-1',
                    display: 'Reverse transcription polymerase chain reaction (rRT-PCR) test',
                  },
                ],
              },
              status: 'final',
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Organization',
              resourceType: 'Organization',
              name: 'Parkway Laboratory',
              type: [{ text: 'Licensed Healthcare Provider' }],
              endpoint: [{ display: 'https://www.parkwaylab.com.sg/' }],
              contact: [
                {
                  telecom: [{ system: 'phone', value: '+6562789188' }],
                  address: {
                    type: 'physical',
                    use: 'work',
                    text: '2 Aljunied Avenue 1 #07-11 Framework 2 Building Singapore 389977',
                  },
                },
              ],
              identifier: [{ id: 'organization-lab-1' }],
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Organization',
              resourceType: 'Organization',
              name: 'Raffles Medical Clinic',
              type: [{ text: 'Accredited Laboratory' }],
              endpoint: [{ display: 'https://www.rafflesmedical.com.sg' }],
              contact: [
                {
                  telecom: [{ system: 'phone', value: '+6563111111' }],
                  address: {
                    type: 'physical',
                    use: 'work',
                    text: 'Raffles Hospital 585 North Bridge Road Singapore 188770',
                  },
                },
              ],
              identifier: [{ id: 'organization-provider-1' }],
            },
          },
        ],
      },
    },
  },
  issuanceDate: '2020-10-13T21:19:17.773Z',
  issuer:
    'did:elem:EiCMp_GZPSeBUyIghZL7DdfohuZLGwWZA9qtZ8CCRvuN8A;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBek4ySXdNREJoWVdRMlkyUXdNRFE1WlRJeU56bGxNbUZqWmpnMVpqRTFaamd5WkRZME56UTVZMk0yTkdRNU56Z3pZakpsTmpCaE9UZ3lPVGd3WlROaVlpSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TTJNMk1USTBNV0kxTldRNU5tSmpPR0kyT0RZM05HVXhNVFZoTmpVeU1tSmtOV0V4TXpoaVlUSTFZVFZqWWpCak1UaGpNMk0yTkdRM01XRXdOamxtTVRjaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoic1JmaFlTbnZCeUVOTHBoTlQydnFrRHBCamhiYkxSQ2xHaTJiUl9ZbWI0QkJPeEoxVUJ2WS03dmZvYnNDUXg1V1VvaWN6Q3ViajJYd3NyaHI5cGNkZ2cifQ',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2020-10-13T21:19:17Z',
    verificationMethod: 'did:elem:EiCMp_GZPSeBUyIghZL7DdfohuZLGwWZA9qtZ8CCRvuN8A#primary',
    proofPurpose: 'assertionMethod',
    jws:
      'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..YzvxdgRnCby2KIeHbC9KjDDf6xsb-ZDMTsNSqHqg145YWuQQpoFCqZFJebncNdLbHkHdChWBuOErjS36UXMYdw',
  },
}
