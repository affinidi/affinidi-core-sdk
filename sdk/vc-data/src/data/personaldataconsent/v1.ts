import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { getBaseV1ContextEntries } from '../base'
import { CreateThing, createVCContextEntry, createContextEntry, ExpandThing, Type } from '../util'

type PersonalDataConsentAttribute = CreateThing<
  'PersonalDataConsentAttribute',
  {
    vcId?: string
    name: string
    purpose: string
    status: 'opt-in' | 'opt-out'
  }
>

type PersonalDataConsentV1 = CreateThing<
  'PersonalDataConsent',
  {
    consentReceiver?: string | CreateThing<'Organization'>
    consentStartDate: string
    consentPolicyText: string
    jurisdictionCountryCode?: string
    consentAttributes: Array<PersonalDataConsentAttribute>
  }
>

export type VCSPersonalDataConsentV1 = VCV1Subject<ExpandThing<PersonalDataConsentV1>>

export type VCPersonalDataConsentV1 = VCV1<VCSPersonalDataConsentV1, Type<'PersonalDataConsentCredentialV1'>>

export const getVCPersonalDataConsentV1Context = () => {
  const personalDataConsentEntry = createContextEntry<PersonalDataConsentV1>({
    type: 'PersonalDataConsent',
    typeIdBase: 'affSchema',
    fields: {
      consentReceiver: 'affSchema',
      consentStartDate: 'affSchema',
      consentPolicyText: 'affSchema',
      jurisdictionCountryCode: 'affSchema',
      consentAttributes: 'affSchema',
    },
  })

  return createVCContextEntry<VCPersonalDataConsentV1>({
    type: 'PersonalDataConsentCredentialV1',
    typeIdBase: 'affSchema',
    entries: [personalDataConsentEntry, ...getBaseV1ContextEntries()],
    vocab: 'affSchema',
  })
}
