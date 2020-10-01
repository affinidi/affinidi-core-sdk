import { VCV1, VCV1Subject } from '@affinidi/vc-common'
import { R4 } from '@ahryman40k/ts-fhir-types'
import { FHIRPatientE, getFHIRV1ContextEntries } from '../base/v1'
import { CreateThing, Type, createContextEntry, createVCContextEntry, MaybeArray } from '../util'

export type ImmunizationV1 = CreateThing<
  'Immunization',
  R4.IImmunization & {
    resourceType: 'Immunization'
    id: string
    status: string
    vaccineCode: R4.ICodeableConcept
    patient: MaybeArray<R4.IReference | R4.IPatient>
    encounter: MaybeArray<R4.IReference | R4.IEncounter>
    occurrenceDateTime: string
    primarySource: boolean
    location: MaybeArray<R4.IReference | R4.ILocation>
    manufacturer: MaybeArray<R4.IReference | R4.IOrganization>
    lotNumber: string
    expirationDate?: string
    site: R4.ICodeableConcept
    route: R4.ICodeableConcept
    doseQuantity: R4.IQuantity
    note?: Array<R4.IAnnotation>
    protocolApplied?: Array<R4.IImmunization_ProtocolApplied>
  }
>

export type ObservationV1 = CreateThing<
  'Observation',
  R4.IObservation & {
    resourceType: 'Observation'
    category: Array<R4.ICodeableConcept>
    identifier: Array<R4.IIdentifier>
    status: R4.ObservationStatusKind
    method: R4.ICodeableConcept
    device: MaybeArray<R4.IReference | R4.IDevice | R4.IDeviceMetric>
    code: R4.ICodeableConcept
    subject: MaybeArray<R4.IReference | R4.IPatient | R4.IGroup | R4.IDevice | R4.ILocation>
    effectiveDateTime: string
    performer: MaybeArray<
      | R4.IReference
      | R4.IPractitioner
      | R4.IPractitionerRole
      | R4.IOrganization
      | R4.ICareTeam
      | R4.IPatient
      | R4.IRelatedPerson
    >
    component: Array<R4.IObservation_Component>
    referenceRange?: Array<R4.IObservation_Component>
  }
>

export type VCSImmunizationV1 = VCV1Subject<ImmunizationV1>
export type VCSObservationV1 = VCV1Subject<ObservationV1>
export type VCSPatientV1 = VCV1Subject<FHIRPatientE>

export type VCSHealthPassportImmunizationV1 = [VCSImmunizationV1, VCSPatientV1]
export type VCSHealthPassportObservationV1 = [VCSObservationV1, VCSPatientV1]
export type VCSHealthPassportGeneralV1 = [VCSImmunizationV1, VCSObservationV1, VCSPatientV1]

export type VCHealthPassportImmunizationV1 = VCV1<
  VCSHealthPassportImmunizationV1,
  Type<'HealthPassportImmunizationCredentialV1'>
>
export type VCHealthPassportObservationV1 = VCV1<
  VCSHealthPassportObservationV1,
  Type<'HealthPassportObservationCredentialV1'>
>
export type VCHealthPassportGeneralV1 = VCV1<VCSHealthPassportGeneralV1, Type<'HealthPassportGeneralCredentialV1'>>

export const getVCHealthPassportImmunizationV1Context = () => {
  const entryImmunization = createContextEntry<ImmunizationV1, R4.IImmunization>({
    type: 'Immunization',
    typeIdBase: 'fhir',
    fields: {},
    vocab: 'fhir',
  })

  return createVCContextEntry<VCHealthPassportImmunizationV1>({
    type: 'HealthPassportImmunizationCredentialV1',
    typeIdBase: 'fhir',
    entries: [entryImmunization, ...getFHIRV1ContextEntries()],

    vocab: 'fhir',
  })
}

export const getVCHealthPassportObservationV1Context = () => {
  const entryObservation = createContextEntry<ObservationV1, R4.IObservation>({
    type: 'Observation',
    typeIdBase: 'fhir',
    fields: {},
    vocab: 'fhir',
  })

  return createVCContextEntry<VCHealthPassportObservationV1>({
    type: 'HealthPassportObservationCredentialV1',
    typeIdBase: 'fhir',
    entries: [entryObservation, ...getFHIRV1ContextEntries()],

    vocab: 'fhir',
  })
}

export const getVCHealthPassportGeneralV1Context = () => {
  const entryImmunization = createContextEntry<ImmunizationV1, R4.IImmunization>({
    type: 'Immunization',
    typeIdBase: 'fhir',
    fields: {},
    vocab: 'fhir',
  })

  const entryObservation = createContextEntry<ObservationV1, R4.IObservation>({
    type: 'Observation',
    typeIdBase: 'fhir',
    fields: {},
    vocab: 'fhir',
  })

  return createVCContextEntry<VCHealthPassportGeneralV1>({
    type: 'HealthPassportGeneralCredentialV1',
    typeIdBase: 'fhir',
    entries: [entryImmunization, entryObservation, ...getFHIRV1ContextEntries()],

    vocab: 'fhir',
  })
}
