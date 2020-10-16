import { R4 } from '@ahryman40k/ts-fhir-types'
import {
  VCHealthPassportGeneralV1,
  // VCSHealthPassportV1,
  VCSImmunizationV1,
  VCSObservationV1,
  VCSPatientV1,
  getVCHealthPassportGeneralV1Context,
  VCHealthPassportBundleV1,
  VCSHealthPassportBundleV1,
  ObservationV1,
  ImmunizationV1,
  SpecimenV1,
  FHIROrganizationV1,
  getVCHealthPassportBundleV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'
import { FHIRPatientE } from '../base'

const immunization: ImmunizationV1 = {
  '@type': 'Immunization',
  resourceType: 'Immunization',
  id: 'example',
  text: {
    div:
      "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: example</p><p><b>identifier</b>: urn:oid:1.3.6.1.4.1.21367.2005.3.7.1234</p><p><b>status</b>: completed</p><p><b>vaccineCode</b>: Fluvax (Influenza) <span>(Details : {urn:oid:1.2.36.1.2001.1005.17 code 'FLUVAX' = 'Fluvax)</span></p><p><b>patient</b>: <a>Patient/example</a></p><p><b>encounter</b>: <a>Encounter/example</a></p><p><b>occurrence</b>: 10/01/2013</p><p><b>primarySource</b>: true</p><p><b>location</b>: <a>Location/1</a></p><p><b>manufacturer</b>: <a>Organization/hl7</a></p><p><b>lotNumber</b>: AAJN11K</p><p><b>expirationDate</b>: 15/02/2015</p><p><b>site</b>: left arm <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-ActSite code 'LA' = 'left arm', given as 'left arm'})</span></p><p><b>route</b>: Injection, intramuscular <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration code 'IM' = 'Injection, intramuscular', given as 'Injection, intramuscular'})</span></p><p><b>doseQuantity</b>: 5 mg<span> (Details: UCUM code mg = 'mg')</span></p><blockquote><p><b>performer</b></p><p><b>function</b>: Ordering Provider <span>(Details : {http://terminology.hl7.org/CodeSystem/v2-0443 code 'OP' = 'Ordering Provider)</span></p><p><b>actor</b>: <a>Practitioner/example</a></p></blockquote><blockquote><p><b>performer</b></p><p><b>function</b>: Administering Provider <span>(Details : {http://terminology.hl7.org/CodeSystem/v2-0443 code 'AP' = 'Administering Provider)</span></p><p><b>actor</b>: <a>Practitioner/example</a></p></blockquote><p><b>note</b>: Notes on adminstration of vaccine</p><p><b>reasonCode</b>: Procedure to meet occupational requirement <span>(Details : {SNOMED CT code '429060002' = 'Procedure to meet occupational requirement)</span></p><p><b>isSubpotent</b>: true</p><h3>Educations</h3><table><tr><td>-</td><td><b>DocumentType</b></td><td><b>PublicationDate</b></td><td><b>PresentationDate</b></td></tr><tr><td>*</td><td>253088698300010311120702</td><td>02/07/2012</td><td>10/01/2013</td></tr></table><p><b>programEligibility</b>: Not Eligible <span>(Details : {http://terminology.hl7.org/CodeSystem/immunization-program-eligibility code 'ineligible' = 'Not Eligible)</span></p><p><b>fundingSource</b>: Private <span>(Details : {http://terminology.hl7.org/CodeSystem/immunization-funding-source code 'private' = 'Private)</span></p></div>",
  },
  identifier: [
    {
      system: 'urn:ietf:rfc:3986',
      value: 'urn:oid:1.3.6.1.4.1.21367.2005.3.7.1234',
    },
  ],
  status: 'completed',
  vaccineCode: {
    coding: [
      {
        system: 'urn:oid:1.2.36.1.2001.1005.17',
        code: 'FLUVAX',
      },
    ],
    text: 'Fluvax (Influenza)',
  },
  patient: {
    reference: 'Patient/example',
  },
  encounter: {
    reference: 'Encounter/example',
  },
  occurrenceDateTime: '2013-01-10',
  primarySource: true,
  location: {
    reference: 'Location/1',
  },
  manufacturer: {
    reference: 'Organization/hl7',
  },
  lotNumber: 'AAJN11K',
  expirationDate: '2015-02-15',
  site: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite',
        code: 'LA',
        display: 'left arm',
      },
    ],
  },
  route: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration',
        code: 'IM',
        display: 'Injection, intramuscular',
      },
    ],
  },
  doseQuantity: {
    value: 5,
    system: 'http://unitsofmeasure.org',
    code: 'mg',
  },
  performer: [
    {
      function: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0443',
            code: 'OP',
          },
        ],
      },
      actor: {
        reference: 'Practitioner/example',
      },
    },
    {
      function: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0443',
            code: 'AP',
          },
        ],
      },
      actor: {
        reference: 'Practitioner/example',
      },
    },
  ],
  note: [
    {
      text: 'Notes on adminstration of vaccine',
    },
  ],
  reasonCode: [
    {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '429060002',
        },
      ],
    },
  ],
  isSubpotent: true,
  education: [
    {
      documentType: '253088698300010311120702',
      publicationDate: '2012-07-02',
      presentationDate: '2013-01-10',
    },
  ],
  programEligibility: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/immunization-program-eligibility',
          code: 'ineligible',
        },
      ],
    },
  ],
  fundingSource: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/immunization-funding-source',
        code: 'private',
      },
    ],
  },
}

const observation: ObservationV1 = {
  '@type': 'Observation',
  resourceType: 'Observation',
  category: [{}],
  identifier: [
    {
      system: 'urn:ietf:rfc:3986',
      value: 'urn:uuid:187e0c12-8dd2-67e2-99b2-bf273c878281',
    },
  ],
  status: 'final' as R4.ObservationStatusKind,
  method: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '708099001',
        display: 'Rapid immunoassay',
      },
    ],
  },
  device: {
    reference: 'Device/12345',
  },
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '94503-0',
        display: 'SARS coronavirus 2 IgG and IgM panel - Serum or Plasma by Rapid immunoassay',
      },
    ],
  },
  subject: {
    reference: 'Patient/example',
  },
  effectiveDateTime: '2020-04-24',
  performer: [
    {
      reference: 'Practitioner/example',
    },
  ],
  component: [
    {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '94508-9',
            display: 'SARS coronavirus 2 IgM Ab [Presence] in Serum or Plasma by Rapid immunoassay',
          },
        ],
      },
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://loinc.org',
            code: 'LA6577-6',
            display: 'Negative',
          },
        ],
      },
    },
    {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '94507-1',
            display: 'SARS coronavirus 2 IgG Ab [Presence] in Serum or Plasma by Rapid immunoassay',
          },
        ],
      },
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://loinc.org',
            code: 'LA6576-8',
            display: 'Positive',
          },
        ],
      },
    },
  ],
}

