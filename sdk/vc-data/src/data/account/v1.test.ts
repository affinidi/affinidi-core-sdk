import {
  VCAccountPersonV1,
  VCSAccountPersonV1,
  getVCAccountPersonV1Context,
  VCAccountOrganizationV1,
  VCSAccountOrganizationV1,
  getVCAccountOrganizationV1Context,
  AccountV1,
} from './v1'
import { expandVC } from '../../testUtil.test'

const account: AccountV1 = {
  '@type': 'Account',
  identifier: '1234',
  organization: {
    '@type': ['Organization', 'OrganizationE', 'OrganizationAccount'],
    serviceTypes: ['type1', 'type2'],
    nationality: {
      '@type': 'State',
      name: 'Washington',
    },
    name: 'My Org',
  },
  startDate: '2020-06-01T00:00:00.000Z',
  endDate: '2021-06-01T00:00:00.000Z',
  accountType: 'accountType',
  accountTypeConfidence: 1,
  accountStatements: [
    {
      '@type': 'AccountStatement',
      statementDate: '2020-06-01T00:00:00.000Z',
      dueDate: '2020-07-01T00:00:00.000Z',
    },
  ],
  accountPayments: [
    {
      '@type': 'AccountPayment',
      paymentDate: '2020-06-01T00:00:00.000Z',
      amount: {
        '@type': 'MonetaryAmount',
        value: '1000',
        currency: 'USD',
        maxValue: '100',
      },
    },
  ],
  hasValue: {
    '@type': 'MonetaryAmount',
    value: '1000',
    currency: 'USD',
    maxValue: '100',
  },
  bankAccountCategory: 'checking',
  hasIncome: {
    '@type': 'BankAccountTransactionGroup',
    identifier: 1234,
    startDate: '2020-06-01T00:00:00.000Z',
    endDate: '2021-06-01T00:00:00.000Z',
    cashflowCategory: 'category',
    cashflowSubcategory: 'subcategory',
    payrollAgency: true,
    memo: 'memo',
    length: 10,
    payee: 'payee',
    payer: 'payer',
    rank: 'rank',
    frequency: 'daily',
    periodicity: 1,
    valueStddev: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    valueTotal: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    valueMean: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    valueMedian: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    transactions: {
      '@type': 'BankAccountTransaction',
      transactionType: 'credit',
      value: {
        '@type': 'MonetaryAmount',
        value: '100',
        currency: 'USD',
        maxValue: '100',
      },
      memo: 'memo',
    },
  },
  hasExpense: {
    '@type': 'BankAccountTransactionGroup',
    identifier: 1234,
    startDate: '2020-06-01T00:00:00.000Z',
    endDate: '2021-06-01T00:00:00.000Z',
    cashflowCategory: 'category',
    cashflowSubcategory: 'subcategory',
    payrollAgency: true,
    memo: 'memo',
    length: 10,
    payee: 'payee',
    payer: 'payer',
    rank: 'rank',
    frequency: 'daily',
    periodicity: 1,
    valueStddev: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    valueTotal: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    valueMean: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    valueMedian: {
      '@type': 'MonetaryAmount',
      value: '100',
      currency: 'USD',
      maxValue: '100',
    },
    transactions: {
      '@type': 'BankAccountTransaction',
      transactionType: 'credit',
      value: {
        '@type': 'MonetaryAmount',
        value: '100',
        currency: 'USD',
        maxValue: '100',
      },
      memo: 'memo',
    },
  },
  hasTransactions: [
    {
      '@type': 'BankAccountTransaction',
      transactionType: 'credit',
      value: {
        '@type': 'MonetaryAmount',
        value: '100',
        currency: 'USD',
        maxValue: '100',
      },
      memo: 'memo',
    },
    {
      '@type': 'BankAccountTransaction',
      transactionType: 'credit',
      value: {
        '@type': 'MonetaryAmount',
        value: '100',
        currency: 'USD',
        maxValue: '100',
      },
      memo: 'memo',
    },
  ],
}

