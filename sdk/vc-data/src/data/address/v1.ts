import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  MaybeArray,
  ExpandThing,
  ExtendThing,
  CreateExpandedThing,
  Type,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Person Related

type AddressPersonV1Mixin = CreateThing<
  'AddressPerson',
  {
    address: MaybeArray<CreateExpandedThing<'PostalAddress'>>
  }
>

export type AddressPersonV1 = ExtendThing<AddressPersonV1Mixin, PersonEV1>

export type VCSAddressPersonV1 = VCV1Subject<ExpandThing<AddressPersonV1>>

export type VCAddressPersonV1 = VCV1<VCSAddressPersonV1, Type<'AddressCredentialPersonV1'>>

export const getVCAddressPersonV1Context = () => {
  const addressPersonEntry = createContextEntry<AddressPersonV1Mixin, PersonEV1>({
    type: 'AddressPerson',
    typeIdBase: 'affSchema',
    fields: {
      address: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCAddressPersonV1>({
    type: 'AddressCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [addressPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type AddressOrganizationV1Mixin = CreateThing<
  'AddressOrganization',
  {
    address: MaybeArray<CreateExpandedThing<'PostalAddress'>>
  }
>

export type AddressOrganizationV1 = ExtendThing<AddressOrganizationV1Mixin, OrganizationEV1>

export type VCSAddressOrganizationV1 = VCV1Subject<ExpandThing<AddressOrganizationV1>>

export type VCAddressOrganizationV1 = VCV1<VCSAddressOrganizationV1, Type<'AddressCredentialOrganizationV1'>>

export const getVCAddressOrganizationV1Context = () => {
  const addressOrganizationEntry = createContextEntry<AddressOrganizationV1Mixin, OrganizationEV1>({
    type: 'AddressOrganization',
    typeIdBase: 'affSchema',
    fields: {
      address: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCAddressOrganizationV1>({
    type: 'AddressCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [addressOrganizationEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
