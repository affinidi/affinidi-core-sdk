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
