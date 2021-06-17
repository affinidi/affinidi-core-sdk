import { VCEmployeePersonV1, VCSEmployeePersonV1, getVCEmployeePersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEmployeePersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmployeePersonV1, VCSEmployeePersonV1>({
      type: 'EmployeeCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EmployeePerson'],
        name: 'Bob Belcher',
        officialEmail: 'bob.b@affinidi.com',
        organizationName: 'Affinidi',
        title: 'Software Engineer',
        employmentType: 'Full-time',
        dateOfJoining: '15-02-2021',
        personalEmail: 'bob@gmail.com',
        phoneNumber: '123456789',
        employeeAddress: '9, 9th street, Koramangala, Bangalore',
        organizationAddress: '9, 9th street, Koramangala, Bangalore',
        organizationLogo: 'logo url here',
        dateOfRelieving: 'relieving date here',
        team: 'gde',
        responsibilities: 'writing code',
        otherDetails: {
          projects: ['onboarding'],
        },
      },
      context: getVCEmployeePersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmployeeCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/EmployeePerson",
                ],
                "https://schema.org/dateOfJoining": Array [
                  Object {
                    "@value": "15-02-2021",
                  },
                ],
                "https://schema.org/dateOfRelieving": Array [
                  Object {
                    "@value": "relieving date here",
                  },
                ],
                "https://schema.org/employeeAddress": Array [
                  Object {
                    "@value": "9, 9th street, Koramangala, Bangalore",
                  },
                ],
                "https://schema.org/employmentType": Array [
                  Object {
                    "@value": "Full-time",
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob Belcher",
                  },
                ],
                "https://schema.org/officialEmail": Array [
                  Object {
                    "@value": "bob.b@affinidi.com",
                  },
                ],
                "https://schema.org/organizationAddress": Array [
                  Object {
                    "@value": "9, 9th street, Koramangala, Bangalore",
                  },
                ],
                "https://schema.org/organizationLogo": Array [
                  Object {
                    "@value": "logo url here",
                  },
                ],
                "https://schema.org/organizationName": Array [
                  Object {
                    "@value": "Affinidi",
                  },
                ],
                "https://schema.org/otherDetails": Array [
                  Object {
                    "https://schema.org/projects": Array [
                      Object {
                        "@value": "onboarding",
                      },
                    ],
                  },
                ],
                "https://schema.org/personalEmail": Array [
                  Object {
                    "@value": "bob@gmail.com",
                  },
                ],
                "https://schema.org/phoneNumber": Array [
                  Object {
                    "@value": "123456789",
                  },
                ],
                "https://schema.org/responsibilities": Array [
                  Object {
                    "@value": "writing code",
                  },
                ],
                "https://schema.org/team": Array [
                  Object {
                    "@value": "gde",
                  },
                ],
                "https://schema.org/title": Array [
                  Object {
                    "@value": "Software Engineer",
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
