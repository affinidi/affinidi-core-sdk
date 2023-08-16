import * as utils from 'ethereumjs-util'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import base58 from 'bs58'

const base64urlLib = require('base64url')

export const addressFromPubKey = (pubKey: Buffer): string => '0x' + utils.pubToAddress(pubKey, true).toString('hex')

export const encodeBase58 = (buffer: Buffer): string => base58.encode(buffer)
export const decodeBase58 = (str: string): Buffer => base58.decode(str)

export const base64url = {
  encode: base64urlLib.encode,
  decode: base64urlLib.toBuffer,
}
// export const base64 = {
//   encode: (unencoded: any) => {
//     return Buffer.from(unencoded || '').toString('base64')
//   },
//   decode: (encoded: any) => {
//     return Buffer.from(encoded || '', 'base64').toString('utf8')
//   },
// }

// export const base64url = {
//   encode: (unencoded: any) => {
//     var encoded = base64.encode(unencoded)
//     return encoded
//       .replace(/\+/g, '-')
//       .replace(/\//g, '_')
//       .replace(/=+$/g, '')
//   },
//   decode: (encoded: any) => {
//     encoded = encoded.replace(/-/g, '+').replace(/_/g, '/')
//     while (encoded.length % 4) encoded += '='
//     return base64.decode(encoded)
//   },
// }