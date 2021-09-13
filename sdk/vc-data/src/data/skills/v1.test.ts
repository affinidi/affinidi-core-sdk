import { VCSkillsPersonV1, VCSSkillsPersonV1, getVCSkillsPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCSkillsPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCSkillsPersonV1, VCSSkillsPersonV1>({
      type: 'SkillsCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'SkillsPerson'],
        firstName: 'Bob',
        lastName: 'Belcher',
        email: 'bob@thebuilder.com',
        dateOfBirth: '21-09-1994',
        skillName: 'Skills 2021',
        awardedDate: '09-06-2021',
        awardedBy: 'Affinidi',
        skillDescription: 'Awesome Skill',
        profileLink: 'linkedin.com',
      },
      context: getVCSkillsPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/SkillsCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/SkillsPerson",
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
                "https://schema.org/skillDescription": Array [
                  Object {
                    "@value": "Awesome Skill",
                  },
                ],
                "https://schema.org/dateOfBirth": Array [
                  Object {
                    "@value": "21-09-1994",
                  },
                ],
                "https://schema.org/skillsName": Array [
                  Object {
                    "@value": "Skills 2021",
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
                "https://schema.org/email": Array [
                  Object {
                    "@value": "bob@thebuilder.com",
                  },
                ],
                "https://schema.org/profileLink": Array [
                  Object {
                    "@value": "linkedin.com",
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
