import { createV6WalletFactories, EventComponent } from '@affinidi/wallet-core-sdk'

import platformEncryptionTools from './PlatformEncryptionTools'

export const createWallet = (eventComponent: EventComponent) =>
  createV6WalletFactories(platformEncryptionTools, eventComponent)
