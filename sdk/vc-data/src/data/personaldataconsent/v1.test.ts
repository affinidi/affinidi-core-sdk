import { VCPersonalDataConsentV1, VCSPersonalDataConsentV1, getVCPersonalDataConsentV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCPersonalDataConsentV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCPersonalDataConsentV1, VCSPersonalDataConsentV1>({
      type: 'PersonalDataConsentCredentialV1',
      data: {
        '@type': ['PersonalDataConsent'],
        consentStartDate: '17-06-2021',
        consentPolicyText:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi et orci ullamcorper, cursus ligula nec, facilisis augue. Cras sed cursus lorem. Cras non ante augue.',
        consentAttributes: [
          {
            '@type': 'PersonalDataConsentAttribute',
            attributeName: 'first name',
            purpose: 'hold',
            status: 'opt-in',
          },
          {
            '@type': 'PersonalDataConsentAttribute',
            attributeName: 'last name',
            purpose: 'hold',
            status: 'opt-out',
          },
        ],
      },
      context: getVCPersonalDataConsentV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/PersonalDataConsentCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.affinity-project.org/PersonalDataConsent",
                ],
                "https://schema.affinity-project.org/consentAttributes": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/PersonalDataConsentAttribute",
                    ],
                    "https://schema.affinity-project.org/attributeName": Array [
                      Object {
                        "@value": "first name",
                      },
                    ],
                    "https://schema.affinity-project.org/purpose": Array [
                      Object {
                        "@value": "hold",
                      },
                    ],
                    "https://schema.affinity-project.org/status": Array [
                      Object {
                        "@value": "opt-in",
                      },
                    ],
                  },
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/PersonalDataConsentAttribute",
                    ],
                    "https://schema.affinity-project.org/attributeName": Array [
                      Object {
                        "@value": "last name",
                      },
                    ],
                    "https://schema.affinity-project.org/purpose": Array [
                      Object {
                        "@value": "hold",
                      },
                    ],
                    "https://schema.affinity-project.org/status": Array [
                      Object {
                        "@value": "opt-out",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/consentPolicyText": Array [
                  Object {
                    "@value": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi et orci ullamcorper, cursus ligula nec, facilisis augue. Cras sed cursus lorem. Cras non ante augue.",
                  },
                ],
                "https://schema.affinity-project.org/consentStartDate": Array [
                  Object {
                    "@value": "17-06-2021",
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
