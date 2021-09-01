import { createV6WalletFactories, EventComponent } from '@affinidi/wallet-core-sdk'

import platformCryptographyTools from './PlatformCryptographyTools'

export const createWallet = (eventComponent: EventComponent) =>
  createV6WalletFactories(platformCryptographyTools, eventComponent)
