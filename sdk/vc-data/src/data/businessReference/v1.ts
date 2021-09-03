import { VCV1, VCV1Subject } from '@affinidi/vc-common'
import { createContextEntry, CreateThing, createVCContextEntry, ExpandThing, Type } from '../util'
import { OrganizationEV1, getBaseV1ContextEntries } from '../base/v1'

export type EducationalOccupationalCredentialEV1 = CreateThing<'EducationalOccupationalCredential'>

export const getHelperContextEntries = () => {
  const educationalOccupationalCredentialEV1ContextEntry = createContextEntry<EducationalOccupationalCredentialEV1>({
    type: 'EducationalOccupationalCredential',
    typeIdBase: 'schema',
    fields: {},
    vocab: 'schema',
  })

  return [educationalOccupationalCredentialEV1ContextEntry]
}

type BusinessReferenceV1 = CreateThing<
  'BusinessReference',
  {
    dateofCommencement: string
    isCurrent: string
    fintech: OrganizationEV1
    reference: ExpandThing<EducationalOccupationalCredentialEV1>
  }
>

// export type BusinessReferenceV1 = ExtendThing<BusinessReferenceV1Mixin, EducationalOccupationalCredentialEV1>

export type VCSBusinessReferenceV1 = VCV1Subject<ExpandThing<BusinessReferenceV1>>

export type VCBusinessReferenceV1 = VCV1<VCSBusinessReferenceV1, Type<'BusinessReferenceCredentialV1'>>

export const getVCBusinessReferenceCredentialV1Context = () => {
  const businessReferenceEntry = createContextEntry<BusinessReferenceV1>({
    type: 'BusinessReference',
    typeIdBase: 'affSchema',
    fields: {
      dateofCommencement: 'affSchema',
      fintech: 'affSchema',
      isCurrent: 'affSchema',
      reference: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCBusinessReferenceV1>({
    type: 'BusinessReferenceCredentialV1',
    typeIdBase: 'affSchema',
    entries: [businessReferenceEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
