import { VCEmploymentOfferPersonV1, VCSEmploymentOfferPersonV1, getVCEmploymentOfferPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEmploymentOfferPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmploymentOfferPersonV1, VCSEmploymentOfferPersonV1>({
      type: 'EmploymentOfferCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EmploymentOfferPerson'],
        worksFor: {
          '@type': ['EmployeeRole', 'PersonEmployeeCandidateRoleE'],
          expectedStartDate: '2022-04-21T20:00',
          interview: {
            '@type': 'EmploymentInterview',
            interviewer: {
              '@type': 'ContactPoint',
              name: 'Tina Belcher',
              email: 'tinabelcher@gmail.com',
            },
            date: '2022-01-21T20:00',
            location: {
              '@type': 'PostalAddress',
              addressLocality: 'Denver',
              addressRegion: 'CO',
              postalCode: '80209',
              streetAddress: '7 S. Broadway',
            },
          },
          reference: {
            '@type': 'ContactPoint',
            name: 'Linda Belcher',
            email: 'lindabelcher@gmail.com',
          },
          skills: ['burger', 'fries'],
          worksFor: {
            '@type': ['Organization', 'OrganizationE'],
            name: "Bob's Burgers",
          },
        },
        name: 'Bob Belcher',
      },
      context: getVCEmploymentOfferPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmploymentOfferCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/EmploymentOfferPerson",
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob Belcher",
                  },
                ],
                "https://schema.org/worksFor": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/EmployeeRole",
                      "https://schema.affinity-project.org/PersonEmployeeCandidateRoleE",
                    ],
                    "https://schema.affinity-project.org/expectedStartDate": Array [
                      Object {
                        "@value": "2022-04-21T20:00",
                      },
                    ],
                    "https://schema.affinity-project.org/interview": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/EmploymentInterview",
                        ],
                        "https://schema.affinity-project.org/interviewer": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/ContactPoint",
                            ],
                            "https://schema.org/email": Array [
                              Object {
                                "@value": "tinabelcher@gmail.com",
                              },
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Tina Belcher",
                              },
                            ],
                          },
                        ],
                        "https://schema.org/date": Array [
                          Object {
                            "@value": "2022-01-21T20:00",
                          },
                        ],
                        "https://schema.org/location": Array [
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
                      },
                    ],
                    "https://schema.org/reference": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/ContactPoint",
                        ],
                        "https://schema.org/email": Array [
                          Object {
                            "@value": "lindabelcher@gmail.com",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "Linda Belcher",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/skills": Array [
                      Object {
                        "@value": "burger",
                      },
                      Object {
                        "@value": "fries",
                      },
                    ],
                    "https://schema.org/worksFor": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Organization",
                          "https://schema.affinity-project.org/OrganizationE",
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
