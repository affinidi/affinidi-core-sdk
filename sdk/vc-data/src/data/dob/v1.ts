import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base'
import { CreateThing, ExpandThing, ExtendThing, Type, createContextEntry, createVCContextEntry } from '../util'

// Person Related

type DOBPersonV1Mixin = CreateThing<
  'DOBPerson',
  {
    birthDate: string
  }
>

export type DOBPersonV1 = ExtendThing<DOBPersonV1Mixin, PersonEV1>

export type VCSDOBPersonV1 = VCV1Subject<ExpandThing<DOBPersonV1>>

export type VCDOBPersonV1 = VCV1<VCSDOBPersonV1, Type<'DOBCredentialPersonV1'>>

export const getVCDOBPersonV1Context = () => {
  const dobPersonEntry = createContextEntry<DOBPersonV1Mixin, PersonEV1>({
    type: 'DOBPerson',
    typeIdBase: 'affSchema',
    fields: {
      birthDate: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCDOBPersonV1>({
    type: 'DOBCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [dobPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
