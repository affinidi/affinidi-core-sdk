import { VCGenderPersonV1, VCSGenderPersonV1, getVCGenderPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCGenderPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCGenderPersonV1, VCSGenderPersonV1>({
      type: 'GenderCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'GenderPerson'],
        gender: 'Male',
        name: 'Bob Belcher',
      },
      context: getVCGenderPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/GenderCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/GenderPerson",
                ],
                "https://schema.org/gender": Array [
                  Object {
                    "@value": "Male",
                  },
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
        "https://www.w3.org/2018/credentials#holder": Array [
          Object {
            "@id": "did:elem:123",
          },
        ],
      }
    `)
  })
})
