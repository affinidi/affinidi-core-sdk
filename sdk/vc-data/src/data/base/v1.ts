import { CreateThing, ExtendThing, MaybeArray, createContextEntry, ExpandThing, CreateExpandedThing } from '../util'

import { R4 } from '@ahryman40k/ts-fhir-types'

export type GovernmentOrgV1 =
  | CreateThing<'Country'>
  | CreateThing<'State'>
  | CreateThing<'City'>
  | OrganizationEV1
  | CreateThing<'Corporation'>
  | CreateThing<'GovernmentOrganization'>
  | CreateThing<'AdministrativeArea'>

export type MonetaryAmountRV1 = CreateThing<
  'MonetaryAmount',
  {
    currency: string
    value: number | string
  }
>

type PersonEV1Mixin = CreateThing<'PersonE'>

export type PersonEV1 = ExtendThing<PersonEV1Mixin, CreateThing<'Person'>>

type CredentialV1Mixin = CreateThing<
  'Credential',
  {
    dateRevoked?: string
    recognizedBy?: MaybeArray<ExpandThing<GovernmentOrgV1>>
  }
>

export type CredentialV1 = ExtendThing<CredentialV1Mixin, CreateThing<'EducationalOccupationalCredential'>>

type OrganizationalCredentialV1Mixin = CreateThing<
  'OrganizationalCredential',
  {
    credentialCategory: string // 'incorporation', 'foreign-registration'
    organizationType?: string | ExpandThing<CreateThing<'DefinedTerm'>>
    goodStanding?: boolean // Company is in "good standing" with the recognizing authority
    active?: boolean // Company has "active" status within recognizing authority's jurisdiction
    primaryJurisdiction?: boolean
    identifier?: ExpandThing<CreateThing<'PropertyValue'>> | string | number
  }
>
export type OrganizationalCredentialV1 = ExtendThing<OrganizationalCredentialV1Mixin, CredentialV1>

export type CredentialUV1 = OrganizationalCredentialV1 | CredentialV1

type OrganizationEV1Mixin = CreateThing<
  'OrganizationE',
  {
    hasCredential?: MaybeArray<ExpandThing<CredentialUV1>>
    industry?: MaybeArray<string>
    identifiers: MaybeArray<CreateExpandedThing<'PropertyValue'> | string | number>
  }
>

export type OrganizationEV1 = ExtendThing<OrganizationEV1Mixin, CreateThing<'Organization'>>

export type FHIRPatientE = R4.IPatient & {
  '@type': 'Patient'
  resourceType: 'Patient'
  identifier: Array<R4.IIdentifier>

  active: boolean
  name: Array<R4.IHumanName>
  gender: R4.PatientGenderKind
  birthDate: string

  telecom?: Array<R4.IContactPoint>
  address?: Array<R4.IAddress>
  contact?: Array<R4.IPatient_Contact>
  communication?: Array<R4.IPatient_Communication>
}

export const getBaseV1ContextEntries = () => {
  const personEV1ContextEntry = createContextEntry<PersonEV1Mixin>({
    type: 'PersonE',
    typeIdBase: 'affSchema',
    fields: {},
    vocab: 'schema',
  })

  const organizationEV1ContextEntry = createContextEntry<OrganizationEV1Mixin>({
    type: 'OrganizationE',
    typeIdBase: 'affSchema',
    fields: {
      hasCredential: 'schema',
      industry: 'affSchema',
      identifiers: 'affSchema',
    },
    vocab: 'schema',
  })

  const credentialEntry = createContextEntry<CredentialV1Mixin>({
    type: 'Credential',
    typeIdBase: 'affSchema',
    fields: {
      dateRevoked: 'affSchema',
      recognizedBy: 'affSchema',
    },
    vocab: 'schema',
  })

  const organizationalCredentialEntry = createContextEntry<OrganizationalCredentialV1Mixin>({
    type: 'OrganizationalCredential',
    typeIdBase: 'affSchema',
    fields: {
      credentialCategory: 'affSchema',
      organizationType: 'affSchema',
      goodStanding: 'affSchema',
      active: 'affSchema',
      primaryJurisdiction: 'affSchema',
      identifier: 'schema',
    },
    vocab: 'schema',
  })

  return [personEV1ContextEntry, organizationEV1ContextEntry, credentialEntry, organizationalCredentialEntry]
}

export const getFHIRV1ContextEntries = () => {
  const PatientEntry = createContextEntry<FHIRPatientE, R4.IPatient>({
    type: 'Patient',
    typeIdBase: 'fhir',
    fields: {
      resourceType: 'fhir',
      identifier: 'fhir',
      active: 'fhir',
      name: 'fhir',
      gender: 'fhir',
      birthDate: 'fhir',
      telecom: 'fhir',
      address: 'fhir',
      contact: 'fhir',
      communication: 'fhir',
    },
    vocab: 'fhir',
  })

  return [PatientEntry]
}
