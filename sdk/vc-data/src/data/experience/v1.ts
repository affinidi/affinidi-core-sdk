import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base/v1'
import { CreateThing, ExtendThing, Type, ExpandThing, createContextEntry, createVCContextEntry } from '../util'

type ExperiencePersonV1Mixin = CreateThing<
  'ExperiencePerson',
  {
    name: string
    officialEmail: string
    organizationName: string
    title: string
    employmentType: 'Full-time' | 'Part-time' | 'Contractor' | 'Intern'
    dateOfJoining: string
    personalEmail?: string
    phoneNumber?: string
    EmployeeAddress?: string
    organizationAddress?: string
    organizationLogo?: string
    dateOfRelieving?: string
    team?: string
    responsibilities?: string
    otherDetails?: any
  }
>

export type ExperiencePersonV1 = ExtendThing<ExperiencePersonV1Mixin, PersonEV1>

export type VCSExperiencePersonV1 = VCV1Subject<ExpandThing<ExperiencePersonV1>>

export type VCExperiencePersonV1 = VCV1<VCSExperiencePersonV1, Type<'ExperienceCredentialPersonV1'>>

export const getVCExperiencePersonV1Context = () => {
  const ExperiencePersonEntry = createContextEntry<ExperiencePersonV1Mixin, PersonEV1>({
    type: 'ExperiencePerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCExperiencePersonV1>({
    type: 'ExperienceCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [ExperiencePersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
