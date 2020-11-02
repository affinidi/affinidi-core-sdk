import {
  VCNamePersonV1,
  VCSNamePersonV1,
  getVCNamePersonV1Context,
  VCNameOrganizationV1,
  VCSNameOrganizationV1,
  getVCNameOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCNamePersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCNamePersonV1, VCSNamePersonV1>({
      type: 'NameCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'NamePerson'],
        name: 'Bob Belcher',
        email: 'bobbelcher@gmail.com',
      },
      context: getVCNamePersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/NameCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/NamePerson",
                ],
                "https://schema.org/email": Array [
                  Object {
                    "@value": "bobbelcher@gmail.com",
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

describe('VCNameOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCNameOrganizationV1, VCSNameOrganizationV1>({
      type: 'NameCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'NameOrganization'],
        name: "Bob's Burgers",
        email: 'bobbelcher@gmail.com',
      },
      context: getVCNameOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/NameCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/NameOrganization",
                ],
                "https://schema.org/email": Array [
                  Object {
                    "@value": "bobbelcher@gmail.com",
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
        "https://www.w3.org/2018/credentials#holder": Array [
          Object {
            "@id": "did:elem:123",
          },
        ],
      }
    `)
  })
})
