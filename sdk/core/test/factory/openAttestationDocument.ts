// prettier-ignore
export const openAttestationDocument = {
  version: 'https://schema.openattestation.com/2.0/schema.json',
  data: {
    id: 'ca6db63f-8a36-4c43-b8a1-eecb5b7d7da0:string:Test001',
    name: '278e33a0-1cad-4cfb-b08a-eea07b23ceb4:string:SWAB Test Result',
    $template: {
      name: 'f4206c61-d102-47c6-8635-38365aac4209:string:MOH-2020-4',
      type: '3dacee6b-11e9-4228-89c9-defd795dba9a:string:EMBEDDED_RENDERER',
      url: '9c77c0c8-d143-44e3-8ca3-4f56352d6c68:string:https://dev-render.accredify.io'
    },
    issuers: [
      {
        name: 'a5ae33e5-2c0b-4a41-a91e-d9e240d1bc84:string:Parkway Pantai',
        documentStore: '46a24ecc-c0f5-4f19-81d5-580c98c17d8f:string:0xee28195127b4965765933423714f431af9757715',
        network: '1f61e718-9370-4bc1-ab1b-8b9a0e773327:string:ETHEREUM',
        identityProof: {
          type: '8585c7ed-6b6f-4dc2-98a9-faf4a0902064:string:DNS-TXT',
          location: 'cda3b93e-96ed-49ae-a397-c3bfa68039db:string:parkrop.accredify.io'
        }
      }
    ],
    fhirVersion: '480ca01a-6b66-406e-aae7-46dd8483c1dd:string:4.0.1',
    fhirBundle: {
      resourceType: '6a051726-38ef-4769-a14a-64fb970388ec:string:Bundle',
      type: 'bc8d5f61-26ee-41fa-9ede-646a1f2a3baa:string:collection',
      entry: [
        {
          resourceType: '80b2aa0a-f385-4272-baa6-bbcf95bca485:string:Patient',
          extension: [
            {
              url: 'cf2a99fb-171f-40e7-a520-7695a43de50e:string:http://hl7.org/fhir/StructureDefinition/patient-nationality',
              code: {
                text: '06548a27-f111-4cda-b8e2-8a86d4023923:string:SG'
              }
            }
          ],
          identifier: [
            {
              type: '08c2390d-d7f0-4de8-b256-e67d9f0ae1f3:string:PPN',
              value: 'c434def1-9f42-4cfd-b870-55b922e4ba13:string:12345678'
            },
            {
              type: {
                text: '146ccbad-e3b7-42f1-a54f-a62b9ad33787:string:NRIC'
              },
              value: '64ac6125-e6f1-49d5-8599-807b85c3abc2:string:S0000006A'
            }
          ],
          name: [
            {
              text: 'd286539a-d3ce-4b6c-8bf3-696eeba76a3b:string:Test Patient'
            }
          ],
          gender: 'e062752e-1666-4263-8ce0-479852904c3a:string:Male',
          birthDate: 'd3608946-9e2c-470c-a2f4-cafa47efd79c:string:1990-01-02',
          email: 'c4ebfa4c-dfa9-4d88-828d-ccdf66a8f8a3:string:shaun+parkway-test1@accredify.io'
        },
        {
          resourceType: '66c30d5f-6fc1-4a02-9a9c-d8a2c2e61e44:string:Specimen',
          type: {
            coding: [
              {
                system: 'bc0bc2c4-98dd-4676-b300-09d51665e80e:string:http://snomed.info/sct',
                code: 'a59be888-a78a-4b62-bde1-1f83d2bb632a:string:258500001',
                display: '6826005f-68ed-4ee2-8eb3-69e9bc7a2e82:string:Nasopharyngeal swab'
              }
            ]
          },
          collection: {
            collectedDateTime: '5b66547f-214e-4270-8a79-42461efc9c1c:string:2020-10-28T00:00:00Z'
          }
        },
        {
          resourceType: 'e8b427f1-7305-4bb7-8552-e07e7ddae172:string:Observation',
          identifier: [
            {
              value: '1a450d6f-0384-48eb-a9fa-d6bd6e57197e:string:123456789',
              type: 'f2fd270d-655c-4882-b018-becee4a79764:string:ACSN'
            }
          ],
          code: {
            coding: [
              {
                system: 'a316acff-4a70-429d-8dd1-ada367c82ad3:string:http://loinc.org',
                code: '0efae364-c537-4d69-babf-9260e22bfa80:string:94531-1',
                display: '0d61b3d9-e6df-42bb-b15c-8554ba120d84:string:Reverse transcription polymerase chain reaction (rRT-PCR) test'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'd8657a2c-d4f9-418d-83eb-785d2e16a15e:string:http://snomed.info/sct',
                code: '1d3c0487-3716-4540-92f1-3789d40b970b:string:260385009',
                display: 'b6b764b8-cd91-4114-a4b8-2dc9a74691d6:string:Negative'
              }
            ]
          },
          effectiveDateTime: 'f7794544-9d39-4cc1-811b-cb0f24664d2d:string:2020-10-28T00:00:00Z',
          status: '20795e9c-11c7-4eef-9b5e-cf96396eaf97:string:final',
          performer: {
            name: [
              {
                text: 'be2328b8-56dc-4c5b-8ce7-344101891c37:string:Dr Michael Lim'
              }
            ]
          },
          qualification: [
            {
              identifier: 'b0aeadd2-7507-4883-83bc-404ab7ee899b:string:MCR 123456',
              issuer: '76b51374-a20a-4cca-a24a-61a89da628e6:string:MOH'
            }
          ]
        },
        {
          resourceType: 'dc86177d-187a-4cca-a758-f918b2f7f105:string:Organization',
          name: 'af68c1ba-44a8-4ed8-b29a-f388a894c287:string:Parkway Pantai',
          type: '850d0d2c-16f2-4187-8dda-02077c77ad29:string:Licensed Healthcare Provider',
          endpoint: {
            address: 'da3115e4-c11c-40b7-99b3-e35b8302e619:string:https://www.parkwaypantai.com'
          },
          contact: {
            telecom: [
              {
                system: '16d2d40f-1dfb-4390-90cf-57edd11bc90d:string:phone',
                value: 'c654246a-790d-44b9-bc8b-37df7e1edf19:string:+65 6307 7880'
              }
            ],
            address: {
              type: '9d8a687d-c47c-4c9f-bfef-03cbf1a234f6:string:work',
              use: 'cb58538f-2dca-434b-afe3-748f453beb5a:string:physical',
              text: '65148eae-8173-4645-abd6-7f78868e3c86:string:TripleOne Somerset 111 Somerset Road #15-01 Singapore'
            }
          }
        },
        {
          resourceType: '03a9d064-a986-4aa7-bad6-cdd3e24b8138:string:Organization',
          name: 'd3ff1d84-3a0d-4421-9a97-686748c6ba57:string:Parkway Laboratory',
          type: '62c7f48e-86ed-4796-afa5-c0ee69442a9a:string:Accredited Laboratory',
          contact: {
            telecom: [
              {
                system: 'b6213a0c-5de4-4eaa-832c-fdf3f22daa44:string:phone',
                value: '1dadd5c1-96bd-4dcd-86ff-b9742a294761:string:+6562789188'
              }
            ],
            address: {
              type: 'a1f709ad-188a-4b6f-87ff-231eb998e059:string:work',
              use: '5833475e-d386-4bac-a88d-0c554b53995d:string:physical',
              text: '733ed413-5c88-4ac2-b1e7-280a686a259d:string:2 Aljunied Avenue 1 #07-11 Framework 2 Building Singapore 389977'
            }
          }
        }
      ]
    }
  },
  signature: {
    type: 'SHA3MerkleProof',
    targetHash: '37e35776fd535cc11f7831b667e241eebc774b1e8723b9a07854e2be36f58b71',
    proof: [{}],
    merkleRoot: '37e35776fd535cc11f7831b667e241eebc774b1e8723b9a07854e2be36f58b71'
  }
}
