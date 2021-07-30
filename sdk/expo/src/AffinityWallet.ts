import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { createV5CompatibleWalletFactories, createV6WalletFactories } from '@affinidi/wallet-core-sdk'

import platformEncryptionTools from './PlatformEncryptionTools'

export const AffinidiWallet = createV5CompatibleWalletFactories(platformEncryptionTools, EventComponent.AffinidiExpoSDK)

export const AffinidiWalletV6 = createV6WalletFactories(platformEncryptionTools, EventComponent.AffinidiExpoSDK)
