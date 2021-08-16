import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { expect } from 'chai'
import { CommonNetworkMember, createV5CompatibleWalletFactories, createV6WalletFactories } from '../../src'
import { BaseNetworkMember } from '../../src/CommonNetworkMember/BaseNetworkMember'
import { testPlatformTools } from './testPlatformTools'
import { testPlatformToolsWithEncryption } from './testPlatformToolsWithEncryption'

export const AffinidiWallet = createV5CompatibleWalletFactories(testPlatformTools, null, EventComponent.AffinidiCore)

export const AffinidiWalletWithEncryption = createV5CompatibleWalletFactories(
  testPlatformToolsWithEncryption,
  null,
  EventComponent.AffinidiCore,
)

export const AffinidiWalletV6 = createV6WalletFactories(testPlatformTools, null, EventComponent.AffinidiCore)

export const AffinidiWalletV6WithEncryption = createV6WalletFactories(
  testPlatformToolsWithEncryption,
  null,
  EventComponent.AffinidiCore,
)

export function checkIsWallet(value: CommonNetworkMember | unknown): asserts value is CommonNetworkMember {
  expect(value).to.be.an.instanceof(BaseNetworkMember)
}
