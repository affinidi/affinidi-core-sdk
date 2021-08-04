import { createV6WalletFactories, EventComponent } from '@affinidi/wallet-core-sdk'
import { AffinidiCommonConstructor, IPlatformEncryptionTools } from '@affinidi/wallet-core-sdk/dist/shared/interfaces'

import platformEncryptionTools from './PlatformEncryptionTools'

export const createWallet = (
  eventComponent: EventComponent,
  affinidiCommon: AffinidiCommonConstructor,
  buildExternalKeysSectionForSeed: NonNullable<IPlatformEncryptionTools['buildExternalKeysSectionForSeed']>,
) =>
  createV6WalletFactories(
    Object.assign(platformEncryptionTools, { buildExternalKeysSectionForSeed }),
    affinidiCommon,
    eventComponent,
  )
