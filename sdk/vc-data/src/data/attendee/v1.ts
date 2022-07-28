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

type AttendeePersonV1Mixin = CreateThing<
  'AttendeePerson',
  {
    firstName: string
    lastName: string
    participantEmail: string
    dateOfBirth?: string
    eventName: string
    eventDescription?: string
    transactionLink?: string
    otherTeamMembers?: MaybeArray<string>
    awardedDate: string
    awardedBy: string
    expiryDate?: string
    certificate?: string
    awardeeDescription?: string
    issuingAuthorityLogo?: string
    profileLink?: string
  }
>

export type AttendeePersonV1 = ExtendThing<AttendeePersonV1Mixin, PersonEV1>

export type VCSAttendeePersonV1 = LegacyVCV1Subject<ExpandThing<AttendeePersonV1>>

export type VCAttendeePersonV1 = VCV1<VCSAttendeePersonV1, Type<'AttendeeCredentialPersonV1'>>

export const getVCAttendeePersonV1Context = () => {
  const AttendeePersonEntry = createContextEntry<AttendeePersonV1Mixin, PersonEV1>({
    type: 'AttendeePerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCAttendeePersonV1>({
    type: 'AttendeeCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [AttendeePersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
