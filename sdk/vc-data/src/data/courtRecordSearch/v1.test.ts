import { VCCourtRecordSearchPersonV1, VCSCourtRecordSearchPersonV1, getVCCourtRecordSearchPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCAMLPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCCourtRecordSearchPersonV1, VCSCourtRecordSearchPersonV1>({
      type: 'CourtRecordSearchCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'CourtRecordSearchPerson'],
        hasCourtRecordSearch: {
          '@type': 'CourtRecordSearch',
          result: 'pass',
          query: {
            '@type': 'CourtRecordSearchQuery',
            parent: {
              '@type': 'Person',
              name: 'Bob Belcher',
            },
            spouse: {
              '@type': 'Person',
              name: 'Jimmy Pesto',
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Denver',
              addressRegion: 'CO',
              postalCode: '80209',
              streetAddress: '7 S. Broadway',
            },
            addressStatus: 'current',
          },
        },
        name: 'Tine Belcher',
      },
      context: getVCCourtRecordSearchPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/CourtRecordSearchCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/CourtRecordSearchPerson",
                ],
                "https://schema.affinity-project.org/hasCourtRecordSearch": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/CourtRecordSearch",
                    ],
                    "https://schema.affinity-project.org/query": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/CourtRecordSearchQuery",
                        ],
                        "https://schema.affinity-project.org/addressStatus": Array [
                          Object {
                            "@value": "current",
                          },
                        ],
                        "https://schema.org/address": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/PostalAddress",
                            ],
                            "https://schema.org/addressLocality": Array [
                              Object {
                                "@value": "Denver",
                              },
                            ],
                            "https://schema.org/addressRegion": Array [
                              Object {
                                "@value": "CO",
                              },
                            ],
                            "https://schema.org/postalCode": Array [
                              Object {
                                "@value": "80209",
                              },
                            ],
                            "https://schema.org/streetAddress": Array [
                              Object {
                                "@value": "7 S. Broadway",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/parent": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/Person",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Bob Belcher",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/spouse": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/Person",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Jimmy Pesto",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/result": Array [
                      Object {
                        "@value": "pass",
                      },
                    ],
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Tine Belcher",
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

  it('expands correctly with address as string', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCCourtRecordSearchPersonV1, VCSCourtRecordSearchPersonV1>({
      type: 'CourtRecordSearchCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'CourtRecordSearchPerson'],
        hasCourtRecordSearch: {
          '@type': 'CourtRecordSearch',
          result: 'pass',
          query: {
            '@type': 'CourtRecordSearchQuery',
            parent: {
              '@type': 'Person',
              name: 'Bob Belcher',
            },
            spouse: {
              '@type': 'Person',
              name: 'Jimmy Pesto',
            },
            address: '7 S. Broadway, Denver CO 80209',
            addressStatus: 'current',
            birthDate: '2000-01-01',
          },
        },
        name: 'Tine Belcher',
      },
      context: getVCCourtRecordSearchPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/CourtRecordSearchCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/CourtRecordSearchPerson",
                ],
                "https://schema.affinity-project.org/hasCourtRecordSearch": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/CourtRecordSearch",
                    ],
                    "https://schema.affinity-project.org/query": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/CourtRecordSearchQuery",
                        ],
                        "https://schema.affinity-project.org/addressStatus": Array [
                          Object {
                            "@value": "current",
                          },
                        ],
                        "https://schema.org/address": Array [
                          Object {
                            "@value": "7 S. Broadway, Denver CO 80209",
                          },
                        ],
                        "https://schema.org/birthDate": Array [
                          Object {
                            "@value": "2000-01-01",
                          },
                        ],
                        "https://schema.org/parent": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/Person",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Bob Belcher",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/spouse": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/Person",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Jimmy Pesto",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/result": Array [
                      Object {
                        "@value": "pass",
                      },
                    ],
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Tine Belcher",
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
