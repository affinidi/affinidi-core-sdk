import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { expect } from 'chai'
import { createWalletFactories } from '../../src'
import { CommonNetworkMember } from '../../src'
import { BaseNetworkMember } from '../../src/CommonNetworkMember/BaseNetworkMember'
import { testPlatformTools } from './testPlatformTools'
import { testPlatformToolsWithEncryption } from './testPlatformToolsWithEncryption'

export const AffinidiWallet = createWalletFactories(testPlatformTools, EventComponent.AffinidiCore)

export const AffinidiWalletWithEncryption = createWalletFactories(
  testPlatformToolsWithEncryption,
  EventComponent.AffinidiCore,
)

export function checkIsWallet(value: CommonNetworkMember | unknown): asserts value is CommonNetworkMember {
  expect(value).to.be.an.instanceof(BaseNetworkMember)
}
