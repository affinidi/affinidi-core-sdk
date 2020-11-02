import { VCIDDocumentPersonV1, VCSIDDocumentPersonV1, getVCIDDocumentPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCIDDocumentPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCIDDocumentPersonV1, VCSIDDocumentPersonV1>({
      type: 'IDDocumentCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'IDDocumentPerson'],
        hasIDDocument: {
          '@type': ['Role', 'IDDocumentRole'],
          authenticationResult: 'result',
          selfieImage: 'base64:...',
          faceMatch: {
            '@type': 'IDDocumentFaceMatch',
            isMatch: true,
            score: 100,
            identifier: 1234,
          },
          hasIDDocument: {
            '@type': ['CreativeWork', 'IDDocument'],
            issuer: {
              '@type': 'State',
              name: 'Washington',
            },
            documentType: 'type',
            issueDate: 'date',
            issueType: 'type',
            expirationDate: 'date',
            classificationMethod: 'automatic',
            idClass: 'birth_certificate',
            idClassName: 'className',
            countryCode: 'code',
            frontImage: 'base64:...',
            backImage: 'base64:...',
            generic: true,
            keesingCode: 'code',
          },
        },
        name: 'Bob Belcher',
      },
      context: getVCIDDocumentPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/IDDocumentCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/IDDocumentPerson",
                ],
                "https://schema.affinity-project.org/hasIDDocument": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Role",
                      "https://schema.affinity-project.org/IDDocumentRole",
                    ],
                    "https://schema.affinity-project.org/authenticationResult": Array [
                      Object {
                        "@value": "result",
                      },
                    ],
                    "https://schema.affinity-project.org/faceMatch": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/IDDocumentFaceMatch",
                        ],
                        "https://schema.affinity-project.org/isMatch": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/score": Array [
                          Object {
                            "@value": 100,
                          },
                        ],
                        "https://schema.org/identifier": Array [
                          Object {
                            "@value": 1234,
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasIDDocument": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/CreativeWork",
                          "https://schema.affinity-project.org/IDDocument",
                        ],
                        "https://schema.affinity-project.org/backImage": Array [
                          Object {
                            "@value": "base64:...",
                          },
                        ],
                        "https://schema.affinity-project.org/classificationMethod": Array [
                          Object {
                            "@value": "automatic",
                          },
                        ],
                        "https://schema.affinity-project.org/countryCode": Array [
                          Object {
                            "@value": "code",
                          },
                        ],
                        "https://schema.affinity-project.org/documentType": Array [
                          Object {
                            "@value": "type",
                          },
                        ],
                        "https://schema.affinity-project.org/expirationDate": Array [
                          Object {
                            "@value": "date",
                          },
                        ],
                        "https://schema.affinity-project.org/frontImage": Array [
                          Object {
                            "@value": "base64:...",
                          },
                        ],
                        "https://schema.affinity-project.org/generic": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/idClass": Array [
                          Object {
                            "@value": "birth_certificate",
                          },
                        ],
                        "https://schema.affinity-project.org/idClassName": Array [
                          Object {
                            "@value": "className",
                          },
                        ],
                        "https://schema.affinity-project.org/issueDate": Array [
                          Object {
                            "@value": "date",
                          },
                        ],
                        "https://schema.affinity-project.org/issueType": Array [
                          Object {
                            "@value": "type",
                          },
                        ],
                        "https://schema.affinity-project.org/issuer": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/State",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Washington",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/keesingCode": Array [
                          Object {
                            "@value": "code",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/selfieImage": Array [
                      Object {
                        "@value": "base64:...",
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