describe('VCAccountPersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAccountPersonV1, VCSAccountPersonV1>({
      type: 'AccountCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'AccountPerson'],
        hasAccount: account,
        name: 'Bob Belcher',
      },
      context: getVCAccountPersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AccountCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/AccountPerson",
                ],
                "https://schema.affinity-project.org/hasAccount": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/Account",
                    ],
                    "https://schema.affinity-project.org/accountPayments": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AccountPayment",
                        ],
                        "https://schema.affinity-project.org/amount": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "1000",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/paymentDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/accountStatements": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AccountStatement",
                        ],
                        "https://schema.affinity-project.org/dueDate": Array [
                          Object {
                            "@value": "2020-07-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/statementDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/accountType": Array [
                      Object {
                        "@value": "accountType",
                      },
                    ],
                    "https://schema.affinity-project.org/accountTypeConfidence": Array [
                      Object {
                        "@value": 1,
                      },
                    ],
                    "https://schema.affinity-project.org/bankAccountCategory": Array [
                      Object {
                        "@value": "checking",
                      },
                    ],
                    "https://schema.affinity-project.org/endDate": Array [
                      Object {
                        "@value": "2021-06-01T00:00:00.000Z",
                      },
                    ],
                    "https://schema.affinity-project.org/hasExpense": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransactionGroup",
                        ],
                        "https://schema.affinity-project.org/cashflowCategory": Array [
                          Object {
                            "@value": "category",
                          },
                        ],
                        "https://schema.affinity-project.org/cashflowSubcategory": Array [
                          Object {
                            "@value": "subcategory",
                          },
                        ],
                        "https://schema.affinity-project.org/endDate": Array [
                          Object {
                            "@value": "2021-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/frequency": Array [
                          Object {
                            "@value": "daily",
                          },
                        ],
                        "https://schema.affinity-project.org/identifier": Array [
                          Object {
                            "@value": 1234,
                          },
                        ],
                        "https://schema.affinity-project.org/length": Array [
                          Object {
                            "@value": 10,
                          },
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/payee": Array [
                          Object {
                            "@value": "payee",
                          },
                        ],
                        "https://schema.affinity-project.org/payer": Array [
                          Object {
                            "@value": "payer",
                          },
                        ],
                        "https://schema.affinity-project.org/payrollAgency": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/periodicity": Array [
                          Object {
                            "@value": 1,
                          },
                        ],
                        "https://schema.affinity-project.org/rank": Array [
                          Object {
                            "@value": "rank",
                          },
                        ],
                        "https://schema.affinity-project.org/startDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/transactions": Array [
                          Object {
                            "@type": Array [
                              "https://schema.affinity-project.org/BankAccountTransaction",
                            ],
                            "https://schema.affinity-project.org/memo": Array [
                              Object {
                                "@value": "memo",
                              },
                            ],
                            "https://schema.affinity-project.org/transactionType": Array [
                              Object {
                                "@value": "credit",
                              },
                            ],
                            "https://schema.affinity-project.org/value": Array [
                              Object {
                                "@type": Array [
                                  "https://schema.org/MonetaryAmount",
                                ],
                                "https://schema.org/currency": Array [
                                  Object {
                                    "@value": "USD",
                                  },
                                ],
                                "https://schema.org/maxValue": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                                "https://schema.org/value": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMean": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMedian": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueStddev": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueTotal": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasIncome": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransactionGroup",
                        ],
                        "https://schema.affinity-project.org/cashflowCategory": Array [
                          Object {
                            "@value": "category",
                          },
                        ],
                        "https://schema.affinity-project.org/cashflowSubcategory": Array [
                          Object {
                            "@value": "subcategory",
                          },
                        ],
                        "https://schema.affinity-project.org/endDate": Array [
                          Object {
                            "@value": "2021-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/frequency": Array [
                          Object {
                            "@value": "daily",
                          },
                        ],
                        "https://schema.affinity-project.org/identifier": Array [
                          Object {
                            "@value": 1234,
                          },
                        ],
                        "https://schema.affinity-project.org/length": Array [
                          Object {
                            "@value": 10,
                          },
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/payee": Array [
                          Object {
                            "@value": "payee",
                          },
                        ],
                        "https://schema.affinity-project.org/payer": Array [
                          Object {
                            "@value": "payer",
                          },
                        ],
                        "https://schema.affinity-project.org/payrollAgency": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/periodicity": Array [
                          Object {
                            "@value": 1,
                          },
                        ],
                        "https://schema.affinity-project.org/rank": Array [
                          Object {
                            "@value": "rank",
                          },
                        ],
                        "https://schema.affinity-project.org/startDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/transactions": Array [
                          Object {
                            "@type": Array [
                              "https://schema.affinity-project.org/BankAccountTransaction",
                            ],
                            "https://schema.affinity-project.org/memo": Array [
                              Object {
                                "@value": "memo",
                              },
                            ],
                            "https://schema.affinity-project.org/transactionType": Array [
                              Object {
                                "@value": "credit",
                              },
                            ],
                            "https://schema.affinity-project.org/value": Array [
                              Object {
                                "@type": Array [
                                  "https://schema.org/MonetaryAmount",
                                ],
                                "https://schema.org/currency": Array [
                                  Object {
                                    "@value": "USD",
                                  },
                                ],
                                "https://schema.org/maxValue": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                                "https://schema.org/value": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMean": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMedian": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueStddev": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueTotal": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasTransactions": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransaction",
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/transactionType": Array [
                          Object {
                            "@value": "credit",
                          },
                        ],
                        "https://schema.affinity-project.org/value": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransaction",
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/transactionType": Array [
                          Object {
                            "@value": "credit",
                          },
                        ],
                        "https://schema.affinity-project.org/value": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
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
                        "https://schema.org/maxValue": Array [
                          Object {
                            "@value": "100",
                          },
                        ],
                        "https://schema.org/value": Array [
                          Object {
                            "@value": "1000",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/identifier": Array [
                      Object {
                        "@value": "1234",
                      },
                    ],
                    "https://schema.affinity-project.org/organization": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Organization",
                          "https://schema.affinity-project.org/OrganizationE",
                          "https://schema.affinity-project.org/OrganizationAccount",
                        ],
                        "https://schema.affinity-project.org/nationality": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/State",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Washington",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/serviceTypes": Array [
                          Object {
                            "@value": "type1",
                          },
                          Object {
                            "@value": "type2",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "My Org",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/startDate": Array [
                      Object {
                        "@value": "2020-06-01T00:00:00.000Z",
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

describe('VCAccountOrganizationV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCAccountOrganizationV1, VCSAccountOrganizationV1>({
      type: 'AccountCredentialOrganizationV1',
      data: {
        '@type': ['Organization', 'OrganizationE', 'AccountOrganization'],
        hasAccount: account,
        name: "Bob's Burgers",
      },
      context: getVCAccountOrganizationV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/AccountCredentialOrganizationV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Organization",
                  "https://schema.affinity-project.org/OrganizationE",
                  "https://schema.affinity-project.org/AccountOrganization",
                ],
                "https://schema.affinity-project.org/hasAccount": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/Account",
                    ],
                    "https://schema.affinity-project.org/accountPayments": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AccountPayment",
                        ],
                        "https://schema.affinity-project.org/amount": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "1000",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/paymentDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/accountStatements": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/AccountStatement",
                        ],
                        "https://schema.affinity-project.org/dueDate": Array [
                          Object {
                            "@value": "2020-07-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/statementDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/accountType": Array [
                      Object {
                        "@value": "accountType",
                      },
                    ],
                    "https://schema.affinity-project.org/accountTypeConfidence": Array [
                      Object {
                        "@value": 1,
                      },
                    ],
                    "https://schema.affinity-project.org/bankAccountCategory": Array [
                      Object {
                        "@value": "checking",
                      },
                    ],
                    "https://schema.affinity-project.org/endDate": Array [
                      Object {
                        "@value": "2021-06-01T00:00:00.000Z",
                      },
                    ],
                    "https://schema.affinity-project.org/hasExpense": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransactionGroup",
                        ],
                        "https://schema.affinity-project.org/cashflowCategory": Array [
                          Object {
                            "@value": "category",
                          },
                        ],
                        "https://schema.affinity-project.org/cashflowSubcategory": Array [
                          Object {
                            "@value": "subcategory",
                          },
                        ],
                        "https://schema.affinity-project.org/endDate": Array [
                          Object {
                            "@value": "2021-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/frequency": Array [
                          Object {
                            "@value": "daily",
                          },
                        ],
                        "https://schema.affinity-project.org/identifier": Array [
                          Object {
                            "@value": 1234,
                          },
                        ],
                        "https://schema.affinity-project.org/length": Array [
                          Object {
                            "@value": 10,
                          },
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/payee": Array [
                          Object {
                            "@value": "payee",
                          },
                        ],
                        "https://schema.affinity-project.org/payer": Array [
                          Object {
                            "@value": "payer",
                          },
                        ],
                        "https://schema.affinity-project.org/payrollAgency": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/periodicity": Array [
                          Object {
                            "@value": 1,
                          },
                        ],
                        "https://schema.affinity-project.org/rank": Array [
                          Object {
                            "@value": "rank",
                          },
                        ],
                        "https://schema.affinity-project.org/startDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/transactions": Array [
                          Object {
                            "@type": Array [
                              "https://schema.affinity-project.org/BankAccountTransaction",
                            ],
                            "https://schema.affinity-project.org/memo": Array [
                              Object {
                                "@value": "memo",
                              },
                            ],
                            "https://schema.affinity-project.org/transactionType": Array [
                              Object {
                                "@value": "credit",
                              },
                            ],
                            "https://schema.affinity-project.org/value": Array [
                              Object {
                                "@type": Array [
                                  "https://schema.org/MonetaryAmount",
                                ],
                                "https://schema.org/currency": Array [
                                  Object {
                                    "@value": "USD",
                                  },
                                ],
                                "https://schema.org/maxValue": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                                "https://schema.org/value": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMean": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMedian": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueStddev": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueTotal": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasIncome": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransactionGroup",
                        ],
                        "https://schema.affinity-project.org/cashflowCategory": Array [
                          Object {
                            "@value": "category",
                          },
                        ],
                        "https://schema.affinity-project.org/cashflowSubcategory": Array [
                          Object {
                            "@value": "subcategory",
                          },
                        ],
                        "https://schema.affinity-project.org/endDate": Array [
                          Object {
                            "@value": "2021-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/frequency": Array [
                          Object {
                            "@value": "daily",
                          },
                        ],
                        "https://schema.affinity-project.org/identifier": Array [
                          Object {
                            "@value": 1234,
                          },
                        ],
                        "https://schema.affinity-project.org/length": Array [
                          Object {
                            "@value": 10,
                          },
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/payee": Array [
                          Object {
                            "@value": "payee",
                          },
                        ],
                        "https://schema.affinity-project.org/payer": Array [
                          Object {
                            "@value": "payer",
                          },
                        ],
                        "https://schema.affinity-project.org/payrollAgency": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/periodicity": Array [
                          Object {
                            "@value": 1,
                          },
                        ],
                        "https://schema.affinity-project.org/rank": Array [
                          Object {
                            "@value": "rank",
                          },
                        ],
                        "https://schema.affinity-project.org/startDate": Array [
                          Object {
                            "@value": "2020-06-01T00:00:00.000Z",
                          },
                        ],
                        "https://schema.affinity-project.org/transactions": Array [
                          Object {
                            "@type": Array [
                              "https://schema.affinity-project.org/BankAccountTransaction",
                            ],
                            "https://schema.affinity-project.org/memo": Array [
                              Object {
                                "@value": "memo",
                              },
                            ],
                            "https://schema.affinity-project.org/transactionType": Array [
                              Object {
                                "@value": "credit",
                              },
                            ],
                            "https://schema.affinity-project.org/value": Array [
                              Object {
                                "@type": Array [
                                  "https://schema.org/MonetaryAmount",
                                ],
                                "https://schema.org/currency": Array [
                                  Object {
                                    "@value": "USD",
                                  },
                                ],
                                "https://schema.org/maxValue": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                                "https://schema.org/value": Array [
                                  Object {
                                    "@value": "100",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMean": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueMedian": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueStddev": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/valueTotal": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/hasTransactions": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransaction",
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/transactionType": Array [
                          Object {
                            "@value": "credit",
                          },
                        ],
                        "https://schema.affinity-project.org/value": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/BankAccountTransaction",
                        ],
                        "https://schema.affinity-project.org/memo": Array [
                          Object {
                            "@value": "memo",
                          },
                        ],
                        "https://schema.affinity-project.org/transactionType": Array [
                          Object {
                            "@value": "credit",
                          },
                        ],
                        "https://schema.affinity-project.org/value": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/MonetaryAmount",
                            ],
                            "https://schema.org/currency": Array [
                              Object {
                                "@value": "USD",
                              },
                            ],
                            "https://schema.org/maxValue": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                            "https://schema.org/value": Array [
                              Object {
                                "@value": "100",
                              },
                            ],
                          },
                        ],
                      },
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
                        "https://schema.org/maxValue": Array [
                          Object {
                            "@value": "100",
                          },
                        ],
                        "https://schema.org/value": Array [
                          Object {
                            "@value": "1000",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/identifier": Array [
                      Object {
                        "@value": "1234",
                      },
                    ],
                    "https://schema.affinity-project.org/organization": Array [
                      Object {
                        "@type": Array [
                          "https://schema.org/Organization",
                          "https://schema.affinity-project.org/OrganizationE",
                          "https://schema.affinity-project.org/OrganizationAccount",
                        ],
                        "https://schema.affinity-project.org/nationality": Array [
                          Object {
                            "@type": Array [
                              "https://schema.org/State",
                            ],
                            "https://schema.org/name": Array [
                              Object {
                                "@value": "Washington",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/serviceTypes": Array [
                          Object {
                            "@value": "type1",
                          },
                          Object {
                            "@value": "type2",
                          },
                        ],
                        "https://schema.org/name": Array [
                          Object {
                            "@value": "My Org",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/startDate": Array [
                      Object {
                        "@value": "2020-06-01T00:00:00.000Z",
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
