import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base/v1'
import {
  CreateThing,
  MaybeArray,
  ExtendThing,
  Type,
  ExpandThing,
  createContextEntry,
  createVCContextEntry,
} from '../util'

type WinnerPersonV1Mixin = CreateThing<
  'WinnerPerson',
  {
    firstName: string,
    lastName: string,
    participantEmail: string,
    dateOfBirth?: string,
    eventName: string,
    eventDescription?: string,
    prizeName: string,
    prizeCurrency?: string,
    prizeAmount?: string,
    transactionLink?: string,
    otherTeamMembers?: MaybeArray<string>,
    awardedDate: string,
    awardedBy: string,
    expiryDate?: string,
    certificate?: string
  }
>

export type WinnerPersonV1 = ExtendThing<WinnerPersonV1Mixin, PersonEV1>

export type VCSWinnerPersonV1 = VCV1Subject<ExpandThing<WinnerPersonV1>>

export type VCWinnerPersonV1 = VCV1<VCSWinnerPersonV1, Type<'WinnerCredentialPersonV1'>>

export const getVCWinnerPersonV1Context = () => {
  const WinnerPersonEntry = createContextEntry<WinnerPersonV1Mixin, PersonEV1>({
    type: 'WinnerPerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCWinnerPersonV1>({
    type: 'WinnerCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [WinnerPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
