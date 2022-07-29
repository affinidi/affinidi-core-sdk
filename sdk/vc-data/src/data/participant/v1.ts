import { VCV1, LegacyVCV1Subject } from '@affinidi/vc-common'

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

type ParticipantPersonV1Mixin = CreateThing<
  'ParticipantPerson',
  {
    firstName: string
    lastName: string
    participantEmail: string
    dateOfBirth?: string
    eventName: string
    eventDescription?: string
    transactionLink?: string
    otherTeamMembers?: MaybeArray<string>
    awardedBy: string
    participationDate: string
    profileLink?: string
  }
>

export type ParticipantPersonV1 = ExtendThing<ParticipantPersonV1Mixin, PersonEV1>

export type VCSParticipantPersonV1 = LegacyVCV1Subject<ExpandThing<ParticipantPersonV1>>

export type VCParticipantPersonV1 = VCV1<VCSParticipantPersonV1, Type<'ParticipantCredentialPersonV1'>>

export const getVCParticipantPersonV1Context = () => {
  const ParticipantPersonEntry = createContextEntry<ParticipantPersonV1Mixin, PersonEV1>({
    type: 'ParticipantPerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCParticipantPersonV1>({
    type: 'ParticipantCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [ParticipantPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
