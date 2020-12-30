import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  ExpandThing,
  ExtendThing,
  Type,
  createContextEntry,
  createVCContextEntry,
  CreateExpandedThing,
} from '../util'

// Person Related

// Directly from schema.org
// If you are NOT exhaustively listing every possible field, use expanded thing
type EducationalOcupationalCredential = CreateExpandedThing<
  'EducationalOcupationalCredential',
  {
    credentialCategory: string | CreateExpandedThing<'DefinedTerm', { name: string }>
    educationalLevel: string | CreateExpandedThing<'DefinedTerm', { name: string }>
    recognizedBy: OrganizationEV1
    competencyRequired: string | CreateExpandedThing<'DefinedTerm', { name: string }>
    validFor?: string // string ISO 8601 duration format
    validIn?: CreateExpandedThing<'AdministrativeArea'> // Leaving 2nd arg blank because we are not defining the typescript types at the moment
    dateCreated: string // string ISO 8601 date format
  }
>

type EducationPersonV1Mixin = CreateThing<
  'EducationPerson',
  {
    hasCredential: EducationalOcupationalCredential
  }
>

export type EducationPersonV1 = ExtendThing<EducationPersonV1Mixin, PersonEV1>

export type VCSEducationPersonV1 = VCV1Subject<ExpandThing<EducationPersonV1>>

export type VCEducationPersonV1 = VCV1<VCSEducationPersonV1, Type<'EducationCredentialPersonV1'>>

export const getVCEducationPersonV1Context = () => {
  const educationPersonEntry = createContextEntry<EducationPersonV1Mixin, PersonEV1>({
    type: 'EducationPerson',
    typeIdBase: 'affSchema',
    fields: {
      hasCredential: 'schema',
    },
    vocab: 'schema', // vocab fills in the context for all the places we used 'expand thing' and didn't list out all the possible fields
  })

  return createVCContextEntry<VCEducationPersonV1>({
    type: 'EducationCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [educationPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
