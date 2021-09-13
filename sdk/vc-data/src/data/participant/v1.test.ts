import { VCParticipantPersonV1, VCSParticipantPersonV1, getVCParticipantPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCParticipantPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCParticipantPersonV1, VCSParticipantPersonV1>({
      type: 'ParticipantCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'ParticipantPerson'],
        firstName: 'Bob',
        lastName: 'Belcher',
        participantEmail: 'bob@thebuilder.com',
        dateOfBirth: '21-09-1994',
        eventName: 'PoCathon 2021',
        eventDescription: 'POC for verifiable credentials',
        transactionLink: '',
        otherTeamMembers: 'Alice',
        participationDate: '09-06-2021',
        awardedBy: 'Affinidi',
        certificate: '',
        profileLink: 'linkedin.com',
      },
      context: getVCParticipantPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/ParticipantCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/ParticipantPerson",
                ],
                "https://schema.org/awardedBy": Array [
                  Object {
                    "@value": "Affinidi",
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
                "https://schema.org/participationDate": Array [
                  Object {
                    "@value": "09-06-2021",
                  },
                ],
                "https://schema.org/profileLink": Array [
                  Object {
                    "@value": "linkedin.com",
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
