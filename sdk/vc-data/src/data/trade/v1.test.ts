import {
  VCCargoReceiptV1,
  VCSCargoReceiptV1,
  getVCCargoReceiptV1Context,
  VCBillOfLadingV1,
  VCSBillOfLadingV1,
  getVCBillOfLadingV1Context,
} from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCCargoReceiptV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCCargoReceiptV1, VCSCargoReceiptV1>({
      type: 'CargoReceiptCredentialV1',
      data: {
        '@type': 'CargoReceipt',
        shipper: {
          '@type': ['Person', 'PersonE'],
        },
        recipient: {
          '@type': ['Person', 'PersonE'],
        },
        shipment: {
          '@type': 'Shipment',
          hasValue: {
            '@type': 'MonetaryAmount',
          },
          shippedOn: '',
          originAddress: {
            '@type': 'PostalAddress',
          },
          deliveryAddress: {
            '@type': 'PostalAddress',
          },
          orderedItem: {
            '@type': ['Product', 'ProductE'],
            hasValue: {
              '@type': 'MonetaryAmount',
              value: '1000',
              currency: 'USD',
            },
          },
        },
        portLoading: {
          '@type': ['Place', 'Port'],
          name: 'Port 1',
        },
        portUnloading: {
          '@type': ['Place', 'Port'],
          name: 'Port 2',
        },
      },
      context: getVCCargoReceiptV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/CargoReceiptCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.affinity-project.org/CargoReceipt",
                ],
                "https://schema.affinity-project.org/portLoading": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Place",
                      "https://schema.affinity-project.org/Port",
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Port 1",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/portUnloading": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Place",
                      "https://schema.affinity-project.org/Port",
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Port 2",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/recipient": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Person",
                      "https://schema.affinity-project.org/PersonE",
                    ],
                  },
                ],
                "https://schema.affinity-project.org/shipment": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/Shipment",
                    ],
                    "https://schema.affinity-project.org/deliveryAddress": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PostalAddress",
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasValue": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/MonetaryAmount",
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/orderedItem": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Product",
                          "https://schema.affinity-project.org/ProductE",
                        ],
                        "https://schema.affinity-project.org/hasValue": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "1000",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/originAddress": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PostalAddress",
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/shippedOn": Array [
                      Object {
                        "@value": "",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/shipper": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Person",
                      "https://schema.affinity-project.org/PersonE",
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

describe('VCBillOfLadingV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCBillOfLadingV1, VCSBillOfLadingV1>({
      type: 'BillOfLadingCredentialV1',
      data: {
        '@type': ['CargoReceipt', 'BillOfLading'],
        shipper: {
          '@type': ['Person', 'PersonE'],
        },
        recipient: {
          '@type': ['Person', 'PersonE'],
        },
        shipment: {
          '@type': 'Shipment',
          hasValue: {
            '@type': 'MonetaryAmount',
          },
          shippedOn: '',
          originAddress: {
            '@type': 'PostalAddress',
          },
          deliveryAddress: {
            '@type': 'PostalAddress',
          },
          orderedItem: {
            '@type': ['Product', 'ProductE'],
            hasValue: {
              '@type': 'MonetaryAmount',
              value: '1000',
              currency: 'USD',
            },
          },
        },
        portLoading: {
          '@type': ['Place', 'Port'],
          name: 'Port 1',
        },
        portUnloading: {
          '@type': ['Place', 'Port'],
          name: 'Port 2',
        },
      },
      context: getVCBillOfLadingV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/BillOfLadingCredentialV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.affinity-project.org/CargoReceipt",
                  "https://schema.affinity-project.org/BillOfLading",
                ],
                "https://schema.affinity-project.org/portLoading": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Place",
                      "https://schema.affinity-project.org/Port",
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Port 1",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/portUnloading": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Place",
                      "https://schema.affinity-project.org/Port",
                    ],
                    "https://schema.org/name": Array [
                      Object {
                        "@value": "Port 2",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/recipient": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Person",
                      "https://schema.affinity-project.org/PersonE",
                    ],
                  },
                ],
                "https://schema.affinity-project.org/shipment": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/Shipment",
                    ],
                    "https://schema.affinity-project.org/deliveryAddress": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PostalAddress",
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasValue": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/MonetaryAmount",
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/orderedItem": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Product",
                          "https://schema.affinity-project.org/ProductE",
                        ],
                        "https://schema.affinity-project.org/hasValue": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "1000",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/originAddress": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/PostalAddress",
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/shippedOn": Array [
                      Object {
                        "@value": "",
                      },
                    ],
                  },
                ],
                "https://schema.affinity-project.org/shipper": Array [
                  Object {
                    "@type": Array [
                      "https://schema.org/Person",
                      "https://schema.affinity-project.org/PersonE",
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
