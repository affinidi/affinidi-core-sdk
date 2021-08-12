import { VCGrantWinnerV1, VCSGrantWinnerV1, getVCGrantWinnerCredentialV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCGrantWinnerV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCGrantWinnerV1, VCSGrantWinnerV1>({
      type: 'GrantWinnerCredentialV1',
      data: {
        '@type': ['MonetaryGrant', 'GrantWinner'],
        name: 'Huge Amounts of Grant',
        amount: 2000000,
        dateAwarded: '11-08-2021',
        grantOwner: {
          name: 'Bright Fintech',
        },
        funder: {
          name: 'Monetary Authority',
          employee: {
            email: 'funder@organiztion.com',
            name: 'some name',
            jobTitle: 'CFO',
            telephone: '+91 987654321',
          },
        },
      },
      context: getVCGrantWinnerCredentialV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/GrantWinnerCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/MonetaryGrant",
                  "https://schema.affinity-project.org/GrantWinner",
                ],
                "https://schema.affinity-project.org/dateAwarded": Array [
                  Object {
                    "@value": "11-08-2021",
                  },
                ],
                "https://schema.org/amount": Array [
                  Object {
                    "@value": 2000000,
                  },
                ],
                "https://schema.org/funder": Array [
                  Object {
                    "https://schema.org/employee": Array [
                      Object {
                        "https://schema.org/email": Array [
                          Object {
                            "@value": "funder@organiztion.com",
                          },
                        ],
                        "https://schema.org/jobTitle": Array [
                          Object {
                            "@value": "CFO",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "some name",
                          },
                        ],
                        "https://schema.org/telephone": Array [
                          Object {
                            "@value": "+91 987654321",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Monetary Authority",
                      },
                    ],
                  },
                ],
                "https://schema.org/grantOwner": Array [
                  Object {
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Bright Fintech",
                      },
                    ],
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Huge Amounts of Grant",
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
