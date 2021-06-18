import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base/v1'
import { CreateThing, ExtendThing, Type, ExpandThing, createContextEntry, createVCContextEntry } from '../util'

type EmployeePersonV1Mixin = CreateThing<
  'EmployeePerson',
  {
    name: string
    officialEmail: string
    organizationName: string
    title: string
    employmentType: 'Full-time' | 'Part-time' | 'Contractor' | 'Intern'
    dateOfJoining: string
    employeeID?: string
    personalEmail?: string
    phoneNumber?: string
    employeeAddress?: string
    organizationAddress?: string
    organizationLogo?: string
    dateOfRelieving?: string
    team?: string
    responsibilities?: string
    otherDetails?: any
  }
>

export type EmployeePersonV1 = ExtendThing<EmployeePersonV1Mixin, PersonEV1>

export type VCSEmployeePersonV1 = VCV1Subject<ExpandThing<EmployeePersonV1>>

export type VCEmployeePersonV1 = VCV1<VCSEmployeePersonV1, Type<'EmployeeCredentialPersonV1'>>

export const getVCEmployeePersonV1Context = () => {
  const EmployeePersonEntry = createContextEntry<EmployeePersonV1Mixin, PersonEV1>({
    type: 'EmployeePerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCEmployeePersonV1>({
    type: 'EmployeeCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [EmployeePersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
