import { VCHackathonWinnerV1, VCSHackathonWinnerV1, getVCHackathonWinnerV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCGenderPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCHackathonWinnerV1, VCSHackathonWinnerV1>({
      type: 'HackathonWinnerCredentialV1',
      data: {
        '@type': ['Hackathon', 'HackathonE', 'HackathonWinner'],
        name: 'Insanely Glorified Hackathon',
        organizer: {
          legalName: 'Midas Touch Pte Ltd',
          employee: {
            name: 'Slatirbartfast',
            email: 'slatir@midas.sg',
            jobTitle: 'Managing Director',
          },
        },
        funder: [
          {
            name: 'Crypto Funds.com',
          },
        ],
        attendee: {
          legalName: 'Nth Fintech Unicorn',
          leiCode: 'A16Z112s',
        },
        workPerformed: {
          name: 'Generate fintech unicorns',
          award: 'Prize name',
        },
        awardDate: '26-14-2021',
      },
      context: getVCHackathonWinnerV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/HackathonWinnerCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Hackathon",
                  "https://schema.affinity-project.org/HackathonE",
                  "https://schema.affinity-project.org/HackathonWinner",
                ],
                "https://schema.org/attendee": Array [
                  Object {
                    "https://schema.org/legalName": Array [
                      Object {
                        "@value": "Nth Fintech Unicorn",
                      },
                    ],
                    "https://schema.org/leiCode": Array [
                      Object {
                        "@value": "A16Z112s",
                      },
                    ],
                  },
                ],
                "https://schema.org/awardDate": Array [
                  Object {
                    "@value": "26-14-2021",
                  },
                ],
                "https://schema.org/funder": Array [
                  Object {
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Crypto Funds.com",
                      },
                    ],
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Insanely Glorified Hackathon",
                  },
                ],
                "https://schema.org/organizer": Array [
                  Object {
                    "https://schema.org/employee": Array [
                      Object {
                        "https://schema.org/email": Array [
                          Object {
                            "@value": "slatir@midas.sg",
                          },
                        ],
                        "https://schema.org/jobTitle": Array [
                          Object {
                            "@value": "Managing Director",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "Slatirbartfast",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/legalName": Array [
                      Object {
                        "@value": "Midas Touch Pte Ltd",
                      },
                    ],
                  },
                ],
                "https://schema.org/workPerformed": Array [
                  Object {
                    "https://schema.org/award": Array [
                      Object {
                        "@value": "Prize name",
                      },
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Generate fintech unicorns",
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
