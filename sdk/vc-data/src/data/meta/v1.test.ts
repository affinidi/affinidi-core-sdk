import {
  VCMetaPersonV1,
  VCSMetaPersonV1,
  getVCMetaPersonV1Context,
  VCMetaOrganizationV1,
  VCSMetaOrganizationV1,
  getVCMetaOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCMetaPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCMetaPersonV1, VCSMetaPersonV1>({
      type: 'MetaCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'MetaPerson'],
        name: 'Bob Belcher',
        receivedCredentials: {
          '@type': ['Role', 'ReceivedCredentialRole'],
          startDate: 'start',
          endDate: 'end',
          aggregatorDID: 'did:elem:...',
          typesSome: ['type 1'],
          typesAll: ['type 2'],
          typesNot: ['type 3'],
          contextsSome: ['context 1'],
          contextsAll: ['context 2'],
          contextsNot: ['context 3'],
          issuerDIDIn: ['did 1'],
          issuerDIDNotIn: ['did 2'],
          receivedCredentials: ['vc 1', 'vc 2'],
        },
      },
      context: getVCMetaPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/MetaCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/MetaPerson",
                ],
                "https://schema.affinity-project.org/receivedCredentials": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Role",
                      "https://schema.affinity-project.org/ReceivedCredentialRole",
                    ],
                    "https://schema.affinity-project.org/aggregatorDID": Array [
                      Object {
                        "@value": "did:elem:...",
                      },
                    ],
                    "https://schema.affinity-project.org/contextsAll": Array [
                      Object {
                        "@value": "context 2",
                      },
                    ],
                    "https://schema.affinity-project.org/contextsNot": Array [
                      Object {
                        "@value": "context 3",
                      },
                    ],
                    "https://schema.affinity-project.org/contextsSome": Array [
                      Object {
                        "@value": "context 1",
                      },
                    ],
                    "https://schema.affinity-project.org/issuerDIDIn": Array [
                      Object {
                        "@value": "did 1",
                      },
                    ],
                    "https://schema.affinity-project.org/issuerDIDNotIn": Array [
                      Object {
                        "@value": "did 2",
                      },
                    ],
                    "https://schema.affinity-project.org/receivedCredentials": Array [
                      Object {
                        "@value": "vc 1",
                      },
                      Object {
                        "@value": "vc 2",
                      },
                    ],
                    "https://schema.affinity-project.org/typesAll": Array [
                      Object {
                        "@value": "type 2",
                      },
                    ],
                    "https://schema.affinity-project.org/typesNot": Array [
                      Object {
                        "@value": "type 3",
                      },
                    ],
                    "https://schema.affinity-project.org/typesSome": Array [
                      Object {
                        "@value": "type 1",
                      },
                    ],
                    "https://schema.org/endDate": Array [
                      Object {
                        "@value": "end",
                      },
                    ],
                    "https://schema.org/startDate": Array [
                      Object {
                        "@value": "start",
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

describe('VCMetaOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCMetaOrganizationV1, VCSMetaOrganizationV1>({
      type: 'MetaCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'MetaOrganization'],
        name: 'Bob Belcher',
        receivedCredentials: {
          '@type': ['Role', 'ReceivedCredentialRole'],
          startDate: 'start',
          endDate: 'end',
          aggregatorDID: 'did:elem:...',
          typesSome: ['type 1'],
          typesAll: ['type 2'],
          typesNot: ['type 3'],
          contextsSome: ['context 1'],
          contextsAll: ['context 2'],
          contextsNot: ['context 3'],
          issuerDIDIn: ['did 1'],
          issuerDIDNotIn: ['did 2'],
          receivedCredentials: ['vc 1', 'vc 2'],
        },
      },
      context: getVCMetaOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/MetaCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/MetaOrganization",
                ],
                "https://schema.affinity-project.org/receivedCredentials": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Role",
                      "https://schema.affinity-project.org/ReceivedCredentialRole",
                    ],
                    "https://schema.affinity-project.org/aggregatorDID": Array [
                      Object {
                        "@value": "did:elem:...",
                      },
                    ],
                    "https://schema.affinity-project.org/contextsAll": Array [
                      Object {
                        "@value": "context 2",
                      },
                    ],
                    "https://schema.affinity-project.org/contextsNot": Array [
                      Object {
                        "@value": "context 3",
                      },
                    ],
                    "https://schema.affinity-project.org/contextsSome": Array [
                      Object {
                        "@value": "context 1",
                      },
                    ],
                    "https://schema.affinity-project.org/issuerDIDIn": Array [
                      Object {
                        "@value": "did 1",
                      },
                    ],
                    "https://schema.affinity-project.org/issuerDIDNotIn": Array [
                      Object {
                        "@value": "did 2",
                      },
                    ],
                    "https://schema.affinity-project.org/receivedCredentials": Array [
                      Object {
                        "@value": "vc 1",
                      },
                      Object {
                        "@value": "vc 2",
                      },
                    ],
                    "https://schema.affinity-project.org/typesAll": Array [
                      Object {
                        "@value": "type 2",
                      },
                    ],
                    "https://schema.affinity-project.org/typesNot": Array [
                      Object {
                        "@value": "type 3",
                      },
                    ],
                    "https://schema.affinity-project.org/typesSome": Array [
                      Object {
                        "@value": "type 1",
                      },
                    ],
                    "https://schema.org/endDate": Array [
                      Object {
                        "@value": "end",
                      },
                    ],
                    "https://schema.org/startDate": Array [
                      Object {
                        "@value": "start",
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