const patient: FHIRPatientE = {
  '@type': 'Patient',
  resourceType: 'Patient',
  id: 'example',
  text: {
    status: 'generated' as R4.NarrativeStatusKind,
    div:
      '<div xmlns="http://www.w3.org/1999/xhtml">\n\t\t\t<table>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>Name</td>\n\t\t\t\t\t\t<td>Peter James \n              <b>Chalmers</b> (&quot;Jim&quot;)\n            </td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>Address</td>\n\t\t\t\t\t\t<td>534 Erewhon, Pleasantville, Vic, 3999</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>Contacts</td>\n\t\t\t\t\t\t<td>Home: unknown. Work: (03) 5555 6473</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>Id</td>\n\t\t\t\t\t\t<td>MRN: 12345 (Acme Healthcare)</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</div>',
  },
  identifier: [
    {
      use: 'usual' as R4.IdentifierUseKind,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
          },
        ],
      },
      system: 'urn:oid:1.2.36.146.595.217.0.1',
      value: '12345',
      period: {
        start: '2001-05-06',
      },
      assigner: {
        display: 'Acme Healthcare',
      },
    },
  ],
  active: true,
  name: [
    {
      use: 'official' as R4.HumanNameUseKind,
      family: 'Chalmers',
      given: ['Peter', 'James'],
    },
    {
      use: 'usual' as R4.HumanNameUseKind,
      given: ['Jim'],
    },
    {
      use: 'maiden' as R4.HumanNameUseKind,
      family: 'Windsor',
      given: ['Peter', 'James'],
      period: {
        end: '2002',
      },
    },
  ],
  telecom: [
    {
      use: 'home' as R4.ContactPointUseKind,
    },
    {
      system: 'phone' as R4.ContactPointSystemKind,
      value: '(03) 5555 6473',
      use: 'work' as R4.ContactPointUseKind,
      rank: 1,
    },
    {
      system: 'phone' as R4.ContactPointSystemKind,
      value: '(03) 3410 5613',
      use: 'mobile' as R4.ContactPointUseKind,
      rank: 2,
    },
    {
      system: 'phone' as R4.ContactPointSystemKind,
      value: '(03) 5555 8834',
      use: 'old' as R4.ContactPointUseKind,
      period: {
        end: '2014',
      },
    },
  ],
  gender: 'male' as R4.PatientGenderKind,
  birthDate: '1974-12-25',
  _birthDate: {
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/patient-birthTime',
        valueDateTime: '1974-12-25T14:35:45-05:00',
      },
    ],
  },
  deceasedBoolean: false,
  address: [
    {
      use: 'home' as R4.AddressUseKind,
      type: 'both' as R4.AddressTypeKind,
      text: '534 Erewhon St PeasantVille, Rainbow, Vic  3999',
      line: ['534 Erewhon St'],
      city: 'PleasantVille',
      district: 'Rainbow',
      state: 'Vic',
      postalCode: '3999',
      period: {
        start: '1974-12-25',
      },
    },
  ],
  contact: [
    {
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: 'N',
            },
          ],
        },
      ],
      name: {
        family: 'du Marché',
        _family: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/humanname-own-prefix',
              valueString: 'VV',
            },
          ],
        },
        given: ['Bénédicte'],
      },
      telecom: [
        {
          system: 'phone' as R4.ContactPointSystemKind,
          value: '+33 (237) 998327',
        },
      ],
      address: {
        use: 'home' as R4.AddressUseKind,
        type: 'both' as R4.AddressTypeKind,
        line: ['534 Erewhon St'],
        city: 'PleasantVille',
        district: 'Rainbow',
        state: 'Vic',
        postalCode: '3999',
        period: {
          start: '1974-12-25',
        },
      },
      gender: 'female' as R4.Patient_ContactGenderKind,
      period: {
        start: '2012',
      },
    },
  ],
  managingOrganization: {
    reference: 'Organization/1',
  },
}

export const specimen: SpecimenV1 = {
  '@type': 'Specimen',
  resourceType: 'Specimen',
  type: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '258500001',
        display: 'Nasopharyngeal swab',
      },
    ],
  },
  collection: {
    collectedDateTime: '2020-09-27T06:15:00Z',
  },
}

export const organization: FHIROrganizationV1 = {
  '@type': 'Organization',
  resourceType: 'Organization',
  name: 'Raffles Medical Clinic',
  type: [
    {
      text: 'Licensed Healthcare Provider',
    },
  ],
  endpoint: [
    {
      display: 'https://www.rafflesmedical.com.sg',
    },
  ],
  contact: [
    {
      telecom: [
        {
          system: R4.ContactPointSystemKind._phone,
          value: '',
        },
      ],
      address: {
        type: R4.AddressTypeKind._physical,
        use: R4.AddressUseKind._work,
        text: '',
      },
    },
  ],
}

