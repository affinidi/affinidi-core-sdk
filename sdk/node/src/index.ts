if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

export { SdkOptions } from '@affinidi/wallet-core-sdk'
export { AffinityWallet, AffinityWallet as AffinidiWallet } from './AffinityWallet'
