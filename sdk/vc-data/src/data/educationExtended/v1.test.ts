import { VCEducationExpandedV1, VCSEducationExpandedV1, getVCEducationExpandedV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEducationExpandedV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEducationExpandedV1, VCSEducationExpandedV1>({
      type: 'EducationExpandedV1',
      data: {
        '@type': ['Person', 'PersonE', 'EducationPerson'],
        name: 'Bob Belcher',
        email: 'bob.b@affinidi.com',
        telephone: '+91 9876543210',
        course: {
          name: 'New course',
          completionDate: '22nd oct 2020',
          description: 'A new course',
          result: 'Pass',
          ndscApproved: true,
          duration: '1 year',
          sector: 'Tech',
          nameOfSectorIfOther: '',
          skillInstructorOrTrainerName: 'Great Instructor',
          mobilizerName: 'Mr. Mobilizer',
        },
        batch: {
          name: 'Expert Batch',
          sdmsBatchId: '1a2b3c',
          startDate: '22nd Oct 2019',
          endDate: '22nd Oct 2019',
          trainingStatus: 'Fully Trained',
          grade: 'A+',
          certified: true,
        },
        certification: {
          name: 'Tech Certificate',
          certificateNo: '4321',
          issuingAuthorityName: 'Tech Authority',
          issuanceDate: '24th Oct 2020',
          passingDate: '22nd Oct 2020',
        },
      },
      context: getVCEducationExpandedV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/EducationExpandedV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.org/EducationPerson",
                ],
                "https://schema.org/batch": Array [
                  Object {
                    "https://schema.org/certified": Array [
                      Object {
                        "@value": true,
                      },
                    ],
                    "https://schema.org/endDate": Array [
                      Object {
                        "@value": "22nd Oct 2019",
                      },
                    ],
                    "https://schema.org/grade": Array [
                      Object {
                        "@value": "A+",
                      },
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Expert Batch",
                      },
                    ],
                    "https://schema.org/sdmsBatchId": Array [
                      Object {
                        "@value": "1a2b3c",
                      },
                    ],
                    "https://schema.org/startDate": Array [
                      Object {
                        "@value": "22nd Oct 2019",
                      },
                    ],
                    "https://schema.org/trainingStatus": Array [
                      Object {
                        "@value": "Fully Trained",
                      },
                    ],
                  },
                ],
                "https://schema.org/certification": Array [
                  Object {
                    "https://schema.org/certificateNo": Array [
                      Object {
                        "@value": "4321",
                      },
                    ],
                    "https://schema.org/issuanceDate": Array [
                      Object {
                        "@value": "24th Oct 2020",
                      },
                    ],
                    "https://schema.org/issuingAuthorityName": Array [
                      Object {
                        "@value": "Tech Authority",
                      },
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Tech Certificate",
                      },
                    ],
                    "https://schema.org/passingDate": Array [
                      Object {
                        "@value": "22nd Oct 2020",
                      },
                    ],
                  },
                ],
                "https://schema.org/course": Array [
                  Object {
                    "https://schema.org/completionDate": Array [
                      Object {
                        "@value": "22nd oct 2020",
                      },
                    ],
                    "https://schema.org/description": Array [
                      Object {
                        "@value": "A new course",
                      },
                    ],
                    "https://schema.org/duration": Array [
                      Object {
                        "@value": "1 year",
                      },
                    ],
                    "https://schema.org/mobilizerName": Array [
                      Object {
                        "@value": "Mr. Mobilizer",
                      },
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "New course",
                      },
                    ],
                    "https://schema.org/nameOfSectorIfOther": Array [
                      Object {
                        "@value": "",
                      },
                    ],
                    "https://schema.org/ndscApproved": Array [
                      Object {
                        "@value": true,
                      },
                    ],
                    "https://schema.org/result": Array [
                      Object {
                        "@value": "Pass",
                      },
                    ],
                    "https://schema.org/sector": Array [
                      Object {
                        "@value": "Tech",
                      },
                    ],
                    "https://schema.org/skillInstructorOrTrainerName": Array [
                      Object {
                        "@value": "Great Instructor",
                      },
                    ],
                  },
                ],
                "https://schema.org/email": Array [
                  Object {
                    "@value": "bob.b@affinidi.com",
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "Bob Belcher",
                  },
                ],
                "https://schema.org/telephone": Array [
                  Object {
                    "@value": "+91 9876543210",
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
