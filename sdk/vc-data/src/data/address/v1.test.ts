import {
  VCAddressPersonV1,
  VCSAddressPersonV1,
  getVCAddressPersonV1Context,
  VCAddressOrganizationV1,
  VCSAddressOrganizationV1,
  getVCAddressOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCAddressPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAddressPersonV1, VCSAddressPersonV1>({
      type: 'AddressCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'AddressPerson'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Denver',
          addressRegion: 'CO',
          postalCode: '80209',
          streetAddress: '7 S. Broadway',
        },
        name: 'Bob Belcher',
      },
      context: getVCAddressPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AddressCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/AddressPerson",
                ],
                "https://schema.org/address": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/PostalAddress",
                    ],
                    "https://schema.org/addressLocality": Array [
                      Object {
                        "@value": "Denver",
                      },
                    ],
                    "https://schema.org/addressRegion": Array [
                      Object {
                        "@value": "CO",
                      },
                    ],
                    "https://schema.org/postalCode": Array [
                      Object {
                        "@value": "80209",
                      },
                    ],
                    "https://schema.org/streetAddress": Array [
                      Object {
                        "@value": "7 S. Broadway",
                      },
                    ],
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

describe('VCAddressOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAddressOrganizationV1, VCSAddressOrganizationV1>({
      type: 'AddressCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'AddressOrganization'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Denver',
          addressRegion: 'CO',
          postalCode: '80209',
          streetAddress: '7 S. Broadway',
        },
        name: "Bob's Burgers",
      },
      context: getVCAddressOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AddressCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/AddressOrganization",
                ],
                "https://schema.org/address": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/PostalAddress",
                    ],
                    "https://schema.org/addressLocality": Array [
                      Object {
                        "@value": "Denver",
                      },
                    ],
                    "https://schema.org/addressRegion": Array [
                      Object {
                        "@value": "CO",
                      },
                    ],
                    "https://schema.org/postalCode": Array [
                      Object {
                        "@value": "80209",
                      },
                    ],
                    "https://schema.org/streetAddress": Array [
                      Object {
                        "@value": "7 S. Broadway",
                      },
                    ],
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
