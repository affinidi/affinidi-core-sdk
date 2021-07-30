import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { createV5CompatibleWalletFactories } from '@affinidi/wallet-core-sdk'

import platformEncryptionTools from './PlatformEncryptionTools'

export const AffinityWallet = createV5CompatibleWalletFactories(platformEncryptionTools, EventComponent.AffinidiBrowserSDK)
