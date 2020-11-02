import { VCLeanEntityOrganizationV1, VCSLeanEntityOrganizationV1, getVCLeanEntityOrganizationV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCLeanEntityOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCLeanEntityOrganizationV1, VCSLeanEntityOrganizationV1>({
      type: 'LeanEntityCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'LeanEntityOrganization'],
        name: "Bob's Burgers",
        hasCredential: [
          {
            '@type': ['EducationalOccupationalCredential', 'Credential'],
            dateRevoked: 'date',
            recognizedBy: {
              '@type': 'State',
              name: 'Washington',
            },
          },
          {
            '@type': ['EducationalOccupationalCredential', 'Credential', 'OrganizationalCredential'],
            credentialCategory: 'incorporation',
            active: true,
            recognizedBy: {
              '@type': 'State',
              name: 'Washington',
            },
          },
        ],
      },
      context: getVCLeanEntityOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/LeanEntityCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/LeanEntityOrganization",
                ],
                "https://schema.org/hasCredential": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/EducationalOccupationalCredential",
                      "https://schema.affinity-project.org/Credential",
                    ],
                    "https://schema.affinity-project.org/dateRevoked": Array [
                      Object {
                        "@value": "date",
                      },
                    ],
                    "https://schema.affinity-project.org/recognizedBy": Array [
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
                  },
                  Object {
                    "@type": Array [
                      "https://schema.org/EducationalOccupationalCredential",
                      "https://schema.affinity-project.org/Credential",
                      "https://schema.affinity-project.org/OrganizationalCredential",
                    ],
                    "https://schema.affinity-project.org/active": Array [
                      Object {
                        "@value": true,
                      },
                    ],
                    "https://schema.affinity-project.org/credentialCategory": Array [
                      Object {
                        "@value": "incorporation",
                      },
                    ],
                    "https://schema.affinity-project.org/recognizedBy": Array [
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
