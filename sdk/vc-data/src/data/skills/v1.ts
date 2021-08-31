import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, getBaseV1ContextEntries } from '../base/v1'
import { CreateThing, ExtendThing, Type, ExpandThing, createContextEntry, createVCContextEntry } from '../util'

type SkillsPersonV1Mixin = CreateThing<
  'SkillsPerson',
  {
    firstName: string
    lastName: string
    email: string
    dateOfBirth?: string
    skillName: string
    awardedDate: string
    awardedBy: string
    skillDescription?: string
    profileLink?: string
  }
>

export type SkillsPersonV1 = ExtendThing<SkillsPersonV1Mixin, PersonEV1>

export type VCSSkillsPersonV1 = VCV1Subject<ExpandThing<SkillsPersonV1>>

export type VCSkillsPersonV1 = VCV1<VCSSkillsPersonV1, Type<'SkillsCredentialPersonV1'>>

export const getVCSkillsPersonV1Context = () => {
  const SkillsPersonEntry = createContextEntry<SkillsPersonV1Mixin, PersonEV1>({
    type: 'SkillsPerson',
    typeIdBase: 'affSchema',
    fields: {
      medal: 'schema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCSkillsPersonV1>({
    type: 'SkillsCredentialPersonV1',
    typeIdBase: 'affSchema',
    entries: [SkillsPersonEntry, ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
