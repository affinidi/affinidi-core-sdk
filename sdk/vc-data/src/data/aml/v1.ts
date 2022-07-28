import { VCV1, LegacyVCV1Subject } from '@affinidi/vc-common'

import { GovernmentOrgV1, PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  MaybeArray,
  ExpandThing,
  ExtendThing,
  Type,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Helper Types

export type AMLListV1 = CreateThing<
  'AMLList',
  {
    name?: string
    url?: string
  }
>

export type AMLHitV1 = CreateThing<
  'AMLHit',
  {
    identifier?: string
    name?: string
  }
>

export type AMLSearchV1 = CreateThing<
  'AMLSearch',
  {
    hitLocation?: string | ExpandThing<GovernmentOrgV1>
    hitNumber?: number
    lists?: Array<AMLListV1>
    recordId?: MaybeArray<string>
    identifier?: string
    score?: string | number
    hits?: Array<AMLHitV1>
    flagType?: string
    comment?: string
  }
>

const getHelperContextEntries = () => {
  const amlListEntry = createContextEntry<AMLListV1>({
    type: 'AMLList',
    typeIdBase: 'affSchema',
    fields: {
      name: 'schema',
      url: 'schema',
    },
  })

  const amlHitEntry = createContextEntry<AMLHitV1>({
    type: 'AMLHit',
    typeIdBase: 'affSchema',
    fields: {
      identifier: 'affSchema',
      name: 'affSchema',
    },
  })

  const amlSearchEntry = createContextEntry<AMLSearchV1>({
    type: 'AMLSearch',
    typeIdBase: 'affSchema',
    fields: {
      hitLocation: 'affSchema',
      hitNumber: 'affSchema',
      lists: 'affSchema',
      recordId: 'affSchema',
      identifier: 'affSchema',
      score: 'affSchema',
      hits: 'affSchema',
      flagType: 'affSchema',
      comment: 'affSchema',
    },
  })

  return [amlListEntry, amlHitEntry, amlSearchEntry]
}

// Person Related

type AMLPersonV1Mixin = CreateThing<
  'AMLPerson',
  {
    hasAMLSeach: AMLSearchV1
  }
>

export type AMLPersonV1 = ExtendThing<AMLPersonV1Mixin, PersonEV1>

export type VCSAMLPersonV1 = LegacyVCV1Subject<ExpandThing<AMLPersonV1>>

export type VCAMLPersonV1 = VCV1<VCSAMLPersonV1, Type<'AMLCredentialPersonV1'>>

export const getVCAMLPersonV1Context = () => {
  const amlPersonEntry = createContextEntry<AMLPersonV1Mixin, PersonEV1>({
    type: 'AMLPerson',
    typeIdBase: 'affSchema',
    fields: {
      hasAMLSeach: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCAMLPersonV1>({
    type: 'AMLCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [amlPersonEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Organization Related

type AMLOrganizationV1Mixin = CreateThing<
  'AMLOrganization',
  {
    hasAMLSeach: AMLSearchV1
  }
>

export type AMLOrganizationV1 = ExtendThing<AMLOrganizationV1Mixin, OrganizationEV1>

export type VCSAMLOrganizationV1 = LegacyVCV1Subject<ExpandThing<AMLOrganizationV1>>

export type VCAMLOrganizationV1 = VCV1<VCSAMLOrganizationV1, Type<'AMLCredentialOrganizationV1'>>

export const getVCAMLOrganizationV1Context = () => {
  const amlOrganizationEntry = createContextEntry<AMLOrganizationV1Mixin, OrganizationEV1>({
    type: 'AMLOrganization',
    typeIdBase: 'affSchema',
    fields: {
      hasAMLSeach: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCAMLOrganizationV1>({
    type: 'AMLCredentialOrganizationV1',
    typeIdBase: 'affSchema',
    entries: [amlOrganizationEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
