import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries, GovernmentOrgV1 } from '../base/v1'
import { CreateThing, ExtendThing, Type, ExpandThing, createContextEntry, createVCContextEntry } from '../util'

// Helper Types

type NatPropertyValueV1Mixin = CreateThing<
  'NatPropertyValue',
  {
    propertyID: string
    value: string | number
  }
>

export type NatPropertyValueV1 = ExtendThing<NatPropertyValueV1Mixin, CreateThing<'PropertyValue'>>

type NationalityRoleV1Mixin = CreateThing<
  'NationalityRole',
  {
    nationality: ExpandThing<GovernmentOrgV1>
    identifier: ExpandThing<NatPropertyValueV1>
  }
>

export type NationalityRoleV1 = ExtendThing<NationalityRoleV1Mixin, CreateThing<'Role'>>

const getHelperContextEntries = () => {
  const natPropertyValueEntry = createContextEntry<NatPropertyValueV1Mixin>({
    type: 'NatPropertyValue',
    typeIdBase: 'affSchema',
    fields: {
      propertyID: 'affSchema',
      value: 'schema',
    },
    vocab: 'schema',
  })

  const nationalityRoleEntry = createContextEntry<NationalityRoleV1Mixin>({
    type: 'NationalityRole',
    typeIdBase: 'affSchema',
    fields: {
      nationality: 'affSchema',
      identifier: 'schema',
    },
    vocab: 'schema',
  })

  return [natPropertyValueEntry, nationalityRoleEntry]
}

// Person Related

type NatIDNumPersonV1Mixin = CreateThing<
  'NatIDNumPerson',
  {
    nationality: ExpandThing<NationalityRoleV1>
  }
>

export type NatIDNumPersonV1 = ExtendThing<NatIDNumPersonV1Mixin, PersonEV1>

export type VCSNatIDNumPersonV1 = VCV1Subject<ExpandThing<NatIDNumPersonV1>>

export type VCNatIDNumPersonV1 = VCV1<VCSNatIDNumPersonV1, Type<'NatIDNumCredentialPersonV1'>>

export const getVCNatIDNumPersonV1Context = () => {
  const phonePersonEntry = createContextEntry<NatIDNumPersonV1Mixin, PersonEV1>({
    type: 'NatIDNumPerson',
    typeIdBase: 'affSchema',
    fields: {
      nationality: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCNatIDNumPersonV1>({
    type: 'NatIDNumCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [phonePersonEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type NatIDNumOrganizationV1Mixin = CreateThing<
  'NatIDNumOrganization',
  {
    nationality: ExpandThing<NationalityRoleV1>
  }
>

export type NatIDNumOrganizationV1 = ExtendThing<NatIDNumOrganizationV1Mixin, OrganizationEV1>

export type VCSNatIDNumOrganizationV1 = VCV1Subject<ExpandThing<NatIDNumOrganizationV1>>

export type VCNatIDNumOrganizationV1 = VCV1<VCSNatIDNumOrganizationV1, Type<'NatIDNumCredentialOrganizationV1'>>

export const getVCNatIDNumOrganizationV1Context = () => {
  const phoneOrganizationEntry = createContextEntry<NatIDNumOrganizationV1Mixin, OrganizationEV1>({
    type: 'NatIDNumOrganization',
    typeIdBase: 'affSchema',
    fields: {
      nationality: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCNatIDNumOrganizationV1>({
    type: 'NatIDNumCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [phoneOrganizationEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
