if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

export { SdkOptions } from '@affinidi/wallet-core-sdk'
export { AffinidiWallet, AffinidiWallet as AffinityWallet, AffinidiWalletV6 } from './AffinityWallet'
