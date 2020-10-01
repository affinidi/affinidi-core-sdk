import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  ExpandThing,
  ExtendThing,
  Type,
  MaybeArray,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Person Related

type EmailPersonV1Mixin = CreateThing<
  'EmailPerson',
  {
    email: MaybeArray<string>
  }
>

export type EmailPersonV1 = ExtendThing<EmailPersonV1Mixin, PersonEV1>

export type VCSEmailPersonV1 = VCV1Subject<ExpandThing<EmailPersonV1>>

export type VCEmailPersonV1 = VCV1<VCSEmailPersonV1, Type<'EmailCredentialPersonV1'>>

export const getVCEmailPersonV1Context = () => {
  const dobPersonEntry = createContextEntry<EmailPersonV1Mixin, PersonEV1>({
    type: 'EmailPerson',
    typeIdBase: 'affSchema',
    fields: {
      email: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCEmailPersonV1>({
    type: 'EmailCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [dobPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type EmailOrganizationV1Mixin = CreateThing<
  'EmailOrganization',
  {
    email: MaybeArray<string>
  }
>

export type EmailOrganizationV1 = ExtendThing<EmailOrganizationV1Mixin, OrganizationEV1>

export type VCSEmailOrganizationV1 = VCV1Subject<ExpandThing<EmailOrganizationV1>>

export type VCEmailOrganizationV1 = VCV1<VCSEmailOrganizationV1, Type<'EmailCredentialOrganizationV1'>>

export const getVCEmailOrganizationV1Context = () => {
  const emailOrganizationEntry = createContextEntry<EmailOrganizationV1Mixin, OrganizationEV1>({
    type: 'EmailOrganization',
    typeIdBase: 'affSchema',
    fields: {
      email: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCEmailOrganizationV1>({
    type: 'EmailCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [emailOrganizationEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
