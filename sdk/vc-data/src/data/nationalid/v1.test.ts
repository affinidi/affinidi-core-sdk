import {
  VCNatIDNumPersonV1,
  VCSNatIDNumPersonV1,
  getVCNatIDNumPersonV1Context,
  VCNatIDNumOrganizationV1,
  VCSNatIDNumOrganizationV1,
  getVCNatIDNumOrganizationV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCNatIDNumPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCNatIDNumPersonV1, VCSNatIDNumPersonV1>({
      type: 'NatIDNumCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'NatIDNumPerson'],
        nationality: {
          '@type': ['Role', 'NationalityRole'],
          identifier: {
            '@type': ['PropertyValue', 'NatPropertyValue'],
            propertyID: 'SSN',
            value: '123-12-1234',
          },
          nationality: {
            '@type': 'Country',
            name: 'United States Of America',
          },
        },
      },
      context: getVCNatIDNumPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/NatIDNumCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/NatIDNumPerson",
                ],
                "https://schema.affinity-project.org/nationality": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Role",
                      "https://schema.affinity-project.org/NationalityRole",
                    ],
                    "https://schema.affinity-project.org/nationality": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Country",
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "United States Of America",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/identifier": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PropertyValue",
                          "https://schema.affinity-project.org/NatPropertyValue",
                        ],
                        "https://schema.affinity-project.org/propertyID": Array [
                          Object {
                            "@value": "SSN",
                          },
                        ],
                        "https://schema.org/value": Array [
                          Object {
                            "@value": "123-12-1234",
                          },
                        ],
                      },
                    ],
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

describe('VCNatIDNumOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCNatIDNumOrganizationV1, VCSNatIDNumOrganizationV1>({
      type: 'NatIDNumCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'NatIDNumOrganization'],
        nationality: {
          '@type': ['Role', 'NationalityRole'],
          identifier: {
            '@type': ['PropertyValue', 'NatPropertyValue'],
            propertyID: 'Business ID',
            value: '123-123-123',
          },
          nationality: {
            '@type': 'Country',
            name: 'United States Of America',
          },
        },
      },
      context: getVCNatIDNumOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/NatIDNumCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/NatIDNumOrganization",
                ],
                "https://schema.affinity-project.org/nationality": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Role",
                      "https://schema.affinity-project.org/NationalityRole",
                    ],
                    "https://schema.affinity-project.org/nationality": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Country",
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "United States Of America",
                          },
                        ],
                      },
                    ],
                    "https://schema.org/identifier": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PropertyValue",
                          "https://schema.affinity-project.org/NatPropertyValue",
                        ],
                        "https://schema.affinity-project.org/propertyID": Array [
                          Object {
                            "@value": "Business ID",
                          },
                        ],
                        "https://schema.org/value": Array [
                          Object {
                            "@value": "123-123-123",
                          },
                        ],
                      },
                    ],
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
