import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, MonetaryAmountRV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  MaybeArray,
  ExpandThing,
  ExtendThing,
  Type,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Helper Types

export type TradelinePayStatusV1 = CreateThing<
  'TradelinePayStatus',
  {
    date: string
    status: string
  }
>

export type TradelineRemarkV1 = CreateThing<
  'TradelineRemark',
  {
    remark: string
    remarkCode: string
  }
>

export type TradelineV1 = CreateThing<
  'Tradeline',
  {
    accountType?: string
    accountNumber?: string | number
    creditType?: string
    balanceCurrent?: ExpandThing<MonetaryAmountRV1>
    balanceMax?: ExpandThing<MonetaryAmountRV1>
    balancePercentage?: number
    rating?: string
    open?: boolean
    statement?: string

    subscriberCode?: string
    verifiedDate?: string
    reportedDate?: string
    openedDate?: string
    accountStatusDate?: string
    closedDate?: string
    bureau?: string
    accountCondition?: string
    accountDesignator?: string
    disputeFlag?: string
    industryCode?: string
    accountIsOpen?: boolean
    payStatus?: string
    verificationIndicator?: string
    remark?: MaybeArray<TradelineRemarkV1>

    monthsReviewed?: string
    monthlyPayment?: string
    late90Count?: string
    late60Count?: string
    late30Count?: string
    dateLatePayment?: string
    termMonths?: string
    collateral?: string
    amountPastDue?: ExpandThing<MonetaryAmountRV1>
    worstPastStatusCount?: string
    paymentFrequency?: string
    termType?: string
    worstPayStatus?: string
    payStatuses?: Array<TradelinePayStatusV1>
    creditLimit?: string

    creditor?: string | ExpandThing<OrganizationEV1>
    position?: string
  }
>

export type CreditScoreV1 = CreateThing<
  'CreditScore',
  {
    score?: number
    scoreType?: string
    populationRank?: number
    provider?: string
    lastUpdatedDate?: string
    utilizationPercentage?: number
    historyStartDate?: string
    paymentHistoryPercentage?: number
    statement?: string
    tradelines?: Array<TradelineV1>

    // Snapshot data
    creditDataSuppressed?: string
    totalAccounts?: string
    totalClosedAccounts?: string
    delinquentAccounts?: string
    derogatoryAccounts?: string
    openAccounts?: string
    totalBalances?: string
    totalMonthlyPayments?: string
    numberOfInquiries?: string
    totalPublicRecords?: string
    recentInquiries?: string
    balanceOpenRevolvingAccounts?: string
    totalOpenRevolvingAccounts?: string
    balanceOpenInstallmentAccounts?: string
    totalOpenInstallmentAccounts?: string
    balanceOpenMortgageAccounts?: string
    totalOpenMortgageAccounts?: string
    balanceOpenCollectionAccounts?: string
    totalOpenCollectionAccounts?: string
    balanceOpenOtherAccounts?: string
    totalOpenOtherAccounts?: string
    availableCredit?: string
    utilization?: string
    onTimePaymentPercentage?: string
    latePaymentPercentage?: string
    recentTradelinesOpened?: string
    dateOfOldestTrade?: string
    ageOfCredit?: string
    paymentHistory?: string
    securityFreeze?: string
    fraudAlert?: string
  }
>

