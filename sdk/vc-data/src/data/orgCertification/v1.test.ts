import { VCOrganizationCredentialV1, getVCOrganizationCredentialV1, VCSOrganizationCredentialV1 } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCOrganizationCredentialV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCOrganizationCredentialV1, VCSOrganizationCredentialV1>({
      type: 'OrganizationCredentialV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'OrganizationCredential'],
        ownerOrganization: {
          '@type': ['Organization', 'OrganizationE'],
          name: 'My Awesome FinTech',
          url: 'http://www.my-awesome-fintech.com',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Paris, France',
            postalCode: 'F-75002',
            streetAddress: '38 avenue de lOpera',
          },
          email: 'secretariat(at)myAwesomeFinTech.org',
          faxNumber: '( 33 1) 42 68 53 01',
          telephone: '( 33 1) 42 68 53 00',
          hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            name: 'Proof of Engagement',
            description:
              'This credential is given to relevant parties as proof that they are associated with each to perform certain business together.',
            credentialCategory: {
              '@type': 'DefinedTerm',
              name: 'Proof of Engagement',
              termCode: 'PoE',
            },
            creativeWorkStatus: {
              '@type': 'DefinedTerm',
              name: 'Proposal under review',
              termCode: 'STAGE-2',
            },
            recognizedBy: {
              '@type': 'Organization',
              url: 'http://www.my-awesome-bank.com',
              name: 'My Awesome Bank',
              duns: 'ABCD1234',
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  telephone: '+1-401-555-1212',
                  contactType: 'customer service',
                },
              ],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Paris, France',
                postalCode: 'F-75006',
                streetAddress: '39 avenue de lOpera',
              },
            },
          },
        },
      },
      context: getVCOrganizationCredentialV1(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/OrganizationCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/OrganizationCredential",
                ],
                "https://schema.affinity-project.org/ownerOrganization": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Organization",
                      "https://schema.affinity-project.org/OrganizationE",
                    ],
                    "https://schema.org/address": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PostalAddress",
                        ],
                        "https://schema.org/addressLocality": Array [
                          Object {
                            "@value": "Paris, France",
                          },
                        ],
                        "https://schema.org/postalCode": Array [
                          Object {
                            "@value": "F-75002",
                          },
                        ],
                        "https://schema.org/streetAddress": Array [
                          Object {
                            "@value": "38 avenue de lOpera",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/email": Array [
                      Object {
                        "@value": "secretariat(at)myAwesomeFinTech.org",
                      },
                    ],
                    "https://schema.org/faxNumber": Array [
                      Object {
                        "@value": "( 33 1) 42 68 53 01",
                      },
                    ],
                    "https://schema.org/hasCredential": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/EducationalOccupationalCredential",
                        ],
                        "https://schema.org/creativeWorkStatus": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/DefinedTerm",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Proposal under review",
                              },
                            ],
                            "https://schema.org/termCode": Array [
                              Object {
                                "@value": "STAGE-2",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/credentialCategory": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/DefinedTerm",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Proof of Engagement",
                              },
                            ],
                            "https://schema.org/termCode": Array [
                              Object {
                                "@value": "PoE",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/description": Array [
                          Object {
                            "@value": "This credential is given to relevant parties as proof that they are associated with each to perform certain business together.",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "Proof of Engagement",
                          },
                        ],
                        "https://schema.org/recognizedBy": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/Organization",
                            ],
                            "https://schema.org/address": Array [
                              Object {
                                "@type": Array [
                                  "https://schema.org/PostalAddress",
                                ],
                                "https://schema.org/addressLocality": Array [
                                  Object {
                                    "@value": "Paris, France",
                                  },
                                ],
                                "https://schema.org/postalCode": Array [
                                  Object {
                                    "@value": "F-75006",
                                  },
                                ],
                                "https://schema.org/streetAddress": Array [
                                  Object {
                                    "@value": "39 avenue de lOpera",
                                  },
                                ],
                              },
                            ],
                            "https://schema.org/contactPoint": Array [
                              Object {
                                "@type": Array [
                                  "https://schema.org/ContactPoint",
                                ],
                                "https://schema.org/contactType": Array [
                                  Object {
                                    "@value": "customer service",
                                  },
                                ],
                                "https://schema.org/telephone": Array [
                                  Object {
                                    "@value": "+1-401-555-1212",
                                  },
                                ],
                              },
                            ],
                            "https://schema.org/duns": Array [
                              Object {
                                "@value": "ABCD1234",
                              },
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "My Awesome Bank",
                              },
                            ],
                            "https://schema.org/url": Array [
                              Object {
                                "@value": "http://www.my-awesome-bank.com",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "My Awesome FinTech",
                      },
                    ],
                    "https://schema.org/telephone": Array [
                      Object {
                        "@value": "( 33 1) 42 68 53 00",
                      },
                    ],
                    "https://schema.org/url": Array [
                      Object {
                        "@value": "http://www.my-awesome-fintech.com",
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