describe('VCHealthPassportV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCHealthPassportGeneralV1, VCSImmunizationV1 | VCSObservationV1 | VCSPatientV1>({
      type: 'HealthPassportGeneralCredentialV1',
      data: [immunization, observation, patient],
      context: getVCHealthPassportGeneralV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "http://hl7.org/fhir/HealthPassportGeneralCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "http://hl7.org/fhir/Immunization",
                ],
                "http://hl7.org/fhir/doseQuantity": Array [
                  Object {
                    "http://hl7.org/fhir/code": Array [
                      Object {
                        "@value": "mg",
                      },
                    ],
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "http://unitsofmeasure.org",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": 5,
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/education": Array [
                  Object {
                    "http://hl7.org/fhir/documentType": Array [
                      Object {
                        "@value": "253088698300010311120702",
                      },
                    ],
                    "http://hl7.org/fhir/presentationDate": Array [
                      Object {
                        "@value": "2013-01-10",
                      },
                    ],
                    "http://hl7.org/fhir/publicationDate": Array [
                      Object {
                        "@value": "2012-07-02",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/encounter": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Encounter/example",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/expirationDate": Array [
                  Object {
                    "@value": "2015-02-15",
                  },
                ],
                "http://hl7.org/fhir/fundingSource": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "private",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://terminology.hl7.org/CodeSystem/immunization-funding-source",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/id": Array [
                  Object {
                    "@value": "example",
                  },
                ],
                "http://hl7.org/fhir/identifier": Array [
                  Object {
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "urn:ietf:rfc:3986",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": "urn:oid:1.3.6.1.4.1.21367.2005.3.7.1234",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/isSubpotent": Array [
                  Object {
                    "@value": true,
                  },
                ],
                "http://hl7.org/fhir/location": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Location/1",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/lotNumber": Array [
                  Object {
                    "@value": "AAJN11K",
                  },
                ],
                "http://hl7.org/fhir/manufacturer": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Organization/hl7",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/note": Array [
                  Object {
                    "http://hl7.org/fhir/text": Array [
                      Object {
                        "@value": "Notes on adminstration of vaccine",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/occurrenceDateTime": Array [
                  Object {
                    "@value": "2013-01-10",
                  },
                ],
                "http://hl7.org/fhir/patient": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Patient/example",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/performer": Array [
                  Object {
                    "http://hl7.org/fhir/actor": Array [
                      Object {
                        "http://hl7.org/fhir/reference": Array [
                          Object {
                            "@value": "Practitioner/example",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/function": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "OP",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://terminology.hl7.org/CodeSystem/v2-0443",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/actor": Array [
                      Object {
                        "http://hl7.org/fhir/reference": Array [
                          Object {
                            "@value": "Practitioner/example",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/function": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "AP",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://terminology.hl7.org/CodeSystem/v2-0443",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/primarySource": Array [
                  Object {
                    "@value": true,
                  },
                ],
                "http://hl7.org/fhir/programEligibility": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "ineligible",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://terminology.hl7.org/CodeSystem/immunization-program-eligibility",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/reasonCode": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "429060002",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://snomed.info/sct",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/resourceType": Array [
                  Object {
                    "@value": "Immunization",
                  },
                ],
                "http://hl7.org/fhir/route": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "IM",
                          },
                        ],
                        "http://hl7.org/fhir/display": Array [
                          Object {
                            "@value": "Injection, intramuscular",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/site": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "LA",
                          },
                        ],
                        "http://hl7.org/fhir/display": Array [
                          Object {
                            "@value": "left arm",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://terminology.hl7.org/CodeSystem/v3-ActSite",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/status": Array [
                  Object {
                    "@value": "completed",
                  },
                ],
                "http://hl7.org/fhir/text": Array [
                  Object {
                    "http://hl7.org/fhir/div": Array [
                      Object {
                        "@value": "<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: example</p><p><b>identifier</b>: urn:oid:1.3.6.1.4.1.21367.2005.3.7.1234</p><p><b>status</b>: completed</p><p><b>vaccineCode</b>: Fluvax (Influenza) <span>(Details : {urn:oid:1.2.36.1.2001.1005.17 code 'FLUVAX' = 'Fluvax)</span></p><p><b>patient</b>: <a>Patient/example</a></p><p><b>encounter</b>: <a>Encounter/example</a></p><p><b>occurrence</b>: 10/01/2013</p><p><b>primarySource</b>: true</p><p><b>location</b>: <a>Location/1</a></p><p><b>manufacturer</b>: <a>Organization/hl7</a></p><p><b>lotNumber</b>: AAJN11K</p><p><b>expirationDate</b>: 15/02/2015</p><p><b>site</b>: left arm <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-ActSite code 'LA' = 'left arm', given as 'left arm'})</span></p><p><b>route</b>: Injection, intramuscular <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration code 'IM' = 'Injection, intramuscular', given as 'Injection, intramuscular'})</span></p><p><b>doseQuantity</b>: 5 mg<span> (Details: UCUM code mg = 'mg')</span></p><blockquote><p><b>performer</b></p><p><b>function</b>: Ordering Provider <span>(Details : {http://terminology.hl7.org/CodeSystem/v2-0443 code 'OP' = 'Ordering Provider)</span></p><p><b>actor</b>: <a>Practitioner/example</a></p></blockquote><blockquote><p><b>performer</b></p><p><b>function</b>: Administering Provider <span>(Details : {http://terminology.hl7.org/CodeSystem/v2-0443 code 'AP' = 'Administering Provider)</span></p><p><b>actor</b>: <a>Practitioner/example</a></p></blockquote><p><b>note</b>: Notes on adminstration of vaccine</p><p><b>reasonCode</b>: Procedure to meet occupational requirement <span>(Details : {SNOMED CT code '429060002' = 'Procedure to meet occupational requirement)</span></p><p><b>isSubpotent</b>: true</p><h3>Educations</h3><table><tr><td>-</td><td><b>DocumentType</b></td><td><b>PublicationDate</b></td><td><b>PresentationDate</b></td></tr><tr><td>*</td><td>253088698300010311120702</td><td>02/07/2012</td><td>10/01/2013</td></tr></table><p><b>programEligibility</b>: Not Eligible <span>(Details : {http://terminology.hl7.org/CodeSystem/immunization-program-eligibility code 'ineligible' = 'Not Eligible)</span></p><p><b>fundingSource</b>: Private <span>(Details : {http://terminology.hl7.org/CodeSystem/immunization-funding-source code 'private' = 'Private)</span></p></div>",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/vaccineCode": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "FLUVAX",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "urn:oid:1.2.36.1.2001.1005.17",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/text": Array [
                      Object {
                        "@value": "Fluvax (Influenza)",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "http://hl7.org/fhir/Observation",
                ],
                "http://hl7.org/fhir/category": Array [
                  Object {},
                ],
                "http://hl7.org/fhir/code": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "94503-0",
                          },
                        ],
                        "http://hl7.org/fhir/display": Array [
                          Object {
                            "@value": "SARS coronavirus 2 IgG and IgM panel - Serum or Plasma by Rapid immunoassay",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://loinc.org",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/component": Array [
                  Object {
                    "http://hl7.org/fhir/code": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "94508-9",
                              },
                            ],
                            "http://hl7.org/fhir/display": Array [
                              Object {
                                "@value": "SARS coronavirus 2 IgM Ab [Presence] in Serum or Plasma by Rapid immunoassay",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://loinc.org",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/valueCodeableConcept": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "LA6577-6",
                              },
                            ],
                            "http://hl7.org/fhir/display": Array [
                              Object {
                                "@value": "Negative",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://loinc.org",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/code": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "94507-1",
                              },
                            ],
                            "http://hl7.org/fhir/display": Array [
                              Object {
                                "@value": "SARS coronavirus 2 IgG Ab [Presence] in Serum or Plasma by Rapid immunoassay",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://loinc.org",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/valueCodeableConcept": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "LA6576-8",
                              },
                            ],
                            "http://hl7.org/fhir/display": Array [
                              Object {
                                "@value": "Positive",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://loinc.org",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/device": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Device/12345",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/effectiveDateTime": Array [
                  Object {
                    "@value": "2020-04-24",
                  },
                ],
                "http://hl7.org/fhir/identifier": Array [
                  Object {
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "urn:ietf:rfc:3986",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": "urn:uuid:187e0c12-8dd2-67e2-99b2-bf273c878281",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/method": Array [
                  Object {
                    "http://hl7.org/fhir/coding": Array [
                      Object {
                        "http://hl7.org/fhir/code": Array [
                          Object {
                            "@value": "708099001",
                          },
                        ],
                        "http://hl7.org/fhir/display": Array [
                          Object {
                            "@value": "Rapid immunoassay",
                          },
                        ],
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "http://snomed.info/sct",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/performer": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Practitioner/example",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/resourceType": Array [
                  Object {
                    "@value": "Observation",
                  },
                ],
                "http://hl7.org/fhir/status": Array [
                  Object {
                    "@value": "final",
                  },
                ],
                "http://hl7.org/fhir/subject": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Patient/example",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "http://hl7.org/fhir/Patient",
                ],
                "http://hl7.org/fhir/_birthDate": Array [
                  Object {
                    "http://hl7.org/fhir/extension": Array [
                      Object {
                        "http://hl7.org/fhir/url": Array [
                          Object {
                            "@value": "http://hl7.org/fhir/StructureDefinition/patient-birthTime",
                          },
                        ],
                        "http://hl7.org/fhir/valueDateTime": Array [
                          Object {
                            "@value": "1974-12-25T14:35:45-05:00",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/active": Array [
                  Object {
                    "@value": true,
                  },
                ],
                "http://hl7.org/fhir/address": Array [
                  Object {
                    "http://hl7.org/fhir/city": Array [
                      Object {
                        "@value": "PleasantVille",
                      },
                    ],
                    "http://hl7.org/fhir/district": Array [
                      Object {
                        "@value": "Rainbow",
                      },
                    ],
                    "http://hl7.org/fhir/line": Array [
                      Object {
                        "@value": "534 Erewhon St",
                      },
                    ],
                    "http://hl7.org/fhir/period": Array [
                      Object {
                        "http://hl7.org/fhir/start": Array [
                          Object {
                            "@value": "1974-12-25",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/postalCode": Array [
                      Object {
                        "@value": "3999",
                      },
                    ],
                    "http://hl7.org/fhir/state": Array [
                      Object {
                        "@value": "Vic",
                      },
                    ],
                    "http://hl7.org/fhir/text": Array [
                      Object {
                        "@value": "534 Erewhon St PeasantVille, Rainbow, Vic  3999",
                      },
                    ],
                    "http://hl7.org/fhir/type": Array [
                      Object {
                        "@value": "both",
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "home",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/birthDate": Array [
                  Object {
                    "@value": "1974-12-25",
                  },
                ],
                "http://hl7.org/fhir/contact": Array [
                  Object {
                    "http://hl7.org/fhir/address": Array [
                      Object {
                        "http://hl7.org/fhir/city": Array [
                          Object {
                            "@value": "PleasantVille",
                          },
                        ],
                        "http://hl7.org/fhir/district": Array [
                          Object {
                            "@value": "Rainbow",
                          },
                        ],
                        "http://hl7.org/fhir/line": Array [
                          Object {
                            "@value": "534 Erewhon St",
                          },
                        ],
                        "http://hl7.org/fhir/period": Array [
                          Object {
                            "http://hl7.org/fhir/start": Array [
                              Object {
                                "@value": "1974-12-25",
                              },
                            ],
                          },
                        ],
                        "http://hl7.org/fhir/postalCode": Array [
                          Object {
                            "@value": "3999",
                          },
                        ],
                        "http://hl7.org/fhir/state": Array [
                          Object {
                            "@value": "Vic",
                          },
                        ],
                        "http://hl7.org/fhir/type": Array [
                          Object {
                            "@value": "both",
                          },
                        ],
                        "http://hl7.org/fhir/use": Array [
                          Object {
                            "@value": "home",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/gender": Array [
                      Object {
                        "@value": "female",
                      },
                    ],
                    "http://hl7.org/fhir/name": Array [
                      Object {
                        "http://hl7.org/fhir/_family": Array [
                          Object {
                            "http://hl7.org/fhir/extension": Array [
                              Object {
                                "http://hl7.org/fhir/url": Array [
                                  Object {
                                    "@value": "http://hl7.org/fhir/StructureDefinition/humanname-own-prefix",
                                  },
                                ],
                                "http://hl7.org/fhir/valueString": Array [
                                  Object {
                                    "@value": "VV",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        "http://hl7.org/fhir/family": Array [
                          Object {
                            "@value": "du Marché",
                          },
                        ],
                        "http://hl7.org/fhir/given": Array [
                          Object {
                            "@value": "Bénédicte",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/period": Array [
                      Object {
                        "http://hl7.org/fhir/start": Array [
                          Object {
                            "@value": "2012",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/relationship": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "N",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://terminology.hl7.org/CodeSystem/v2-0131",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/telecom": Array [
                      Object {
                        "http://hl7.org/fhir/system": Array [
                          Object {
                            "@value": "phone",
                          },
                        ],
                        "http://hl7.org/fhir/value": Array [
                          Object {
                            "@value": "+33 (237) 998327",
                          },
                        ],
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/deceasedBoolean": Array [
                  Object {
                    "@value": false,
                  },
                ],
                "http://hl7.org/fhir/gender": Array [
                  Object {
                    "@value": "male",
                  },
                ],
                "http://hl7.org/fhir/id": Array [
                  Object {
                    "@value": "example",
                  },
                ],
                "http://hl7.org/fhir/identifier": Array [
                  Object {
                    "http://hl7.org/fhir/assigner": Array [
                      Object {
                        "http://hl7.org/fhir/display": Array [
                          Object {
                            "@value": "Acme Healthcare",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/period": Array [
                      Object {
                        "http://hl7.org/fhir/start": Array [
                          Object {
                            "@value": "2001-05-06",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "urn:oid:1.2.36.146.595.217.0.1",
                      },
                    ],
                    "http://hl7.org/fhir/type": Array [
                      Object {
                        "http://hl7.org/fhir/coding": Array [
                          Object {
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "@value": "MR",
                              },
                            ],
                            "http://hl7.org/fhir/system": Array [
                              Object {
                                "@value": "http://terminology.hl7.org/CodeSystem/v2-0203",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "usual",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": "12345",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/managingOrganization": Array [
                  Object {
                    "http://hl7.org/fhir/reference": Array [
                      Object {
                        "@value": "Organization/1",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/name": Array [
                  Object {
                    "http://hl7.org/fhir/family": Array [
                      Object {
                        "@value": "Chalmers",
                      },
                    ],
                    "http://hl7.org/fhir/given": Array [
                      Object {
                        "@value": "Peter",
                      },
                      Object {
                        "@value": "James",
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "official",
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/given": Array [
                      Object {
                        "@value": "Jim",
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "usual",
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/family": Array [
                      Object {
                        "@value": "Windsor",
                      },
                    ],
                    "http://hl7.org/fhir/given": Array [
                      Object {
                        "@value": "Peter",
                      },
                      Object {
                        "@value": "James",
                      },
                    ],
                    "http://hl7.org/fhir/period": Array [
                      Object {
                        "http://hl7.org/fhir/end": Array [
                          Object {
                            "@value": "2002",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "maiden",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/resourceType": Array [
                  Object {
                    "@value": "Patient",
                  },
                ],
                "http://hl7.org/fhir/telecom": Array [
                  Object {
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "home",
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/rank": Array [
                      Object {
                        "@value": 1,
                      },
                    ],
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "phone",
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "work",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": "(03) 5555 6473",
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/rank": Array [
                      Object {
                        "@value": 2,
                      },
                    ],
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "phone",
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "mobile",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": "(03) 3410 5613",
                      },
                    ],
                  },
                  Object {
                    "http://hl7.org/fhir/period": Array [
                      Object {
                        "http://hl7.org/fhir/end": Array [
                          Object {
                            "@value": "2014",
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/system": Array [
                      Object {
                        "@value": "phone",
                      },
                    ],
                    "http://hl7.org/fhir/use": Array [
                      Object {
                        "@value": "old",
                      },
                    ],
                    "http://hl7.org/fhir/value": Array [
                      Object {
                        "@value": "(03) 5555 8834",
                      },
                    ],
                  },
                ],
                "http://hl7.org/fhir/text": Array [
                  Object {
                    "http://hl7.org/fhir/div": Array [
                      Object {
                        "@value": "<div xmlns=\\"http://www.w3.org/1999/xhtml\\">
      			<table>
      				<tbody>
      					<tr>
      						<td>Name</td>
      						<td>Peter James 
                    <b>Chalmers</b> (&quot;Jim&quot;)
                  </td>
      					</tr>
      					<tr>
      						<td>Address</td>
      						<td>534 Erewhon, Pleasantville, Vic, 3999</td>
      					</tr>
      					<tr>
      						<td>Contacts</td>
      						<td>Home: unknown. Work: (03) 5555 6473</td>
      					</tr>
      					<tr>
      						<td>Id</td>
      						<td>MRN: 12345 (Acme Healthcare)</td>
      					</tr>
      				</tbody>
      			</table>
      		</div>",
                      },
                    ],
                    "http://hl7.org/fhir/status": Array [
                      Object {
                        "@value": "generated",
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

describe('VCHealthPassportBundleV1', () => {
  it('expands correctly', async () => {
    const expanded = await expandVC<VCHealthPassportBundleV1, VCSHealthPassportBundleV1>({
      type: 'HealthPassportBundleCredentialV1',
      data: {
        '@type': 'BundleContainer',
        fhirVersion: '4.0.1',
        fhirBundle: {
          '@type': 'Bundle',
          resourceType: 'Bundle',
          entry: [
            {
              '@type': 'BundleEntry',
              resource: immunization,
            },
            {
              '@type': 'BundleEntry',
              resource: patient,
            },
            {
              '@type': 'BundleEntry',
              resource: observation,
            },
            {
              '@type': 'BundleEntry',
              resource: specimen,
            },
            {
              '@type': 'BundleEntry',
              resource: organization,
            },
          ],
        },
      },
      context: getVCHealthPassportBundleV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/HealthPassportBundleCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.affinity-project.org/BundleContainer",
                ],
                "https://schema.affinity-project.org/fhirBundle": Array [
                  Object {
                    "@type": Array [
                      "http://hl7.org/fhir/Bundle",
                    ],
                    "http://hl7.org/fhir/entry": Array [
                      Object {
                        "@type": Array [
                          "http://hl7.org/fhir/BundleEntry",
                        ],
                        "http://hl7.org/fhir/resource": Array [
                          Object {
                            "@type": Array [
                              "http://hl7.org/fhir/Immunization",
                            ],
                            "http://hl7.org/fhir/doseQuantity": Array [
                              Object {
                                "http://hl7.org/fhir/code": Array [
                                  Object {
                                    "@value": "mg",
                                  },
                                ],
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "http://unitsofmeasure.org",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": 5,
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/education": Array [
                              Object {
                                "http://hl7.org/fhir/documentType": Array [
                                  Object {
                                    "@value": "253088698300010311120702",
                                  },
                                ],
                                "http://hl7.org/fhir/presentationDate": Array [
                                  Object {
                                    "@value": "2013-01-10",
                                  },
                                ],
                                "http://hl7.org/fhir/publicationDate": Array [
                                  Object {
                                    "@value": "2012-07-02",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/encounter": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Encounter/example",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/expirationDate": Array [
                              Object {
                                "@value": "2015-02-15",
                              },
                            ],
                            "http://hl7.org/fhir/fundingSource": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "private",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://terminology.hl7.org/CodeSystem/immunization-funding-source",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/id": Array [
                              Object {
                                "@value": "example",
                              },
                            ],
                            "http://hl7.org/fhir/identifier": Array [
                              Object {
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "urn:ietf:rfc:3986",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": "urn:oid:1.3.6.1.4.1.21367.2005.3.7.1234",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/isSubpotent": Array [
                              Object {
                                "@value": true,
                              },
                            ],
                            "http://hl7.org/fhir/location": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Location/1",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/lotNumber": Array [
                              Object {
                                "@value": "AAJN11K",
                              },
                            ],
                            "http://hl7.org/fhir/manufacturer": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Organization/hl7",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/note": Array [
                              Object {
                                "http://hl7.org/fhir/text": Array [
                                  Object {
                                    "@value": "Notes on adminstration of vaccine",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/occurrenceDateTime": Array [
                              Object {
                                "@value": "2013-01-10",
                              },
                            ],
                            "http://hl7.org/fhir/patient": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Patient/example",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/performer": Array [
                              Object {
                                "http://hl7.org/fhir/actor": Array [
                                  Object {
                                    "http://hl7.org/fhir/reference": Array [
                                      Object {
                                        "@value": "Practitioner/example",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/function": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "OP",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://terminology.hl7.org/CodeSystem/v2-0443",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/actor": Array [
                                  Object {
                                    "http://hl7.org/fhir/reference": Array [
                                      Object {
                                        "@value": "Practitioner/example",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/function": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "AP",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://terminology.hl7.org/CodeSystem/v2-0443",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/primarySource": Array [
                              Object {
                                "@value": true,
                              },
                            ],
                            "http://hl7.org/fhir/programEligibility": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "ineligible",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://terminology.hl7.org/CodeSystem/immunization-program-eligibility",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/reasonCode": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "429060002",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://snomed.info/sct",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/resourceType": Array [
                              Object {
                                "@value": "Immunization",
                              },
                            ],
                            "http://hl7.org/fhir/route": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "IM",
                                      },
                                    ],
                                    "http://hl7.org/fhir/display": Array [
                                      Object {
                                        "@value": "Injection, intramuscular",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/site": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "LA",
                                      },
                                    ],
                                    "http://hl7.org/fhir/display": Array [
                                      Object {
                                        "@value": "left arm",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://terminology.hl7.org/CodeSystem/v3-ActSite",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/status": Array [
                              Object {
                                "@value": "completed",
                              },
                            ],
                            "http://hl7.org/fhir/text": Array [
                              Object {
                                "http://hl7.org/fhir/div": Array [
                                  Object {
                                    "@value": "<div xmlns=\\"http://www.w3.org/1999/xhtml\\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: example</p><p><b>identifier</b>: urn:oid:1.3.6.1.4.1.21367.2005.3.7.1234</p><p><b>status</b>: completed</p><p><b>vaccineCode</b>: Fluvax (Influenza) <span>(Details : {urn:oid:1.2.36.1.2001.1005.17 code 'FLUVAX' = 'Fluvax)</span></p><p><b>patient</b>: <a>Patient/example</a></p><p><b>encounter</b>: <a>Encounter/example</a></p><p><b>occurrence</b>: 10/01/2013</p><p><b>primarySource</b>: true</p><p><b>location</b>: <a>Location/1</a></p><p><b>manufacturer</b>: <a>Organization/hl7</a></p><p><b>lotNumber</b>: AAJN11K</p><p><b>expirationDate</b>: 15/02/2015</p><p><b>site</b>: left arm <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-ActSite code 'LA' = 'left arm', given as 'left arm'})</span></p><p><b>route</b>: Injection, intramuscular <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration code 'IM' = 'Injection, intramuscular', given as 'Injection, intramuscular'})</span></p><p><b>doseQuantity</b>: 5 mg<span> (Details: UCUM code mg = 'mg')</span></p><blockquote><p><b>performer</b></p><p><b>function</b>: Ordering Provider <span>(Details : {http://terminology.hl7.org/CodeSystem/v2-0443 code 'OP' = 'Ordering Provider)</span></p><p><b>actor</b>: <a>Practitioner/example</a></p></blockquote><blockquote><p><b>performer</b></p><p><b>function</b>: Administering Provider <span>(Details : {http://terminology.hl7.org/CodeSystem/v2-0443 code 'AP' = 'Administering Provider)</span></p><p><b>actor</b>: <a>Practitioner/example</a></p></blockquote><p><b>note</b>: Notes on adminstration of vaccine</p><p><b>reasonCode</b>: Procedure to meet occupational requirement <span>(Details : {SNOMED CT code '429060002' = 'Procedure to meet occupational requirement)</span></p><p><b>isSubpotent</b>: true</p><h3>Educations</h3><table><tr><td>-</td><td><b>DocumentType</b></td><td><b>PublicationDate</b></td><td><b>PresentationDate</b></td></tr><tr><td>*</td><td>253088698300010311120702</td><td>02/07/2012</td><td>10/01/2013</td></tr></table><p><b>programEligibility</b>: Not Eligible <span>(Details : {http://terminology.hl7.org/CodeSystem/immunization-program-eligibility code 'ineligible' = 'Not Eligible)</span></p><p><b>fundingSource</b>: Private <span>(Details : {http://terminology.hl7.org/CodeSystem/immunization-funding-source code 'private' = 'Private)</span></p></div>",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/vaccineCode": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "FLUVAX",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "urn:oid:1.2.36.1.2001.1005.17",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/text": Array [
                                  Object {
                                    "@value": "Fluvax (Influenza)",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      Object {
                        "@type": Array [
                          "http://hl7.org/fhir/BundleEntry",
                        ],
                        "http://hl7.org/fhir/resource": Array [
                          Object {
                            "@type": Array [
                              "http://hl7.org/fhir/Patient",
                            ],
                            "http://hl7.org/fhir/_birthDate": Array [
                              Object {
                                "http://hl7.org/fhir/extension": Array [
                                  Object {
                                    "http://hl7.org/fhir/url": Array [
                                      Object {
                                        "@value": "http://hl7.org/fhir/StructureDefinition/patient-birthTime",
                                      },
                                    ],
                                    "http://hl7.org/fhir/valueDateTime": Array [
                                      Object {
                                        "@value": "1974-12-25T14:35:45-05:00",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/active": Array [
                              Object {
                                "@value": true,
                              },
                            ],
                            "http://hl7.org/fhir/address": Array [
                              Object {
                                "http://hl7.org/fhir/city": Array [
                                  Object {
                                    "@value": "PleasantVille",
                                  },
                                ],
                                "http://hl7.org/fhir/district": Array [
                                  Object {
                                    "@value": "Rainbow",
                                  },
                                ],
                                "http://hl7.org/fhir/line": Array [
                                  Object {
                                    "@value": "534 Erewhon St",
                                  },
                                ],
                                "http://hl7.org/fhir/period": Array [
                                  Object {
                                    "http://hl7.org/fhir/start": Array [
                                      Object {
                                        "@value": "1974-12-25",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/postalCode": Array [
                                  Object {
                                    "@value": "3999",
                                  },
                                ],
                                "http://hl7.org/fhir/state": Array [
                                  Object {
                                    "@value": "Vic",
                                  },
                                ],
                                "http://hl7.org/fhir/text": Array [
                                  Object {
                                    "@value": "534 Erewhon St PeasantVille, Rainbow, Vic  3999",
                                  },
                                ],
                                "http://hl7.org/fhir/type": Array [
                                  Object {
                                    "@value": "both",
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "home",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/birthDate": Array [
                              Object {
                                "@value": "1974-12-25",
                              },
                            ],
                            "http://hl7.org/fhir/contact": Array [
                              Object {
                                "http://hl7.org/fhir/address": Array [
                                  Object {
                                    "http://hl7.org/fhir/city": Array [
                                      Object {
                                        "@value": "PleasantVille",
                                      },
                                    ],
                                    "http://hl7.org/fhir/district": Array [
                                      Object {
                                        "@value": "Rainbow",
                                      },
                                    ],
                                    "http://hl7.org/fhir/line": Array [
                                      Object {
                                        "@value": "534 Erewhon St",
                                      },
                                    ],
                                    "http://hl7.org/fhir/period": Array [
                                      Object {
                                        "http://hl7.org/fhir/start": Array [
                                          Object {
                                            "@value": "1974-12-25",
                                          },
                                        ],
                                      },
                                    ],
                                    "http://hl7.org/fhir/postalCode": Array [
                                      Object {
                                        "@value": "3999",
                                      },
                                    ],
                                    "http://hl7.org/fhir/state": Array [
                                      Object {
                                        "@value": "Vic",
                                      },
                                    ],
                                    "http://hl7.org/fhir/type": Array [
                                      Object {
                                        "@value": "both",
                                      },
                                    ],
                                    "http://hl7.org/fhir/use": Array [
                                      Object {
                                        "@value": "home",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/gender": Array [
                                  Object {
                                    "@value": "female",
                                  },
                                ],
                                "http://hl7.org/fhir/name": Array [
                                  Object {
                                    "http://hl7.org/fhir/_family": Array [
                                      Object {
                                        "http://hl7.org/fhir/extension": Array [
                                          Object {
                                            "http://hl7.org/fhir/url": Array [
                                              Object {
                                                "@value": "http://hl7.org/fhir/StructureDefinition/humanname-own-prefix",
                                              },
                                            ],
                                            "http://hl7.org/fhir/valueString": Array [
                                              Object {
                                                "@value": "VV",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                    "http://hl7.org/fhir/family": Array [
                                      Object {
                                        "@value": "du Marché",
                                      },
                                    ],
                                    "http://hl7.org/fhir/given": Array [
                                      Object {
                                        "@value": "Bénédicte",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/period": Array [
                                  Object {
                                    "http://hl7.org/fhir/start": Array [
                                      Object {
                                        "@value": "2012",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/relationship": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "N",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://terminology.hl7.org/CodeSystem/v2-0131",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/telecom": Array [
                                  Object {
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "phone",
                                      },
                                    ],
                                    "http://hl7.org/fhir/value": Array [
                                      Object {
                                        "@value": "+33 (237) 998327",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/deceasedBoolean": Array [
                              Object {
                                "@value": false,
                              },
                            ],
                            "http://hl7.org/fhir/gender": Array [
                              Object {
                                "@value": "male",
                              },
                            ],
                            "http://hl7.org/fhir/id": Array [
                              Object {
                                "@value": "example",
                              },
                            ],
                            "http://hl7.org/fhir/identifier": Array [
                              Object {
                                "http://hl7.org/fhir/assigner": Array [
                                  Object {
                                    "http://hl7.org/fhir/display": Array [
                                      Object {
                                        "@value": "Acme Healthcare",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/period": Array [
                                  Object {
                                    "http://hl7.org/fhir/start": Array [
                                      Object {
                                        "@value": "2001-05-06",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "urn:oid:1.2.36.146.595.217.0.1",
                                  },
                                ],
                                "http://hl7.org/fhir/type": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "MR",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "usual",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": "12345",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/managingOrganization": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Organization/1",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/name": Array [
                              Object {
                                "http://hl7.org/fhir/family": Array [
                                  Object {
                                    "@value": "Chalmers",
                                  },
                                ],
                                "http://hl7.org/fhir/given": Array [
                                  Object {
                                    "@value": "Peter",
                                  },
                                  Object {
                                    "@value": "James",
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "official",
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/given": Array [
                                  Object {
                                    "@value": "Jim",
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "usual",
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/family": Array [
                                  Object {
                                    "@value": "Windsor",
                                  },
                                ],
                                "http://hl7.org/fhir/given": Array [
                                  Object {
                                    "@value": "Peter",
                                  },
                                  Object {
                                    "@value": "James",
                                  },
                                ],
                                "http://hl7.org/fhir/period": Array [
                                  Object {
                                    "http://hl7.org/fhir/end": Array [
                                      Object {
                                        "@value": "2002",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "maiden",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/resourceType": Array [
                              Object {
                                "@value": "Patient",
                              },
                            ],
                            "http://hl7.org/fhir/telecom": Array [
                              Object {
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "home",
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/rank": Array [
                                  Object {
                                    "@value": 1,
                                  },
                                ],
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "phone",
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "work",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": "(03) 5555 6473",
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/rank": Array [
                                  Object {
                                    "@value": 2,
                                  },
                                ],
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "phone",
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "mobile",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": "(03) 3410 5613",
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/period": Array [
                                  Object {
                                    "http://hl7.org/fhir/end": Array [
                                      Object {
                                        "@value": "2014",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "phone",
                                  },
                                ],
                                "http://hl7.org/fhir/use": Array [
                                  Object {
                                    "@value": "old",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": "(03) 5555 8834",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/text": Array [
                              Object {
                                "http://hl7.org/fhir/div": Array [
                                  Object {
                                    "@value": "<div xmlns=\\"http://www.w3.org/1999/xhtml\\">
      			<table>
      				<tbody>
      					<tr>
      						<td>Name</td>
      						<td>Peter James 
                    <b>Chalmers</b> (&quot;Jim&quot;)
                  </td>
      					</tr>
      					<tr>
      						<td>Address</td>
      						<td>534 Erewhon, Pleasantville, Vic, 3999</td>
      					</tr>
      					<tr>
      						<td>Contacts</td>
      						<td>Home: unknown. Work: (03) 5555 6473</td>
      					</tr>
      					<tr>
      						<td>Id</td>
      						<td>MRN: 12345 (Acme Healthcare)</td>
      					</tr>
      				</tbody>
      			</table>
      		</div>",
                                  },
                                ],
                                "http://hl7.org/fhir/status": Array [
                                  Object {
                                    "@value": "generated",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      Object {
                        "@type": Array [
                          "http://hl7.org/fhir/BundleEntry",
                        ],
                        "http://hl7.org/fhir/resource": Array [
                          Object {
                            "@type": Array [
                              "http://hl7.org/fhir/Observation",
                            ],
                            "http://hl7.org/fhir/category": Array [
                              Object {},
                            ],
                            "http://hl7.org/fhir/code": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "94503-0",
                                      },
                                    ],
                                    "http://hl7.org/fhir/display": Array [
                                      Object {
                                        "@value": "SARS coronavirus 2 IgG and IgM panel - Serum or Plasma by Rapid immunoassay",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://loinc.org",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/component": Array [
                              Object {
                                "http://hl7.org/fhir/code": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "94508-9",
                                          },
                                        ],
                                        "http://hl7.org/fhir/display": Array [
                                          Object {
                                            "@value": "SARS coronavirus 2 IgM Ab [Presence] in Serum or Plasma by Rapid immunoassay",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://loinc.org",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/valueCodeableConcept": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "LA6577-6",
                                          },
                                        ],
                                        "http://hl7.org/fhir/display": Array [
                                          Object {
                                            "@value": "Negative",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://loinc.org",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              Object {
                                "http://hl7.org/fhir/code": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "94507-1",
                                          },
                                        ],
                                        "http://hl7.org/fhir/display": Array [
                                          Object {
                                            "@value": "SARS coronavirus 2 IgG Ab [Presence] in Serum or Plasma by Rapid immunoassay",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://loinc.org",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/valueCodeableConcept": Array [
                                  Object {
                                    "http://hl7.org/fhir/coding": Array [
                                      Object {
                                        "http://hl7.org/fhir/code": Array [
                                          Object {
                                            "@value": "LA6576-8",
                                          },
                                        ],
                                        "http://hl7.org/fhir/display": Array [
                                          Object {
                                            "@value": "Positive",
                                          },
                                        ],
                                        "http://hl7.org/fhir/system": Array [
                                          Object {
                                            "@value": "http://loinc.org",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/device": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Device/12345",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/effectiveDateTime": Array [
                              Object {
                                "@value": "2020-04-24",
                              },
                            ],
                            "http://hl7.org/fhir/identifier": Array [
                              Object {
                                "http://hl7.org/fhir/system": Array [
                                  Object {
                                    "@value": "urn:ietf:rfc:3986",
                                  },
                                ],
                                "http://hl7.org/fhir/value": Array [
                                  Object {
                                    "@value": "urn:uuid:187e0c12-8dd2-67e2-99b2-bf273c878281",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/method": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "708099001",
                                      },
                                    ],
                                    "http://hl7.org/fhir/display": Array [
                                      Object {
                                        "@value": "Rapid immunoassay",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://snomed.info/sct",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/performer": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Practitioner/example",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/resourceType": Array [
                              Object {
                                "@value": "Observation",
                              },
                            ],
                            "http://hl7.org/fhir/status": Array [
                              Object {
                                "@value": "final",
                              },
                            ],
                            "http://hl7.org/fhir/subject": Array [
                              Object {
                                "http://hl7.org/fhir/reference": Array [
                                  Object {
                                    "@value": "Patient/example",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      Object {
                        "@type": Array [
                          "http://hl7.org/fhir/BundleEntry",
                        ],
                        "http://hl7.org/fhir/resource": Array [
                          Object {
                            "@type": Array [
                              "http://hl7.org/fhir/Specimen",
                            ],
                            "http://hl7.org/fhir/collection": Array [
                              Object {
                                "http://hl7.org/fhir/collectedDateTime": Array [
                                  Object {
                                    "@value": "2020-09-27T06:15:00Z",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/resourceType": Array [
                              Object {
                                "@value": "Specimen",
                              },
                            ],
                            "http://hl7.org/fhir/type": Array [
                              Object {
                                "http://hl7.org/fhir/coding": Array [
                                  Object {
                                    "http://hl7.org/fhir/code": Array [
                                      Object {
                                        "@value": "258500001",
                                      },
                                    ],
                                    "http://hl7.org/fhir/display": Array [
                                      Object {
                                        "@value": "Nasopharyngeal swab",
                                      },
                                    ],
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "http://snomed.info/sct",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      Object {
                        "@type": Array [
                          "http://hl7.org/fhir/BundleEntry",
                        ],
                        "http://hl7.org/fhir/resource": Array [
                          Object {
                            "@type": Array [
                              "http://hl7.org/fhir/Organization",
                            ],
                            "http://hl7.org/fhir/contact": Array [
                              Object {
                                "http://hl7.org/fhir/address": Array [
                                  Object {
                                    "http://hl7.org/fhir/text": Array [
                                      Object {
                                        "@value": "",
                                      },
                                    ],
                                    "http://hl7.org/fhir/type": Array [
                                      Object {
                                        "@value": "physical",
                                      },
                                    ],
                                    "http://hl7.org/fhir/use": Array [
                                      Object {
                                        "@value": "work",
                                      },
                                    ],
                                  },
                                ],
                                "http://hl7.org/fhir/telecom": Array [
                                  Object {
                                    "http://hl7.org/fhir/system": Array [
                                      Object {
                                        "@value": "phone",
                                      },
                                    ],
                                    "http://hl7.org/fhir/value": Array [
                                      Object {
                                        "@value": "",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/endpoint": Array [
                              Object {
                                "http://hl7.org/fhir/display": Array [
                                  Object {
                                    "@value": "https://www.rafflesmedical.com.sg",
                                  },
                                ],
                              },
                            ],
                            "http://hl7.org/fhir/name": Array [
                              Object {
                                "@value": "Raffles Medical Clinic",
                              },
                            ],
                            "http://hl7.org/fhir/resourceType": Array [
                              Object {
                                "@value": "Organization",
                              },
                            ],
                            "http://hl7.org/fhir/type": Array [
                              Object {
                                "http://hl7.org/fhir/text": Array [
                                  Object {
                                    "@value": "Licensed Healthcare Provider",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "http://hl7.org/fhir/resourceType": Array [
                      Object {
                        "@value": "Bundle",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/fhirVersion": Array [
                  Object {
                    "@value": "4.0.1",
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
