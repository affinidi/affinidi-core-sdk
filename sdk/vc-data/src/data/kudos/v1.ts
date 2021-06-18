import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base/v1'
import { CreateThing, ExtendThing, Type, ExpandThing, createContextEntry, createVCContextEntry } from '../util'

type KudosPersonV1Mixin = CreateThing<
  'KudosPerson',
  {
    name: string
    team?: string
    title?: string
    message: string
    awardedDate: string
    awardedBy: string
    awarderTitle?: string
    expiryDate?: string
    certificate?: string
  }
>

export type KudosPersonV1 = ExtendThing<KudosPersonV1Mixin, PersonEV1>

export type VCSKudosPersonV1 = VCV1Subject<ExpandThing<KudosPersonV1>>

export type VCKudosPersonV1 = VCV1<VCSKudosPersonV1, Type<'KudosCredentialPersonV1'>>

export const getVCKudosPersonV1Context = () => {
  const KudosPersonEntry = createContextEntry<KudosPersonV1Mixin, PersonEV1>({
    type: 'KudosPerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCKudosPersonV1>({
    type: 'KudosCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [KudosPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
