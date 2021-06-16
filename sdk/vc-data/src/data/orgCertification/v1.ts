import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { OrganizationEV1, getBaseV1ContextEntries } from '../base'
import { CreateThing, ExpandThing, Type, createContextEntry, createVCContextEntry, ExtendThing } from '../util'

export type OrganizationCredentialV1Mixin = CreateThing<
  'OrganizationCredential',
  {
    ownerOrganization: ExpandThing<OrganizationEV1>
  }
>

export type OrganizationCredentialV1 = ExtendThing<OrganizationCredentialV1Mixin, OrganizationEV1>

export type VCSOrganizationCredentialV1 = VCV1Subject<ExpandThing<OrganizationCredentialV1>>

export type VCOrganizationCredentialV1 = VCV1<VCSOrganizationCredentialV1, Type<'OrganizationCredentialV1'>>

export const getVCOrganizationCredentialV1 = () => {
  const organizationCredential = createContextEntry<OrganizationCredentialV1Mixin>({
    type: 'OrganizationCredential',
    typeIdBase: 'affSchema',
    fields: {
      ownerOrganization: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCOrganizationCredentialV1>({
    type: 'OrganizationCredentialV1',
    typeIdBase: 'affSchema',
    entries: [organizationCredential, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
