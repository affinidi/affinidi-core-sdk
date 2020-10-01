import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries, GovernmentOrgV1 } from '../base'
import {
  CreateThing,
  ExpandThing,
  ExtendThing,
  Type,
  MaybeArray,
  createContextEntry,
  createVCContextEntry,
} from '../util'

// Helper Types

export type TDocumentClassV1 =
  | 'unknown'
  | 'passport'
  | 'visa'
  | 'drivers_license'
  | 'identification_card'
  | 'permit'
  | 'currency'
  | 'residence_document'
  | 'travel_document'
  | 'birth_certificate'
  | 'vehicle_registration'
  | 'other'
  | 'weapon_license'
  | 'tribal_identification'
  | 'voter_identification'
  | 'military'

type IDDocumentV1Mixin = CreateThing<
  'IDDocument',
  {
    issuer: ExpandThing<GovernmentOrgV1>
    documentType?: string
    issueDate?: string
    issueType?: string
    expirationDate?: string
    classificationMethod?: 'automatic' | 'manual'
    idClass: TDocumentClassV1
    idClassName?: string
    countryCode?: string
    frontImage?: string
    backImage?: string
    generic?: boolean
    keesingCode?: string
  }
>

export type IDDocumentV1 = ExtendThing<IDDocumentV1Mixin, CreateThing<'CreativeWork'>>

export type IDDocumentFaceMatchV1 = CreateThing<
  'IDDocumentFaceMatch',
  {
    isMatch?: boolean
    score?: number
    identifier?: number
  }
>

type IDDocumentRoleV1Mixin = CreateThing<
  'IDDocumentRole',
  {
    authenticationResult?: string
    selfieImage?: string
    faceMatch?: MaybeArray<ExpandThing<IDDocumentFaceMatchV1>>
    hasIDDocument: MaybeArray<ExpandThing<IDDocumentV1>>
  }
>

export type IDDocumentRoleV1 = ExtendThing<IDDocumentRoleV1Mixin, CreateThing<'Role'>>

const getHelperEntries = () => {
  const idDocumentEntry = createContextEntry<IDDocumentV1Mixin>({
    type: 'IDDocument',
    typeIdBase: 'affSchema',
    fields: {
      issuer: 'affSchema',
      documentType: 'affSchema',
      issueDate: 'affSchema',
      issueType: 'affSchema',
      expirationDate: 'affSchema',
      classificationMethod: 'affSchema',
      idClass: 'affSchema',
      idClassName: 'affSchema',
      countryCode: 'affSchema',
      frontImage: 'affSchema',
      backImage: 'affSchema',
      generic: 'affSchema',
      keesingCode: 'affSchema',
    },
  })

  const idDocumentFaceMatchEntry = createContextEntry<IDDocumentFaceMatchV1>({
    type: 'IDDocumentFaceMatch',
    typeIdBase: 'affSchema',
    fields: {
      isMatch: 'affSchema',
      score: 'affSchema',
      identifier: 'schema',
    },
  })

  const idDocumentRoleEntry = createContextEntry<IDDocumentRoleV1Mixin>({
    type: 'IDDocumentRole',
    typeIdBase: 'affSchema',
    fields: {
      authenticationResult: 'affSchema',
      selfieImage: 'affSchema',
      faceMatch: 'affSchema',
      hasIDDocument: 'affSchema',
    },
  })

  return [idDocumentEntry, idDocumentFaceMatchEntry, idDocumentRoleEntry]
}

// Person Related

type IDDocumentPersonV1Mixin = CreateThing<
  'IDDocumentPerson',
  {
    hasIDDocument: MaybeArray<ExpandThing<IDDocumentRoleV1>>
  }
>

export type IDDocumentPersonV1 = ExtendThing<IDDocumentPersonV1Mixin, PersonEV1>

export type VCSIDDocumentPersonV1 = VCV1Subject<ExpandThing<IDDocumentPersonV1>>

export type VCIDDocumentPersonV1 = VCV1<VCSIDDocumentPersonV1, Type<'IDDocumentCredentialPersonV1'>>

export const getVCIDDocumentPersonV1Context = () => {
  const idDocumentPersonEntry = createContextEntry<IDDocumentPersonV1Mixin, PersonEV1>({
    type: 'IDDocumentPerson',
    typeIdBase: 'affSchema',
    fields: {
      hasIDDocument: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCIDDocumentPersonV1>({
    type: 'IDDocumentCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [idDocumentPersonEntry, ...getHelperEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
