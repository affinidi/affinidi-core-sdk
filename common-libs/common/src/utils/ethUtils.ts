import * as utils from 'ethereumjs-util'
import base58 from 'bs58'

export const addressFromPubKey = (pubKey: Buffer): string => '0x' + utils.pubToAddress(pubKey, true).toString('hex')

export const encodeBase58 = (buffer: Buffer): string => base58.encode(buffer)
export const decodeBase58 = (str: string): Buffer => Buffer.from(base58.decode(str))
