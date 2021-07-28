if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

// import * as Sentry from '@sentry/browser'

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

export { SdkOptions } from '@affinidi/wallet-core-sdk'
export { AffinityWallet, AffinityWallet as AffinidiWallet } from './AffinityWallet'
