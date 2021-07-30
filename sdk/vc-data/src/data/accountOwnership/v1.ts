import { CreateThing, createContextEntry, AddKeyPairs, createVCContextEntry } from '../util'
import { VCV1, VCV1Subject } from '@affinidi/vc-common'

export type AccountOwnershipV1 = CreateThing<
  'AccountOwnership',
  {
    accountName: string
    accountType: string
    metaData: AddKeyPairs<any>
  }
>
export type VCSAccountOwnershipV1 = VCV1Subject<AccountOwnershipV1>
export type VCAccountOwnershipV1 = VCV1<VCSAccountOwnershipV1>

export const getAccountOwnershipV1Context = () => {
  const accountOwnershipEntry = createContextEntry<AccountOwnershipV1>({
    type: 'AccountOwnership',
    typeIdBase: 'affSchema',
    fields: {
      accountName: 'affSchema',
      accountType: 'affSchema',
      metaData: 'affSchema',
    },
    vocab: 'affSchema',
  })

  return createVCContextEntry<VCAccountOwnershipV1>({
    type: 'AccountOwnershipV1',
    typeIdBase: 'affSchema',
    entries: [accountOwnershipEntry],
    vocab: 'affSchema',
  })
}
