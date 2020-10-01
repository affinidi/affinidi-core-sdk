import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base/v1'
import {
  CreateThing,
  MaybeArray,
  ExtendThing,
  Type,
  ExpandThing,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Person Related

type PhonePersonV1Mixin = CreateThing<
  'PhonePerson',
  {
    telephone: MaybeArray<string>
  }
>

export type PhonePersonV1 = ExtendThing<PhonePersonV1Mixin, PersonEV1>

export type VCSPhonePersonV1 = VCV1Subject<ExpandThing<PhonePersonV1>>

export type VCPhonePersonV1 = VCV1<VCSPhonePersonV1, Type<'PhoneCredentialPersonV1'>>

export const getVCPhonePersonV1Context = () => {
  const phonePersonEntry = createContextEntry<PhonePersonV1Mixin, PersonEV1>({
    type: 'PhonePerson',
    typeIdBase: 'affSchema',
    fields: {
      telephone: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCPhonePersonV1>({
    type: 'PhoneCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [phonePersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type PhoneOrganizationV1Mixin = CreateThing<
  'PhoneOrganization',
  {
    telephone: MaybeArray<string>
  }
>

export type PhoneOrganizationV1 = ExtendThing<PhoneOrganizationV1Mixin, OrganizationEV1>

export type VCSPhoneOrganizationV1 = VCV1Subject<ExpandThing<PhoneOrganizationV1>>

export type VCPhoneOrganizationV1 = VCV1<VCSPhoneOrganizationV1, Type<'PhoneCredentialOrganizationV1'>>

export const getVCPhoneOrganizationV1Context = () => {
  const phoneOrganizationEntry = createContextEntry<PhoneOrganizationV1Mixin, OrganizationEV1>({
    type: 'PhoneOrganization',
    typeIdBase: 'affSchema',
    fields: {
      telephone: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCPhoneOrganizationV1>({
    type: 'PhoneCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [phoneOrganizationEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
