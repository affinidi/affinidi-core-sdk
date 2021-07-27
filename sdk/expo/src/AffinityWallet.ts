import { profile } from '@affinidi/common'
import { CommonNetworkMember as CoreNetwork, __dangerous } from '@affinidi/wallet-core-sdk'
import { EventComponent } from '@affinidi/affinity-metrics-lib'

import platformEncryptionTools from './PlatformEncryptionTools'

export type SdkOptions = __dangerous.SdkOptions

const COMPONENT = EventComponent.AffinidiExpoSDK

@profile()
export class AffinityWallet extends CoreNetwork {
  constructor(password: string, encryptedSeed: string, options: SdkOptions, component: EventComponent = COMPONENT) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)
  }
}
