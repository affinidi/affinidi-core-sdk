import { VCV1, VCV1Subject } from '@affinidi/vc-common'
import { EducationPersonV1 } from '../education/v1'
import { getBaseV1ContextEntries } from '../base/v1'
import { CreateThing, CreateExpandedThing, ExtendThing, Type, ExpandThing, createContextEntry, createVCContextEntry } from '../util'

type CourseDetails = CreateExpandedThing<
    'CourseDetails',
    {
        name: string
        completionDate: string
        description: string
        result: string
        ndscApproved: boolean
        duration: string
        sector: string
        nameOfSectorIfOther: string
        skillInstructorOrTrainerName: string
        mobilizerName: string
    }
>

type BatchDetails = CreateExpandedThing<
    'BatchDetails',
    {
        name: string
        sdmsBatchId: string
        startDate: string
        endDate: string
        trainingStatus: string
        grade: string
        certified: boolean
    }
>

type Certification = CreateExpandedThing<
    'Certification',
    {
        name: string
        certificateNo: string
        issuingAuthorityName: string
        issuanceDate: string
        passingDate: string
    }
>

type EducationExpandedV1Mixin = CreateThing<
    'EducationExpanded',
    {        
        course: CourseDetails,
        batch: BatchDetails,
        certification: Certification
    }
>

export type EducationExpandedV1 = ExtendThing<EducationExpandedV1Mixin, EducationPersonV1>

export type VCSEducationExpandedV1 = VCV1Subject<ExpandThing<EducationPersonV1>>

export type VCEducationExpandedV1 = VCV1<VCSEducationExpandedV1, Type<'EducationExpandedV1'>>

export const getVCEducationExpandedV1Context = () => {
    const educationExpandedEntry = createContextEntry<EducationExpandedV1Mixin, EducationPersonV1>({
      type: 'EducationExpanded',
      typeIdBase: 'affSchema',
      fields: {
        participant: 'affschema',
        course: 'affschema',
        batch: 'affschema',
        certification: 'affschema',
      },
      vocab: 'schema', // vocab fills in the context for all the places we used 'expand thing' and didn't list out all the possible fields
    })
  
    return createVCContextEntry<VCEducationExpandedV1>({
      type: 'EducationExpandedV1',
      typeIdBase: 'affSchema',
      entries: [educationExpandedEntry, ...getBaseV1ContextEntries()],
      vocab: 'schema',
    })
  }