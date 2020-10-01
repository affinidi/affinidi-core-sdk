import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  ExpandThing,
  ExtendThing,
  Type,
  createContextEntry,
  createVCContextEntry,
  MaybeArray,
  CreateExpandedThing,
} from '../util'

// Person Related

type GenderPersonV1Mixin = CreateThing<
  'GenderPerson',
  {
    gender: MaybeArray<CreateExpandedThing<'GenderType'> | string>
  }
>

export type GenderPersonV1 = ExtendThing<GenderPersonV1Mixin, PersonEV1>

export type VCSGenderPersonV1 = VCV1Subject<ExpandThing<GenderPersonV1>>

export type VCGenderPersonV1 = VCV1<VCSGenderPersonV1, Type<'GenderCredentialPersonV1'>>

export const getVCGenderPersonV1Context = () => {
  const genderPersonEntry = createContextEntry<GenderPersonV1Mixin, PersonEV1>({
    type: 'GenderPerson',
    typeIdBase: 'affSchema',
    fields: {
      gender: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCGenderPersonV1>({
    type: 'GenderCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [genderPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
