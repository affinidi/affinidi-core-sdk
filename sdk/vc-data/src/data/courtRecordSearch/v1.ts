import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base'
import {
  CreateThing,
  ExpandThing,
  ExtendThing,
  Type,
  createContextEntry,
  createVCContextEntry,
  CreateExpandedThing,
} from '../util'

// Helper Types

export type CourtRecordSearchQueryV1 = CreateThing<
  'CourtRecordSearchQuery',
  {
    parent?: PersonEV1
    spouse?: PersonEV1
    birthDate?: string
    address: CreateExpandedThing<'PostalAddress'> | string
    addressStatus: 'current' | 'permanent' | 'past'
  }
>

export type CourtRecordSearchV1 = CreateThing<
  'CourtRecordSearch',
  {
    result: 'pass' | 'fail'
    query: CourtRecordSearchQueryV1
  }
>

const getHelperContextEntries = () => {
  const courtRecordSearchQueryEntry = createContextEntry<CourtRecordSearchQueryV1>({
    type: 'CourtRecordSearchQuery',
    typeIdBase: 'affSchema',
    fields: {
      parent: 'schema',
      birthDate: 'schema',
      spouse: 'schema',
      address: 'schema',
      addressStatus: 'affSchema',
    },
  })

  const courtRecordSearchEntry = createContextEntry<CourtRecordSearchV1>({
    type: 'CourtRecordSearch',
    typeIdBase: 'affSchema',
    fields: {
      result: 'affSchema',
      query: 'affSchema',
    },
  })

  return [courtRecordSearchEntry, courtRecordSearchQueryEntry]
}

// Person Related

type CourtRecordSearchPersonV1Mixin = CreateThing<
  'CourtRecordSearchPerson',
  {
    hasCourtRecordSearch: CourtRecordSearchV1
  }
>

export type CourtRecordSearchPersonV1 = ExtendThing<CourtRecordSearchPersonV1Mixin, PersonEV1>

export type VCSCourtRecordSearchPersonV1 = VCV1Subject<ExpandThing<CourtRecordSearchPersonV1>>

export type VCCourtRecordSearchPersonV1 = VCV1<
  VCSCourtRecordSearchPersonV1,
  Type<'CourtRecordSearchCredentialPersonV1'>
>

export const getVCCourtRecordSearchPersonV1Context = () => {
  const courtRecordSearchPersonEntry = createContextEntry<CourtRecordSearchPersonV1Mixin, PersonEV1>({
    type: 'CourtRecordSearchPerson',
    typeIdBase: 'affSchema',
    fields: {
      hasCourtRecordSearch: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCCourtRecordSearchPersonV1>({
    type: 'CourtRecordSearchCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [courtRecordSearchPersonEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
