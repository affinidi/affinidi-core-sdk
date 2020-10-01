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

type NamePersonV1Mixin = CreateThing<
  'NamePerson',
  | {
      name: string
    }
  | {
      givenName: string
      familyName: string
    }
>

export type NamePersonV1 = ExtendThing<NamePersonV1Mixin, PersonEV1>

export type VCSNamePersonV1 = VCV1Subject<ExpandThing<NamePersonV1>>

export type VCNamePersonV1 = VCV1<VCSNamePersonV1, Type<'NameCredentialPersonV1'>>

export const getVCNamePersonV1Context = () => {
  const namePersonEntry = createContextEntry<NamePersonV1Mixin, PersonEV1>({
    type: 'NamePerson',
    typeIdBase: 'affSchema',
    fields: {
      name: 'schema',
      givenName: 'schema',
      fullName: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCNamePersonV1>({
    type: 'NameCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [namePersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type NameOrganizationV1Mixin = CreateThing<
  'NameOrganization',
  {
    name: MaybeArray<string>
  }
>

export type NameOrganizationV1 = ExtendThing<NameOrganizationV1Mixin, OrganizationEV1>

export type VCSNameOrganizationV1 = VCV1Subject<ExpandThing<NameOrganizationV1>>

export type VCNameOrganizationV1 = VCV1<VCSNameOrganizationV1, Type<'NameCredentialOrganizationV1'>>

export const getVCNameOrganizationV1Context = () => {
  const nameOrganizationEntry = createContextEntry<NameOrganizationV1Mixin, OrganizationEV1>({
    type: 'NameOrganization',
    typeIdBase: 'affSchema',
    fields: {
      name: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCNameOrganizationV1>({
    type: 'NameCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [nameOrganizationEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