const getHelperContextEntries = () => {
  const tradelinePayStatusEntry = createContextEntry<TradelinePayStatusV1>({
    type: 'TradelinePayStatus',
    typeIdBase: 'affSchema',
    fields: {
      date: 'affSchema',
      status: 'affSchema',
    },
  })

  const tradelineRemarkEntry = createContextEntry<TradelineRemarkV1>({
    type: 'TradelineRemark',
    typeIdBase: 'affSchema',
    fields: {
      remark: 'affSchema',
      remarkCode: 'affSchema',
    },
  })

  const tradelineEntry = createContextEntry<TradelineV1>({
    type: 'Tradeline',
    typeIdBase: 'affSchema',
    fields: {
      accountType: 'affSchema',
      accountNumber: 'affSchema',
      creditType: 'affSchema',
      balanceCurrent: 'affSchema',
      balanceMax: 'affSchema',
      balancePercentage: 'affSchema',
      rating: 'affSchema',
      open: 'affSchema',
      statement: 'affSchema',

      subscriberCode: 'affSchema',
      verifiedDate: 'affSchema',
      reportedDate: 'affSchema',
      openedDate: 'affSchema',
      accountStatusDate: 'affSchema',
      closedDate: 'affSchema',
      bureau: 'affSchema',
      accountCondition: 'affSchema',
      accountDesignator: 'affSchema',
      disputeFlag: 'affSchema',
      industryCode: 'affSchema',
      accountIsOpen: 'affSchema',
      payStatus: 'affSchema',
      verificationIndicator: 'affSchema',
      remark: 'affSchema',

      monthsReviewed: 'affSchema',
      monthlyPayment: 'affSchema',
      late90Count: 'affSchema',
      late60Count: 'affSchema',
      late30Count: 'affSchema',
      dateLatePayment: 'affSchema',
      termMonths: 'affSchema',
      collateral: 'affSchema',
      amountPastDue: 'affSchema',
      worstPastStatusCount: 'affSchema',
      paymentFrequency: 'affSchema',
      termType: 'affSchema',
      worstPayStatus: 'affSchema',
      payStatuses: 'affSchema',
      creditLimit: 'affSchema',

      creditor: 'affSchema',
      position: 'affSchema',
    },
  })

  const creditScoreEntry = createContextEntry<CreditScoreV1>({
    type: 'CreditScore',
    typeIdBase: 'affSchema',
    fields: {
      score: 'affSchema',
      scoreType: 'affSchema',
      populationRank: 'affSchema',
      provider: 'affSchema',
      lastUpdatedDate: 'affSchema',
      utilizationPercentage: 'affSchema',
      historyStartDate: 'affSchema',
      paymentHistoryPercentage: 'affSchema',
      statement: 'affSchema',
      tradelines: 'affSchema',

      // Snapshot data
      creditDataSuppressed: 'affSchema',
      totalAccounts: 'affSchema',
      totalClosedAccounts: 'affSchema',
      delinquentAccounts: 'affSchema',
      derogatoryAccounts: 'affSchema',
      openAccounts: 'affSchema',
      totalBalances: 'affSchema',
      totalMonthlyPayments: 'affSchema',
      numberOfInquiries: 'affSchema',
      totalPublicRecords: 'affSchema',
      recentInquiries: 'affSchema',
      balanceOpenRevolvingAccounts: 'affSchema',
      totalOpenRevolvingAccounts: 'affSchema',
      balanceOpenInstallmentAccounts: 'affSchema',
      totalOpenInstallmentAccounts: 'affSchema',
      balanceOpenMortgageAccounts: 'affSchema',
      totalOpenMortgageAccounts: 'affSchema',
      balanceOpenCollectionAccounts: 'affSchema',
      totalOpenCollectionAccounts: 'affSchema',
      balanceOpenOtherAccounts: 'affSchema',
      totalOpenOtherAccounts: 'affSchema',
      availableCredit: 'affSchema',
      utilization: 'affSchema',
      onTimePaymentPercentage: 'affSchema',
      latePaymentPercentage: 'affSchema',
      recentTradelinesOpened: 'affSchema',
      dateOfOldestTrade: 'affSchema',
      ageOfCredit: 'affSchema',
      paymentHistory: 'affSchema',
      securityFreeze: 'affSchema',
      fraudAlert: 'affSchema',
    },
  })

  return [tradelinePayStatusEntry, tradelineRemarkEntry, tradelineEntry, creditScoreEntry]
}

// Person Related

type CreditScorePersonV1Mixin = CreateThing<
  'CreditScorePerson',
  {
    hasCreditScore: MaybeArray<CreditScoreV1>
  }
>

export type CreditScorePersonV1 = ExtendThing<CreditScorePersonV1Mixin, PersonEV1>

export type VCSCreditScorePersonV1 = VCV1Subject<ExpandThing<CreditScorePersonV1>>

export type VCCreditScorePersonV1 = VCV1<VCSCreditScorePersonV1, Type<'CreditScoreCredentialPersonV1'>>

export const getVCCreditScorePersonV1Context = () => {
  const creditScorePersonEntry = createContextEntry<CreditScorePersonV1Mixin, PersonEV1>({
    type: 'CreditScorePerson',
    typeIdBase: 'affSchema',
    fields: {
      hasCreditScore: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCCreditScorePersonV1>({
    type: 'CreditScoreCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [creditScorePersonEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
