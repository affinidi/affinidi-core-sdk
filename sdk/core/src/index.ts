if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

export { EventComponent } from '@affinidi/affinity-metrics-lib'
export type { VCV1, VCV1Unsigned, VPV1Unsigned } from '@affinidi/vc-common'
export type { CredentialRequirement, DidMethod, Env, MessageParameters, SdkOptions } from './dto/shared.dto'
export { createV5CompatibleWalletFactories, createV6WalletFactories } from './factories/walletFactories'
export { Util } from './CommonNetworkMember/Util'

import { BaseNetworkMember } from './CommonNetworkMember/BaseNetworkMember'
export type CommonNetworkMember = BaseNetworkMember
