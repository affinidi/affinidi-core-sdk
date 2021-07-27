import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { CommonNetworkMember as CoreNetwork, __dangerous } from '@affinidi/wallet-core-sdk'

import platformEncryptionTools from './PlatformEncryptionTools'

export type SdkOptions = __dangerous.SdkOptions

const COMPONENT = EventComponent.AffinidiBrowserSDK

export class AffinityWallet extends CoreNetwork {
  constructor(password: string, encryptedSeed: string, options: SdkOptions, component: EventComponent = COMPONENT) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)
  }
}
