import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base/v1'
import {
  CreateThing,
  ExtendThing,
  Type,
  ExpandThing,
  MaybeArray,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Helper Types

type ReceivedCredentialRoleV1Mixin = CreateThing<
  'ReceivedCredentialRole',
  {
    startDate?: string
    endDate?: string
    aggregatorDID?: string
    typesSome?: Array<string>
    typesAll?: Array<string>
    typesNot?: Array<string>
    contextsSome?: Array<string>
    contextsAll?: Array<string>
    contextsNot?: Array<string>
    issuerDIDIn?: Array<string>
    issuerDIDNotIn?: Array<string>
    receivedCredentials: MaybeArray<string | VCV1>
  }
>

export type ReceivedCredentialRoleV1 = ExtendThing<ReceivedCredentialRoleV1Mixin, CreateThing<'Role'>>

const getHelperContextEntries = () => {
  const receivedCredentialRoleEntry = createContextEntry<ReceivedCredentialRoleV1Mixin>({
    type: 'ReceivedCredentialRole',
    typeIdBase: 'affSchema',
    fields: {
      startDate: 'schema',
      endDate: 'schema',
      aggregatorDID: 'affSchema',
      typesSome: 'affSchema',
      typesAll: 'affSchema',
      typesNot: 'affSchema',
      contextsSome: 'affSchema',
      contextsAll: 'affSchema',
      contextsNot: 'affSchema',
      issuerDIDIn: 'affSchema',
      issuerDIDNotIn: 'affSchema',
      receivedCredentials: 'affSchema',
    },
    vocab: 'schema',
  })

  return [receivedCredentialRoleEntry]
}

// Person Related

type MetaPersonV1Mixin = CreateThing<
  'MetaPerson',
  {
    receivedCredentials: MaybeArray<ExpandThing<ReceivedCredentialRoleV1>>
  }
>

export type MetaPersonV1 = ExtendThing<MetaPersonV1Mixin, PersonEV1>

export type VCSMetaPersonV1 = VCV1Subject<ExpandThing<MetaPersonV1>>

export type VCMetaPersonV1 = VCV1<VCSMetaPersonV1, Type<'MetaCredentialPersonV1'>>

export const getVCMetaPersonV1Context = () => {
  const metaPersonEntry = createContextEntry<MetaPersonV1Mixin, PersonEV1>({
    type: 'MetaPerson',
    typeIdBase: 'affSchema',
    fields: {
      receivedCredentials: 'affSchema',
    },
    vocab: 'schema',
  })
  return createVCContextEntry<VCMetaPersonV1>({
    type: 'MetaCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [metaPersonEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type MetaOrganizationV1Mixin = CreateThing<
  'MetaOrganization',
  {
    receivedCredentials: MaybeArray<ReceivedCredentialRoleV1>
  }
>

export type MetaOrganizationV1 = ExtendThing<MetaOrganizationV1Mixin, OrganizationEV1>

export type VCSMetaOrganizationV1 = VCV1Subject<ExpandThing<MetaOrganizationV1>>

export type VCMetaOrganizationV1 = VCV1<VCSMetaOrganizationV1, Type<'MetaCredentialOrganizationV1'>>

export const getVCMetaOrganizationV1Context = () => {
  const metaOrganizationEntry = createContextEntry<MetaOrganizationV1Mixin, OrganizationEV1>({
    type: 'MetaOrganization',
    typeIdBase: 'affSchema',
    fields: {
      receivedCredentials: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCMetaOrganizationV1>({
    type: 'MetaCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [metaOrganizationEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
