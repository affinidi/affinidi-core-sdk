import { VCEducationPersonV1, VCSEducationPersonV1, getVCEducationPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEducationPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEducationPersonV1, VCSEducationPersonV1>({
      type: 'EducationCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EducationPerson'],
        name: 'Bob Belcher',
        hasCredential: {
          '@type': 'EducationalOcupationalCredential',
          credentialCategory: 'degree',
          educationalLevel: 'Bachelor of Science',
          recognizedBy: {
            '@type': ['Organization', 'OrganizationE'],
            name: 'University of New York',
          },
          dateCreated: '2020-12-07',
          url: 'https://www.university.edu/credential/credentialId',
        },
      },
      context: getVCEducationPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EducationCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/EducationPerson",
                ],
                "https://schema.org/hasCredential": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/EducationalOcupationalCredential",
                    ],
                    "https://schema.org/credentialCategory": Array [
                      Object {
                        "@value": "degree",
                      },
                    ],
                    "https://schema.org/dateCreated": Array [
                      Object {
                        "@value": "2020-12-07",
                      },
                    ],
                    "https://schema.org/educationalLevel": Array [
                      Object {
                        "@value": "Bachelor of Science",
                      },
                    ],
                    "https://schema.org/recognizedBy": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Organization",
                          "https://schema.affinity-project.org/OrganizationE",
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "University of New York",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/url": Array [
                      Object {
                        "@value": "https://www.university.edu/credential/credentialId",
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
