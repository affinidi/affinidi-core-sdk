import { VCWinnerPersonV1, VCSWinnerPersonV1, getVCWinnerPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCWinnerPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCWinnerPersonV1, VCSWinnerPersonV1>({
      type: 'WinnerCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'WinnerPerson'],
        firstName: 'Bob',
        lastName: 'Belcher',
        participantEmail: 'bob@thebuilder.com',
        dateOfBirth: '21-09-1994',
        eventName: 'PoCathon 2021',
        eventDescription: 'POC for verifiable credentials',
        prizeName: 'First Prize',
        prizeCurrency: 'Eth',
        prizeAmount: '2500',
        transactionLink: '',
        otherTeamMembers: 'Alice',
        awardedDate: '09-06-2021',
        awardedBy: 'Affinidi',
        certificate: '',
      },
      context: getVCWinnerPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/WinnerCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/WinnerPerson",
                ],
                "https://schema.org/awardedBy": Array [
                  Object {
                    "@value": "Affinidi",
                  },
                ],
                "https://schema.org/awardedDate": Array [
                  Object {
                    "@value": "09-06-2021",
                  },
                ],
                "https://schema.org/certificate": Array [
                  Object {
                    "@value": "",
                  },
                ],
                "https://schema.org/dateOfBirth": Array [
                  Object {
                    "@value": "21-09-1994",
                  },
                ],
                "https://schema.org/eventDescription": Array [
                  Object {
                    "@value": "POC for verifiable credentials",
                  },
                ],
                "https://schema.org/eventName": Array [
                  Object {
                    "@value": "PoCathon 2021",
                  },
                ],
                "https://schema.org/firstName": Array [
                  Object {
                    "@value": "Bob",
                  },
                ],
                "https://schema.org/lastName": Array [
                  Object {
                    "@value": "Belcher",
                  },
                ],
                "https://schema.org/otherTeamMembers": Array [
                  Object {
                    "@value": "Alice",
                  },
                ],
                "https://schema.org/participantEmail": Array [
                  Object {
                    "@value": "bob@thebuilder.com",
                  },
                ],
                "https://schema.org/prizeAmount": Array [
                  Object {
                    "@value": "2500",
                  },
                ],
                "https://schema.org/prizeCurrency": Array [
                  Object {
                    "@value": "Eth",
                  },
                ],
                "https://schema.org/prizeName": Array [
                  Object {
                    "@value": "First Prize",
                  },
                ],
                "https://schema.org/transactionLink": Array [
                  Object {
                    "@value": "",
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
