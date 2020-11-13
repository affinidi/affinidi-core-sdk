import {
  VCEmploymentPersonV1,
  VCSEmploymentPersonV1,
  getVCEmploymentPersonV1Context,
  VCEmploymentOrganizationV1,
  VCSEmploymentOrganizationV1,
  getVCEmploymentOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEmploymentPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmploymentPersonV1, VCSEmploymentPersonV1>({
      type: 'EmploymentCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EmploymentPerson'],
        worksFor: {
          '@type': ['EmployeeRole', 'PersonEmployeeRoleE'],
          reference: {
            '@type': 'ContactPoint',
            name: 'Linda Belcher',
            email: 'lindabelcher@gmail.com',
          },
          skills: ['burger', 'fries'],
          offerLetter: 'https://google.com',
          experienceLetter: 'https://google.com',
          worksFor: {
            '@type': ['Organization', 'OrganizationE'],
            name: "Bob's Burgers",
          },
          salary: {
            '@type': ['Salary'],
            gross: {
              '@type': 'MonetaryAmount',
              value: 10000,
              currency: 'INR',
            },
            net: {
              '@type': 'MonetaryAmount',
              value: 8000,
              currency: 'INR',
            },
            frequency: 'Monthly',
          },
        },
        name: 'Bob Belcher',
      },
      context: getVCEmploymentPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmploymentCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/EmploymentPerson",
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
                      "https://schema.affinity-project.org/PersonEmployeeRoleE",
                    ],
                    "https://schema.affinity-project.org/experienceLetter": Array [
                      Object {
                        "@value": "https://google.com",
                      },
                    ],
                    "https://schema.affinity-project.org/offerLetter": Array [
                      Object {
                        "@value": "https://google.com",
                      },
                    ],
                    "https://schema.affinity-project.org/reference": Array [
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
                    "https://schema.affinity-project.org/salary": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/Salary",
                        ],
                        "https://schema.affinity-project.org/frequency": Array [
                          Object {
                            "@value": "Monthly",
                          },
                        ],
                        "https://schema.affinity-project.org/gross": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "INR",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": 10000,
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/net": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "INR",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": 8000,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/skills": Array [
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
  it('Reference can be an array', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmploymentPersonV1, VCSEmploymentPersonV1>({
      type: 'EmploymentCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EmploymentPerson'],
        worksFor: {
          '@type': ['EmployeeRole', 'PersonEmployeeRoleE'],
          reference: [
            {
              '@type': 'ContactPoint',
              name: 'Linda Belcher',
              email: 'lindabelcher@gmail.com',
            },
            {
              '@type': 'ContactPoint',
              name: 'Gene Belcher',
              email: 'genebelcher@gmail.com',
            },
          ],
          skills: ['burger', 'fries'],
          offerLetter: 'https://google.com',
          experienceLetter: 'https://google.com',
          worksFor: {
            '@type': ['Organization', 'OrganizationE'],
            name: "Bob's Burgers",
          },
          salary: {
            '@type': ['Salary'],
            gross: {
              '@type': 'MonetaryAmount',
              value: 10000,
              currency: 'INR',
            },
            net: {
              '@type': 'MonetaryAmount',
              value: 8000,
              currency: 'INR',
            },
            frequency: 'Monthly',
          },
        },
        name: 'Bob Belcher',
      },
      context: getVCEmploymentPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmploymentCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/EmploymentPerson",
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
                      "https://schema.affinity-project.org/PersonEmployeeRoleE",
                    ],
                    "https://schema.affinity-project.org/experienceLetter": Array [
                      Object {
                        "@value": "https://google.com",
                      },
                    ],
                    "https://schema.affinity-project.org/offerLetter": Array [
                      Object {
                        "@value": "https://google.com",
                      },
                    ],
                    "https://schema.affinity-project.org/reference": Array [
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
                      Object {
                        "@type": Array [
                          "https://schema.org/ContactPoint",
                        ],
                        "https://schema.org/email": Array [
                          Object {
                            "@value": "genebelcher@gmail.com",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "Gene Belcher",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/salary": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/Salary",
                        ],
                        "https://schema.affinity-project.org/frequency": Array [
                          Object {
                            "@value": "Monthly",
                          },
                        ],
                        "https://schema.affinity-project.org/gross": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "INR",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": 10000,
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/net": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "INR",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": 8000,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/skills": Array [
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

describe('VCEmploymentOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmploymentOrganizationV1, VCSEmploymentOrganizationV1>({
      type: 'EmploymentCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'EmploymentOrganization'],
        member: {
          '@type': ['EmployeeRole', 'OrganizationEmployeeRole'],
          member: {
            '@type': ['Person', 'PersonE'],
            name: 'Bob Belcher',
          },
        },
        name: "Bob's Burgers",
      },
      context: getVCEmploymentOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmploymentCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/EmploymentOrganization",
                ],
                "https://schema.org/member": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/EmployeeRole",
                      "https://schema.affinity-project.org/OrganizationEmployeeRole",
                    ],
                    "https://schema.org/member": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Person",
                          "https://schema.affinity-project.org/PersonE",
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
