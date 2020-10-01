import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { OrganizationEV1, getBaseV1ContextEntries } from '../base'
import { CreateThing, ExpandThing, ExtendThing, Type, createContextEntry, createVCContextEntry } from '../util'

// Lean Entity Related

type LeanEntityV1Mixin = CreateThing<'LeanEntityOrganization'>

export type LeanEntityV1 = ExtendThing<LeanEntityV1Mixin, OrganizationEV1>

export type VCSLeanEntityOrganizationV1 = VCV1Subject<ExpandThing<LeanEntityV1>>

export type VCLeanEntityOrganizationV1 = VCV1<VCSLeanEntityOrganizationV1, Type<'LeanEntityCredentialOrganizationV1'>>

export const getVCLeanEntityOrganizationV1Context = () => {
  const leanEntityEntry = createContextEntry<LeanEntityV1Mixin, OrganizationEV1>({
    type: 'LeanEntityOrganization',
    typeIdBase: 'affSchema',
    fields: {},
    vocab: 'schema',
  })

  return createVCContextEntry<VCLeanEntityOrganizationV1>({
    type: 'LeanEntityCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [leanEntityEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
