import { SimpleThing } from '@affinidi/vc-common'

import { combineContextEntries, ExpandThing } from '../util'
import { getBaseV1ContextEntries, PersonEV1, OrganizationEV1, CredentialV1, OrganizationalCredentialV1 } from './v1'

const jsonld = require('jsonld')

const baseContext = combineContextEntries({ entries: getBaseV1ContextEntries() })

const expand = async <D extends SimpleThing>(data: ExpandThing<D>) => {
  const obj = {
    '@context': baseContext,
    ...data,
  }

  const expanded = await jsonld.expand(obj)

  return expanded
}

describe('The base context entries', () => {
  it('expand a Person', async () => {
    const expanded = await expand<PersonEV1>({
      '@type': ['Person', 'PersonE'],
      name: 'Bob Belcher',
    })

    expect(expanded).toMatchInlineSnapshot(`
      Array [
        Object {
          "@type": Array [
            "/Person",
            "https://schema.affinity-project.org/PersonE",
          ],
          "https://schema.org/name": Array [
            Object {
              "@value": "Bob Belcher",
            },
          ],
        },
      ]
    `)
  })

  it('expand an Organization', async () => {
    const expanded = await expand<OrganizationEV1>({
      '@type': ['Organization', 'OrganizationE'],
      name: "Bob's Burgers",
      identifiers: [
        {
          '@type': 'PropertyValue',
          propertyID: 'PAN',
          value: 'ASDF0017F',
        },
      ],
    })

    expect(expanded).toMatchInlineSnapshot(`
      Array [
        Object {
          "@type": Array [
            "/Organization",
            "https://schema.affinity-project.org/OrganizationE",
          ],
          "https://schema.affinity-project.org/identifiers": Array [
            Object {
              "@type": Array [
                "/PropertyValue",
              ],
            },
          ],
          "https://schema.org/name": Array [
            Object {
              "@value": "Bob's Burgers",
            },
          ],
        },
      ]
    `)
  })

  it('expand a Credential', async () => {
    const expanded = await expand<CredentialV1>({
      '@type': ['EducationalOccupationalCredential', 'Credential'],
      educationalLevel: 'beginner',
      dateRevoked: 'date',
      recognizedBy: {
        '@type': 'City',
        name: 'Seattle',
      },
    })

    expect(expanded).toMatchInlineSnapshot(`
      Array [
        Object {
          "@type": Array [
            "/EducationalOccupationalCredential",
            "https://schema.affinity-project.org/Credential",
          ],
          "https://schema.affinity-project.org/dateRevoked": Array [
            Object {
              "@value": "date",
            },
          ],
          "https://schema.affinity-project.org/recognizedBy": Array [
            Object {
              "@type": Array [
                "/City",
              ],
            },
          ],
          "https://schema.org/educationalLevel": Array [
            Object {
              "@value": "beginner",
            },
          ],
        },
      ]
    `)
  })

  it('expand an OrganizationalCredential', async () => {
    const expanded = await expand<OrganizationalCredentialV1>({
      '@type': ['EducationalOccupationalCredential', 'Credential', 'OrganizationalCredential'],
      educationalLevel: 'beginner',
      dateRevoked: 'date',
      recognizedBy: {
        '@type': 'City',
        name: 'Seattle',
      },
      credentialCategory: 'incorporation',
      organizationType: 'llc',
      goodStanding: true,
      active: true,
      primaryJurisdiction: true,
      identifier: '1234',
    })

    expect(expanded).toMatchInlineSnapshot(`
      Array [
        Object {
          "@type": Array [
            "/EducationalOccupationalCredential",
            "https://schema.affinity-project.org/Credential",
            "https://schema.affinity-project.org/OrganizationalCredential",
          ],
          "https://schema.affinity-project.org/active": Array [
            Object {
              "@value": true,
            },
          ],
          "https://schema.affinity-project.org/credentialCategory": Array [
            Object {
              "@value": "incorporation",
            },
          ],
          "https://schema.affinity-project.org/dateRevoked": Array [
            Object {
              "@value": "date",
            },
          ],
          "https://schema.affinity-project.org/goodStanding": Array [
            Object {
              "@value": true,
            },
          ],
          "https://schema.affinity-project.org/organizationType": Array [
            Object {
              "@value": "llc",
            },
          ],
          "https://schema.affinity-project.org/primaryJurisdiction": Array [
            Object {
              "@value": true,
            },
          ],
          "https://schema.affinity-project.org/recognizedBy": Array [
            Object {
              "@type": Array [
                "/City",
              ],
            },
          ],
          "https://schema.org/educationalLevel": Array [
            Object {
              "@value": "beginner",
            },
          ],
          "https://schema.org/identifier": Array [
            Object {
              "@value": "1234",
            },
          ],
        },
      ]
    `)
  })
})
