import {
  VCPhonePersonV1,
  VCSPhonePersonV1,
  getVCPhonePersonV1Context,
  VCPhoneOrganizationV1,
  VCSPhoneOrganizationV1,
  getVCPhoneOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCPhonePersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCPhonePersonV1, VCSPhonePersonV1>({
      type: 'PhoneCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '555 555 5555',
        name: 'Bob Belcher',
      },
      context: getVCPhonePersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/PhoneCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/PhonePerson",
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob Belcher",
                  },
                ],
                "https://schema.org/telephone": Array [
                  Object {
                    "@value": "555 555 5555",
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

describe('VCPhoneOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCPhoneOrganizationV1, VCSPhoneOrganizationV1>({
      type: 'PhoneCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'PhoneOrganization'],
        telephone: '555 555 5555',
        name: "Bob's Burgers",
      },
      context: getVCPhoneOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/PhoneCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/PhoneOrganization",
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob's Burgers",
                  },
                ],
                "https://schema.org/telephone": Array [
                  Object {
                    "@value": "555 555 5555",
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
