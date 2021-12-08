import { useNativeFetch } from '@affinidi/platform-fetch-native'

useNativeFetch()

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

import { TextDecoder, TextEncoder } from 'text-encoding'

global.TextDecoder = global.TextDecoder || TextDecoder
global.TextEncoder = global.TextEncoder || TextEncoder

// import * as Sentry from '@sentry/react-native'

// Sentry.init({
//   dsn: 'https://21c278f17ae94c7c88fac032dd8eeb14@o411936.ingest.sentry.io/5289107',
//   beforeSend(event) {
//     // Modify the event here
//     if (event.user) {
//       // Don't send user's attributes
//       delete event.user.email
//       delete event.user.ip
//       delete event.user.ip_address
//       delete event.user.username
//     }

//     return event
//   },
// })

import type * as Types from '@affinidi/wallet-core-sdk'
export { Util } from '@affinidi/wallet-core-sdk'
export { AffinidiWallet, AffinidiWallet as AffinityWallet, AffinidiWalletV6 } from './AffinityWallet'
export { Types }
