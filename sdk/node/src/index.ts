if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

import type * as Types from '@affinidi/wallet-core-sdk'
export { Util } from '@affinidi/wallet-core-sdk'
export { createWallet } from './AffinityWallet'
export { Types }
