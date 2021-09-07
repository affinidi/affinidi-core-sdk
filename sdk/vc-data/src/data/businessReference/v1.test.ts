import { VCBusinessReferenceV1, VCSBusinessReferenceV1, getVCBusinessReferenceCredentialV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCGenderPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCBusinessReferenceV1, VCSBusinessReferenceV1>({
      type: 'BusinessReferenceCredentialV1',
      data: {
        '@type': ['BusinessReference'],
        isCurrent: 'Yes',
        dateofCommencement: '10/10/2021',
        fintech: {
          '@type': ['Organization', 'OrganizationE'],
          legalName: 'ABC Corp',
          leiCode: 'FNTXXX',
        },
        reference: {
          '@type': ['EducationalOccupationalCredential'],
          credentialCategory: 'Undertaking a Proof of Concept',
          recognizedBy: {
            '@type': ['Organization', 'OrganizationE'],
            legalName: 'StandardChartered',
            leiCode: 'ABSSSW',
            employee: {
              name: 'XYZ',
              email: 'xyz@gmail.com',
              jobTitle: 'Director',
              department: 'Innovation',
              areaServed: 'Singapore',
            },
          },
        },
      },
      context: getVCBusinessReferenceCredentialV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/BusinessReferenceCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.affinity-project.org/BusinessReference",
                ],
                "https://schema.affinity-project.org/dateofCommencement": Array [
                  Object {
                    "@value": "10/10/2021",
                  },
                ],
                "https://schema.affinity-project.org/fintech": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Organization",
                      "https://schema.affinity-project.org/OrganizationE",
                    ],
                    "https://schema.org/legalName": Array [
                      Object {
                        "@value": "ABC Corp",
                      },
                    ],
                    "https://schema.org/leiCode": Array [
                      Object {
                        "@value": "FNTXXX",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/isCurrent": Array [
                  Object {
                    "@value": "Yes",
                  },
                ],
                "https://schema.affinity-project.org/reference": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/EducationalOccupationalCredential",
                    ],
                    "https://schema.org/credentialCategory": Array [
                      Object {
                        "@value": "Undertaking a Proof of Concept",
                      },
                    ],
                    "https://schema.org/recognizedBy": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Organization",
                          "https://schema.affinity-project.org/OrganizationE",
                        ],
                        "https://schema.org/employee": Array [
                          Object {
                            "https://schema.org/areaServed": Array [
                              Object {
                                "@value": "Singapore",
                              },
                            ],
                            "https://schema.org/department": Array [
                              Object {
                                "@value": "Innovation",
                              },
                            ],
                            "https://schema.org/email": Array [
                              Object {
                                "@value": "xyz@gmail.com",
                              },
                            ],
                            "https://schema.org/jobTitle": Array [
                              Object {
                                "@value": "Director",
                              },
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "XYZ",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/legalName": Array [
                          Object {
                            "@value": "StandardChartered",
                          },
                        ],
                        "https://schema.org/leiCode": Array [
                          Object {
                            "@value": "ABSSSW",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        "https://www.w3.org/2018/credentials#holder": Array [
          Object {
            "@id": "did:elem:123",
          },
        ],
      }
    `)
  })
})
