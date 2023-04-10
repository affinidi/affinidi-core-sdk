import { KEY_LENGTH, DECOMPRESSED_LENGTH, PREFIXED_KEY_LENGTH, PREFIXED_DECOMPRESSED_LENGTH } from '../constants'
import { Signature } from './types'
import { concatBuffers, bufferToHex, hexToBuffer, sanitizeHex, removeHexLeadingZeros, hexToNumber } from './encoding'

export function isCompressed(publicKey: Buffer): boolean {
  return publicKey.length === KEY_LENGTH || publicKey.length === PREFIXED_KEY_LENGTH
}

export function isDecompressed(publicKey: Buffer): boolean {
  return publicKey.length === DECOMPRESSED_LENGTH || publicKey.length === PREFIXED_DECOMPRESSED_LENGTH
}

export function isPrefixed(publicKey: Buffer) {
  if (isCompressed(publicKey)) {
    return publicKey.length === PREFIXED_KEY_LENGTH
  }

  return publicKey.length === PREFIXED_DECOMPRESSED_LENGTH
}

export function sanitizePublicKey(publicKey: Buffer): Buffer {
  return isPrefixed(publicKey) ? publicKey : Buffer.from(`04${publicKey.toString('hex')}`, 'hex')
}
