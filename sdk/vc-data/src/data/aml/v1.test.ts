import {
  VCAMLPersonV1,
  VCSAMLPersonV1,
  getVCAMLPersonV1Context,
  VCAMLOrganizationV1,
  VCSAMLOrganizationV1,
  getVCAMLOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCAMLPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAMLPersonV1, VCSAMLPersonV1>({
      type: 'AMLCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'AMLPerson'],
        hasAMLSeach: {
          '@type': 'AMLSearch',
          hitLocation: 'location',
          hitNumber: 1,
          lists: [
            {
              '@type': 'AMLList',
              name: 'My AML List',
              url: 'https://amllist.com',
            },
          ],
          recordId: '1234',
          identifier: '1234',
          score: '0',
          hits: [
            {
              '@type': 'AMLHit',
              identifier: '1234',
              name: 'AML Hit 1',
            },
          ],
          flagType: 'type',
          comment: 'some comment',
        },
        name: 'Bob Belcher',
      },
      context: getVCAMLPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AMLCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/AMLPerson",
                ],
                "https://schema.affinity-project.org/hasAMLSeach": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/AMLSearch",
                    ],
                    "https://schema.affinity-project.org/comment": Array [
                      Object {
                        "@value": "some comment",
                      },
                    ],
                    "https://schema.affinity-project.org/flagType": Array [
                      Object {
                        "@value": "type",
                      },
                    ],
                    "https://schema.affinity-project.org/hitLocation": Array [
                      Object {
                        "@value": "location",
                      },
                    ],
                    "https://schema.affinity-project.org/hitNumber": Array [
                      Object {
                        "@value": 1,
                      },
                    ],
                    "https://schema.affinity-project.org/hits": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AMLHit",
                        ],
                        "https://schema.affinity-project.org/identifier": Array [
                          Object {
                            "@value": "1234",
                          },
                        ],
                        "https://schema.affinity-project.org/name": Array [
                          Object {
                            "@value": "AML Hit 1",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/identifier": Array [
                      Object {
                        "@value": "1234",
                      },
                    ],
                    "https://schema.affinity-project.org/lists": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AMLList",
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "My AML List",
                          },
                        ],
                        "https://schema.org/url": Array [
                          Object {
                            "@value": "https://amllist.com",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/recordId": Array [
                      Object {
                        "@value": "1234",
                      },
                    ],
                    "https://schema.affinity-project.org/score": Array [
                      Object {
                        "@value": "0",
                      },
                    ],
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob Belcher",
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

describe('VCAMLOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAMLOrganizationV1, VCSAMLOrganizationV1>({
      type: 'AMLCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'AMLOrganization'],
        hasAMLSeach: {
          '@type': 'AMLSearch',
          hitLocation: 'location',
          hitNumber: 1,
          lists: [
            {
              '@type': 'AMLList',
              name: 'My AML List',
              url: 'https://amllist.com',
            },
          ],
          recordId: '1234',
          identifier: '1234',
          score: '0',
          hits: [
            {
              '@type': 'AMLHit',
              identifier: '1234',
              name: 'AML Hit 1',
            },
          ],
          flagType: 'type',
          comment: 'some comment',
        },
        name: "Bob's Burgers",
      },
      context: getVCAMLOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AMLCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/AMLOrganization",
                ],
                "https://schema.affinity-project.org/hasAMLSeach": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/AMLSearch",
                    ],
                    "https://schema.affinity-project.org/comment": Array [
                      Object {
                        "@value": "some comment",
                      },
                    ],
                    "https://schema.affinity-project.org/flagType": Array [
                      Object {
                        "@value": "type",
                      },
                    ],
                    "https://schema.affinity-project.org/hitLocation": Array [
                      Object {
                        "@value": "location",
                      },
                    ],
                    "https://schema.affinity-project.org/hitNumber": Array [
                      Object {
                        "@value": 1,
                      },
                    ],
                    "https://schema.affinity-project.org/hits": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AMLHit",
                        ],
                        "https://schema.affinity-project.org/identifier": Array [
                          Object {
                            "@value": "1234",
                          },
                        ],
                        "https://schema.affinity-project.org/name": Array [
                          Object {
                            "@value": "AML Hit 1",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/identifier": Array [
                      Object {
                        "@value": "1234",
                      },
                    ],
                    "https://schema.affinity-project.org/lists": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AMLList",
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "My AML List",
                          },
                        ],
                        "https://schema.org/url": Array [
                          Object {
                            "@value": "https://amllist.com",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/recordId": Array [
                      Object {
                        "@value": "1234",
                      },
                    ],
                    "https://schema.affinity-project.org/score": Array [
                      Object {
                        "@value": "0",
                      },
                    ],
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob's Burgers",
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
