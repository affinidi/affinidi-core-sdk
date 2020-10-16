import { VCDOBPersonV1, VCSDOBPersonV1, getVCDOBPersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCDOBPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCDOBPersonV1, VCSDOBPersonV1>({
      type: 'DOBCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'DOBPerson'],
        birthDate: '2020-06-01T00:00:00.000Z',
        name: 'Bob Belcher',
      },
      context: getVCDOBPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/DOBCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/DOBPerson",
                ],
                "https://schema.org/birthDate": Array [
                  Object {
                    "@value": "2020-06-01T00:00:00.000Z",
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
