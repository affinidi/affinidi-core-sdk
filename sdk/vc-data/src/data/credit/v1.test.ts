import { VCCreditScorePersonV1, VCSCreditScorePersonV1, getVCCreditScorePersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCCreditScorePersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCCreditScorePersonV1, VCSCreditScorePersonV1>({
      type: 'CreditScoreCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'CreditScorePerson'],
        name: 'Bob Belcher',
        hasCreditScore: {
          '@type': 'CreditScore',
          score: 0,
          scoreType: 'scoreType',
          populationRank: 0,
          provider: 'provider',
          lastUpdatedDate: 'lastUpdatedDate',
          utilizationPercentage: 0,
          historyStartDate: 'historyStartDate',
          paymentHistoryPercentage: 0,
          statement: 'statement',
          tradelines: [
            {
              '@type': 'Tradeline',
              accountType: 'accountType',
              accountNumber: 'accountNumber',
              creditType: 'creditType',
              balanceCurrent: { '@type': 'MonetaryAmount', value: 100, currency: 'USD' },
              balanceMax: { '@type': 'MonetaryAmount', value: 100, currency: 'USD' },
              balancePercentage: 0,
              rating: 'rating',
              open: true,
              statement: 'statement',

              subscriberCode: 'subscriberCode',
              verifiedDate: 'verifiedDate',
              reportedDate: 'reportedDate',
              openedDate: 'openedDate',
              accountStatusDate: 'accountStatusDate',
              closedDate: 'closedDate',
              bureau: 'bureau',
              accountCondition: 'accountCondition',
              accountDesignator: 'accountDesignator',
              disputeFlag: 'disputeFlag',
              industryCode: 'industryCode',
              accountIsOpen: true,
              payStatus: 'payStatus',
              verificationIndicator: 'verificationIndicator',
              remark: [
                {
                  '@type': 'TradelineRemark',
                  remark: 'remark',
                  remarkCode: 'remarkCode',
                },
              ],
              monthsReviewed: 'monthsReviewed',
              monthlyPayment: 'monthlyPayment',
              late90Count: 'late90Count',
              late60Count: 'late60Count',
              late30Count: 'late30Count',
              dateLatePayment: 'dateLatePayment',
              termMonths: 'termMonths',
              collateral: 'collateral',
              amountPastDue: { '@type': 'MonetaryAmount', value: 100, currency: 'USD' },
              worstPastStatusCount: 'worstPastStatusCount',
              paymentFrequency: 'paymentFrequency',
              termType: 'termType',
              worstPayStatus: 'worstPayStatus',
              payStatuses: [
                {
                  '@type': 'TradelinePayStatus',
                  date: 'date',
                  status: 'status',
                },
              ],
              creditLimit: 'creditLimit',
              creditor: 'creditor',
              position: 'position',
            },
          ],
          creditDataSuppressed: 'creditDataSuppressed',
          totalAccounts: 'totalAccounts',
          totalClosedAccounts: 'totalClosedAccounts',
          delinquentAccounts: 'delinquentAccounts',
          derogatoryAccounts: 'derogatoryAccounts',
          openAccounts: 'openAccounts',
          totalBalances: 'totalBalances',
          totalMonthlyPayments: 'totalMonthlyPayments',
          numberOfInquiries: 'numberOfInquiries',
          totalPublicRecords: 'totalPublicRecords',
          recentInquiries: 'recentInquiries',
          balanceOpenRevolvingAccounts: 'balanceOpenRevolvingAccounts',
          totalOpenRevolvingAccounts: 'totalOpenRevolvingAccounts',
          balanceOpenInstallmentAccounts: 'balanceOpenInstallmentAccounts',
          totalOpenInstallmentAccounts: 'totalOpenInstallmentAccounts',
          balanceOpenMortgageAccounts: 'balanceOpenMortgageAccounts',
          totalOpenMortgageAccounts: 'totalOpenMortgageAccounts',
          balanceOpenCollectionAccounts: 'balanceOpenCollectionAccounts',
          totalOpenCollectionAccounts: 'totalOpenCollectionAccounts',
          balanceOpenOtherAccounts: 'balanceOpenOtherAccounts',
          totalOpenOtherAccounts: 'totalOpenOtherAccounts',
          availableCredit: 'availableCredit',
          utilization: 'utilization',
          onTimePaymentPercentage: 'onTimePaymentPercentage',
          latePaymentPercentage: 'latePaymentPercentage',
          recentTradelinesOpened: 'recentTradelinesOpened',
          dateOfOldestTrade: 'dateOfOldestTrade',
          ageOfCredit: 'ageOfCredit',
          paymentHistory: 'paymentHistory',
          securityFreeze: 'securityFreeze',
          fraudAlert: 'fraudAlert',
        },
      },
      context: getVCCreditScorePersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/CreditScoreCredentialPersonV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Person",
                  "https://schema.affinity-project.org/PersonE",
                  "https://schema.affinity-project.org/CreditScorePerson",
                ],
                "https://schema.affinity-project.org/hasCreditScore": Array [
                  Object {
                    "@type": Array [
                      "https://schema.affinity-project.org/CreditScore",
                    ],
                    "https://schema.affinity-project.org/ageOfCredit": Array [
                      Object {
                        "@value": "ageOfCredit",
                      },
                    ],
                    "https://schema.affinity-project.org/availableCredit": Array [
                      Object {
                        "@value": "availableCredit",
                      },
                    ],
                    "https://schema.affinity-project.org/balanceOpenCollectionAccounts": Array [
                      Object {
                        "@value": "balanceOpenCollectionAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/balanceOpenInstallmentAccounts": Array [
                      Object {
                        "@value": "balanceOpenInstallmentAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/balanceOpenMortgageAccounts": Array [
                      Object {
                        "@value": "balanceOpenMortgageAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/balanceOpenOtherAccounts": Array [
                      Object {
                        "@value": "balanceOpenOtherAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/balanceOpenRevolvingAccounts": Array [
                      Object {
                        "@value": "balanceOpenRevolvingAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/creditDataSuppressed": Array [
                      Object {
                        "@value": "creditDataSuppressed",
                      },
                    ],
                    "https://schema.affinity-project.org/dateOfOldestTrade": Array [
                      Object {
                        "@value": "dateOfOldestTrade",
                      },
                    ],
                    "https://schema.affinity-project.org/delinquentAccounts": Array [
                      Object {
                        "@value": "delinquentAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/derogatoryAccounts": Array [
                      Object {
                        "@value": "derogatoryAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/fraudAlert": Array [
                      Object {
                        "@value": "fraudAlert",
                      },
                    ],
                    "https://schema.affinity-project.org/historyStartDate": Array [
                      Object {
                        "@value": "historyStartDate",
                      },
                    ],
                    "https://schema.affinity-project.org/lastUpdatedDate": Array [
                      Object {
                        "@value": "lastUpdatedDate",
                      },
                    ],
                    "https://schema.affinity-project.org/latePaymentPercentage": Array [
                      Object {
                        "@value": "latePaymentPercentage",
                      },
                    ],
                    "https://schema.affinity-project.org/numberOfInquiries": Array [
                      Object {
                        "@value": "numberOfInquiries",
                      },
                    ],
                    "https://schema.affinity-project.org/onTimePaymentPercentage": Array [
                      Object {
                        "@value": "onTimePaymentPercentage",
                      },
                    ],
                    "https://schema.affinity-project.org/openAccounts": Array [
                      Object {
                        "@value": "openAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/paymentHistory": Array [
                      Object {
                        "@value": "paymentHistory",
                      },
                    ],
                    "https://schema.affinity-project.org/paymentHistoryPercentage": Array [
                      Object {
                        "@value": 0,
                      },
                    ],
                    "https://schema.affinity-project.org/populationRank": Array [
                      Object {
                        "@value": 0,
                      },
                    ],
                    "https://schema.affinity-project.org/provider": Array [
                      Object {
                        "@value": "provider",
                      },
                    ],
                    "https://schema.affinity-project.org/recentInquiries": Array [
                      Object {
                        "@value": "recentInquiries",
                      },
                    ],
                    "https://schema.affinity-project.org/recentTradelinesOpened": Array [
                      Object {
                        "@value": "recentTradelinesOpened",
                      },
                    ],
                    "https://schema.affinity-project.org/score": Array [
                      Object {
                        "@value": 0,
                      },
                    ],
                    "https://schema.affinity-project.org/scoreType": Array [
                      Object {
                        "@value": "scoreType",
                      },
                    ],
                    "https://schema.affinity-project.org/securityFreeze": Array [
                      Object {
                        "@value": "securityFreeze",
                      },
                    ],
                    "https://schema.affinity-project.org/statement": Array [
                      Object {
                        "@value": "statement",
                      },
                    ],
                    "https://schema.affinity-project.org/totalAccounts": Array [
                      Object {
                        "@value": "totalAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalBalances": Array [
                      Object {
                        "@value": "totalBalances",
                      },
                    ],
                    "https://schema.affinity-project.org/totalClosedAccounts": Array [
                      Object {
                        "@value": "totalClosedAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalMonthlyPayments": Array [
                      Object {
                        "@value": "totalMonthlyPayments",
                      },
                    ],
                    "https://schema.affinity-project.org/totalOpenCollectionAccounts": Array [
                      Object {
                        "@value": "totalOpenCollectionAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalOpenInstallmentAccounts": Array [
                      Object {
                        "@value": "totalOpenInstallmentAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalOpenMortgageAccounts": Array [
                      Object {
                        "@value": "totalOpenMortgageAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalOpenOtherAccounts": Array [
                      Object {
                        "@value": "totalOpenOtherAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalOpenRevolvingAccounts": Array [
                      Object {
                        "@value": "totalOpenRevolvingAccounts",
                      },
                    ],
                    "https://schema.affinity-project.org/totalPublicRecords": Array [
                      Object {
                        "@value": "totalPublicRecords",
                      },
                    ],
                    "https://schema.affinity-project.org/tradelines": Array [
                      Object {
                        "@type": Array [
                          "https://schema.affinity-project.org/Tradeline",
                        ],
                        "https://schema.affinity-project.org/accountCondition": Array [
                          Object {
                            "@value": "accountCondition",
                          },
                        ],
                        "https://schema.affinity-project.org/accountDesignator": Array [
                          Object {
                            "@value": "accountDesignator",
                          },
                        ],
                        "https://schema.affinity-project.org/accountIsOpen": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/accountNumber": Array [
                          Object {
                            "@value": "accountNumber",
                          },
                        ],
                        "https://schema.affinity-project.org/accountStatusDate": Array [
                          Object {
                            "@value": "accountStatusDate",
                          },
                        ],
                        "https://schema.affinity-project.org/accountType": Array [
                          Object {
                            "@value": "accountType",
                          },
                        ],
                        "https://schema.affinity-project.org/amountPastDue": Array [
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
                                "@value": 100,
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/balanceCurrent": Array [
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
                                "@value": 100,
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/balanceMax": Array [
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
                                "@value": 100,
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/balancePercentage": Array [
                          Object {
                            "@value": 0,
                          },
                        ],
                        "https://schema.affinity-project.org/bureau": Array [
                          Object {
                            "@value": "bureau",
                          },
                        ],
                        "https://schema.affinity-project.org/closedDate": Array [
                          Object {
                            "@value": "closedDate",
                          },
                        ],
                        "https://schema.affinity-project.org/collateral": Array [
                          Object {
                            "@value": "collateral",
                          },
                        ],
                        "https://schema.affinity-project.org/creditLimit": Array [
                          Object {
                            "@value": "creditLimit",
                          },
                        ],
                        "https://schema.affinity-project.org/creditType": Array [
                          Object {
                            "@value": "creditType",
                          },
                        ],
                        "https://schema.affinity-project.org/creditor": Array [
                          Object {
                            "@value": "creditor",
                          },
                        ],
                        "https://schema.affinity-project.org/dateLatePayment": Array [
                          Object {
                            "@value": "dateLatePayment",
                          },
                        ],
                        "https://schema.affinity-project.org/disputeFlag": Array [
                          Object {
                            "@value": "disputeFlag",
                          },
                        ],
                        "https://schema.affinity-project.org/industryCode": Array [
                          Object {
                            "@value": "industryCode",
                          },
                        ],
                        "https://schema.affinity-project.org/late30Count": Array [
                          Object {
                            "@value": "late30Count",
                          },
                        ],
                        "https://schema.affinity-project.org/late60Count": Array [
                          Object {
                            "@value": "late60Count",
                          },
                        ],
                        "https://schema.affinity-project.org/late90Count": Array [
                          Object {
                            "@value": "late90Count",
                          },
                        ],
                        "https://schema.affinity-project.org/monthlyPayment": Array [
                          Object {
                            "@value": "monthlyPayment",
                          },
                        ],
                        "https://schema.affinity-project.org/monthsReviewed": Array [
                          Object {
                            "@value": "monthsReviewed",
                          },
                        ],
                        "https://schema.affinity-project.org/open": Array [
                          Object {
                            "@value": true,
                          },
                        ],
                        "https://schema.affinity-project.org/openedDate": Array [
                          Object {
                            "@value": "openedDate",
                          },
                        ],
                        "https://schema.affinity-project.org/payStatus": Array [
                          Object {
                            "@value": "payStatus",
                          },
                        ],
                        "https://schema.affinity-project.org/payStatuses": Array [
                          Object {
                            "@type": Array [
                              "https://schema.affinity-project.org/TradelinePayStatus",
                            ],
                            "https://schema.affinity-project.org/date": Array [
                              Object {
                                "@value": "date",
                              },
                            ],
                            "https://schema.affinity-project.org/status": Array [
                              Object {
                                "@value": "status",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/paymentFrequency": Array [
                          Object {
                            "@value": "paymentFrequency",
                          },
                        ],
                        "https://schema.affinity-project.org/position": Array [
                          Object {
                            "@value": "position",
                          },
                        ],
                        "https://schema.affinity-project.org/rating": Array [
                          Object {
                            "@value": "rating",
                          },
                        ],
                        "https://schema.affinity-project.org/remark": Array [
                          Object {
                            "@type": Array [
                              "https://schema.affinity-project.org/TradelineRemark",
                            ],
                            "https://schema.affinity-project.org/remark": Array [
                              Object {
                                "@value": "remark",
                              },
                            ],
                            "https://schema.affinity-project.org/remarkCode": Array [
                              Object {
                                "@value": "remarkCode",
                              },
                            ],
                          },
                        ],
                        "https://schema.affinity-project.org/reportedDate": Array [
                          Object {
                            "@value": "reportedDate",
                          },
                        ],
                        "https://schema.affinity-project.org/statement": Array [
                          Object {
                            "@value": "statement",
                          },
                        ],
                        "https://schema.affinity-project.org/subscriberCode": Array [
                          Object {
                            "@value": "subscriberCode",
                          },
                        ],
                        "https://schema.affinity-project.org/termMonths": Array [
                          Object {
                            "@value": "termMonths",
                          },
                        ],
                        "https://schema.affinity-project.org/termType": Array [
                          Object {
                            "@value": "termType",
                          },
                        ],
                        "https://schema.affinity-project.org/verificationIndicator": Array [
                          Object {
                            "@value": "verificationIndicator",
                          },
                        ],
                        "https://schema.affinity-project.org/verifiedDate": Array [
                          Object {
                            "@value": "verifiedDate",
                          },
                        ],
                        "https://schema.affinity-project.org/worstPastStatusCount": Array [
                          Object {
                            "@value": "worstPastStatusCount",
                          },
                        ],
                        "https://schema.affinity-project.org/worstPayStatus": Array [
                          Object {
                            "@value": "worstPayStatus",
                          },
                        ],
                      },
                    ],
                    "https://schema.affinity-project.org/utilization": Array [
                      Object {
                        "@value": "utilization",
                      },
                    ],
                    "https://schema.affinity-project.org/utilizationPercentage": Array [
                      Object {
                        "@value": 0,
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
