import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { createWalletFactories } from '@affinidi/wallet-core-sdk'

import platformEncryptionTools from './PlatformEncryptionTools'

export const AffinityWallet = createWalletFactories(platformEncryptionTools, EventComponent.AffinidiExpoSDK)
