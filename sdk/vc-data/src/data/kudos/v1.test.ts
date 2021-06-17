import { VCKudosPersonV1, VCSKudosPersonV1, getVCKudosPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCKudosPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCKudosPersonV1, VCSKudosPersonV1>({
      type: 'KudosCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'KudosPerson'],
        name: 'Bob Belcher',
        team: 'gde',
        title: 'Software Engineer',
        message: 'Kudos to you',
        awardedDate: '17-06-2021',
        awardedBy: 'Sridharan Jayabal',
        expiryDate: '17-06-2022',
        certificate: 'link here',
      },
      context: getVCKudosPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/KudosCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/KudosPerson",
                ],
                "https://schema.org/awardedBy": Array [
                  Object {
                    "@value": "Sridharan Jayabal",
                  },
                ],
                "https://schema.org/awardedDate": Array [
                  Object {
                    "@value": "17-06-2021",
                  },
                ],
                "https://schema.org/certificate": Array [
                  Object {
                    "@value": "link here",
                  },
                ],
                "https://schema.org/expiryDate": Array [
                  Object {
                    "@value": "17-06-2022",
                  },
                ],
                "https://schema.org/message": Array [
                  Object {
                    "@value": "Kudos to you",
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob Belcher",
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
