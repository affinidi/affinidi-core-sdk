import { useNodeFetch } from '@affinidi/platform-fetch-node'

useNodeFetch()

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

import type * as Types from '@affinidi/wallet-core-sdk'
export { EventComponent, Util } from '@affinidi/wallet-core-sdk'
export { createWallet } from './AffinityWallet'
export { Types }
