import { getAccountOwnershipV1Context, VCAccountOwnershipV1, VCSAccountOwnershipV1 } from './v1'
import { expandVC } from '../../testUtil.test'

describe('AccountOwnershipV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAccountOwnershipV1, VCSAccountOwnershipV1>({
      type: 'AccountOwnershipV1',
      data: {
        '@type': 'AccountOwnership',
        accountName: 'bobbelcher',
        accountType: 'github',
        metaData: {
          id: 42,
          login: 'bobbelcher',
          url: 'https:github.com/bobbelcher',
          followers: 5000,
          following: 200,
          twitterUsername: 'bobbelche-twits',
          email: 'bobbelcher@gmail.com',
          name: 'Bob Belcher',
          repos: [
            {
              id: 4242,
              fullName: 'bobbelches_popularRepo',
              ownerLogin: 'bobbelcher',
              url: 'https:github.com/bobbelches_popularRepo',
              forksCount: 100,
              stargazersCount: 2000,
              watchersCount: 300,
            },
          ],
        },
      },
      context: getAccountOwnershipV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AccountOwnershipV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.affinity-project.org/AccountOwnership",
                ],
                "https://schema.affinity-project.org/accountName": Array [
                  Object {
                    "@value": "bobbelcher",
                  },
                ],
                "https://schema.affinity-project.org/accountType": Array [
                  Object {
                    "@value": "github",
                  },
                ],
                "https://schema.affinity-project.org/metaData": Array [
                  Object {
                    "https://schema.affinity-project.org/email": Array [
                      Object {
                        "@value": "bobbelcher@gmail.com",
                      },
                    ],
                    "https://schema.affinity-project.org/followers": Array [
                      Object {
                        "@value": 5000,
                      },
                    ],
                    "https://schema.affinity-project.org/following": Array [
                      Object {
                        "@value": 200,
                      },
                    ],
                    "https://schema.affinity-project.org/id": Array [
                      Object {
                        "@value": 42,
                      },
                    ],
                    "https://schema.affinity-project.org/login": Array [
                      Object {
                        "@value": "bobbelcher",
                      },
                    ],
                    "https://schema.affinity-project.org/name": Array [
                      Object {
                        "@value": "Bob Belcher",
                      },
                    ],
                    "https://schema.affinity-project.org/repos": Array [
                      Object {
                        "https://schema.affinity-project.org/forksCount": Array [
                          Object {
                            "@value": 100,
                          },
                        ],
                        "https://schema.affinity-project.org/fullName": Array [
                          Object {
                            "@value": "bobbelches_popularRepo",
                          },
                        ],
                        "https://schema.affinity-project.org/id": Array [
                          Object {
                            "@value": 4242,
                          },
                        ],
                        "https://schema.affinity-project.org/ownerLogin": Array [
                          Object {
                            "@value": "bobbelcher",
                          },
                        ],
                        "https://schema.affinity-project.org/stargazersCount": Array [
                          Object {
                            "@value": 2000,
                          },
                        ],
                        "https://schema.affinity-project.org/url": Array [
                          Object {
                            "@value": "https:github.com/bobbelches_popularRepo",
                          },
                        ],
                        "https://schema.affinity-project.org/watchersCount": Array [
                          Object {
                            "@value": 300,
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/twitterUsername": Array [
                      Object {
                        "@value": "bobbelche-twits",
                      },
                    ],
                    "https://schema.affinity-project.org/url": Array [
                      Object {
                        "@value": "https:github.com/bobbelcher",
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
