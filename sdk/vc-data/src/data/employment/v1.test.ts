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
          worksFor: {
            '@type': ['Organization', 'OrganizationE'],
            name: "Bob's Burgers",
          },
        },
        name: 'Bob Belcher',
      },
      context: getVCEmploymentPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
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
      }
    `)
  })
})
