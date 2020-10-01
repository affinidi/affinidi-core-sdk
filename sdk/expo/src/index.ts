if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

import { TextDecoder, TextEncoder } from 'text-encoding'

global.TextDecoder = global.TextDecoder || TextDecoder
global.TextEncoder = global.TextEncoder || TextEncoder

// import { Sentry } from './utils/Sentry'

// Sentry.init({
//   dsn: 'https://21c278f17ae94c7c88fac032dd8eeb14@o411936.ingest.sentry.io/5289107',
//   enableInExpoDevelopment: true,
//   debug: true,
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

// Unless enableInExpoDevelopment: true is set, all your dev/local errors
// will be ignored and only app releases will report errors to Sentry.
// See https://docs.expo.io/guides/using-sentry

export { AffinityWallet, AffinityWallet as AffinidiWallet } from './AffinityWallet'
