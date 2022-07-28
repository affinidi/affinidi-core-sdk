import { VCV1, LegacyVCV1Subject } from '@affinidi/vc-common'
import { createContextEntry, CreateThing, createVCContextEntry, ExpandThing, ExtendThing, Type } from '../util'

type HackathonEV1Mixin = CreateThing<'HackathonE'>

export type HackathonEV1 = ExtendThing<HackathonEV1Mixin, CreateThing<'Hackathon'>>

export const getBaseHackathonContextEntries = () => {
  const hackathonEV1ContextEntry = createContextEntry<HackathonEV1Mixin>({
    type: 'HackathonE',
    typeIdBase: 'affSchema',
    fields: {},
    vocab: 'schema',
  })

  return [hackathonEV1ContextEntry]
}

type HackathonWinnerV1Mixin = CreateThing<
  'HackathonWinner',
  {
    awardDate: string
  }
>

export type HackathonWinnerV1 = ExtendThing<HackathonWinnerV1Mixin, HackathonEV1>

export type VCSHackathonWinnerV1 = LegacyVCV1Subject<ExpandThing<HackathonWinnerV1>>

export type VCHackathonWinnerV1 = VCV1<VCSHackathonWinnerV1, Type<'HackathonWinnerCredentialV1'>>

export const getVCHackathonWinnerV1Context = () => {
  const hackathonEntry = createContextEntry<HackathonWinnerV1Mixin, HackathonWinnerV1>({
    type: 'HackathonWinner',
    typeIdBase: 'affSchema',
    fields: {
      awardDate: 'affSchema',
    },
    vocab: 'schema',
  })

  return createVCContextEntry<VCHackathonWinnerV1>({
    type: 'HackathonWinnerCredentialV1',
    typeIdBase: 'affSchema',
    entries: [hackathonEntry, ...getBaseHackathonContextEntries()],
    vocab: 'schema',
  })
}
