import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { createWalletFactories } from '../../src'
import { testPlatformTools } from './testPlatformTools'
import { testPlatformToolsWithEncryption } from './testPlatformToolsWithEncryption'

export const AffinidiWallet = createWalletFactories(testPlatformTools, EventComponent.AffinidiCore)

export const AffinidiWalletWithEncryption = createWalletFactories(
  testPlatformToolsWithEncryption,
  EventComponent.AffinidiCore,
)
