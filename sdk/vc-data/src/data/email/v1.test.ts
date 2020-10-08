import {
  VCEmailPersonV1,
  VCSEmailPersonV1,
  getVCEmailPersonV1Context,
  VCEmailOrganizationV1,
  VCSEmailOrganizationV1,
  getVCEmailOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEmailPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmailPersonV1, VCSEmailPersonV1>({
      type: 'EmailCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EmailPerson'],
        email: 'bobbelcher@gmail.com',
        name: 'Bob Belcher',
      },
      context: getVCEmailPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmailCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/EmailPerson",
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

describe('VCEmailOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmailOrganizationV1, VCSEmailOrganizationV1>({
      type: 'EmailCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'EmailOrganization'],
        email: 'bobbelcher@gmail.com',
        name: "Bob's Burgers",
      },
      context: getVCEmailOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EmailCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/EmailOrganization",
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
