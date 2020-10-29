import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base'
import { EmploymentPersonV1 } from '../employment'
import {
  CreateThing,
  ExpandThing,
  ExtendThing,
  Type,
  MaybeArray,
  createContextEntry,
  createVCContextEntry,
  CreateExpandedThing,
} from '../util'

type EmploymentInterview = CreateThing<
  'EmploymentInterview', // becomes @type
  {
    interviewer: MaybeArray<CreateThing<'ContactPoint'>>
    date: string
    location: CreateExpandedThing<'PostalAddress'>
  }
>

type PersonEmployeeCandidateRoleEV1Mixin = CreateThing<
  'PersonEmployeeCandidateRoleE',
  {
    expectedStartDate?: string
    offerDate: string
    interview: MaybeArray<EmploymentInterview>
  }
>

export type PersonEmployeeCandidateRoleEV1 = ExtendThing<PersonEmployeeCandidateRoleEV1Mixin, EmploymentPersonV1>

type EmploymentOfferPersonV1Mixin = CreateThing<
  'EmploymentOfferPerson',
  {
    worksFor: MaybeArray<PersonEmployeeCandidateRoleEV1>
  }
>

export type EmploymentOfferPersonV1 = ExtendThing<EmploymentOfferPersonV1Mixin, PersonEV1>

export type VCSEmploymentOfferPersonV1 = VCV1Subject<ExpandThing<EmploymentOfferPersonV1>>

export type VCEmploymentOfferPersonV1 = VCV1<VCSEmploymentOfferPersonV1, Type<'EmploymentOfferCredentialPersonV1'>>

export const getVCEmploymentOfferPersonV1Context = () => {
  const employmentOfferPersonEntry = createContextEntry<EmploymentOfferPersonV1Mixin, PersonEV1>({
    type: 'EmploymentOfferPerson',
    typeIdBase: 'affSchema',
    fields: {
      worksFor: 'schema',
    },
    vocab: 'schema',
  })

  const personEmployeeCandidateRole = createContextEntry<PersonEmployeeCandidateRoleEV1Mixin>({
    type: 'PersonEmployeeCandidateRoleE',
    typeIdBase: 'affSchema',
    fields: {
      expectedStartDate: 'affSchema',
      offerDate: 'schema',
      interview: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCEmploymentOfferPersonV1>({
    type: 'EmploymentOfferCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [employmentOfferPersonEntry, personEmployeeCandidateRole, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
