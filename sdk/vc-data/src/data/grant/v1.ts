import { VCV1, LegacyVCV1Subject } from '@affinidi/vc-common'

import { createContextEntry, CreateThing, createVCContextEntry, ExpandThing, ExtendThing, Type } from '../util'

import { getBaseV1ContextEntries } from '../base/v1'

type GrantWinnerV1Mixin = CreateThing<
  'GrantWinner',
  {
    grantBeneficiary: CreateThing<'Organization'>
    dateAwarded: string
  }
>

export type GrantWinnerV1 = ExtendThing<GrantWinnerV1Mixin, CreateThing<'MonetaryGrant'>>

export type VCSGrantWinnerV1 = LegacyVCV1Subject<ExpandThing<GrantWinnerV1>>

export type VCGrantWinnerV1 = VCV1<VCSGrantWinnerV1, Type<'GrantWinnerCredentialV1'>>

export const getVCGrantWinnerCredentialV1Context = () => {
  const GrantWinnerCredentialEntry = createContextEntry<GrantWinnerV1Mixin, GrantWinnerV1Mixin>({
    type: 'GrantWinner',
    typeIdBase: 'affSchema',
    fields: {
      grantBeneficiary: 'affSchema',
      dateAwarded: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCGrantWinnerV1>({
    type: 'GrantWinnerCredentialV1',
    typeIdBase: 'affSchema',
    entries: [GrantWinnerCredentialEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
