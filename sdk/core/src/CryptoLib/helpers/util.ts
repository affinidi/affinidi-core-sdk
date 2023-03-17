import {
  KEY_LENGTH,
  DECOMPRESSED_LENGTH,
  PREFIXED_KEY_LENGTH,
  PREFIXED_DECOMPRESSED_LENGTH,
} from '../constants';
import { Signature } from './types';
import { SignResult } from '../lib/secp256k1/typings';
import {
  concatBuffers,
  bufferToHex,
  hexToBuffer,
  sanitizeHex,
  removeHexLeadingZeros,
  hexToNumber,
} from './encoding';

export function isCompressed(publicKey: Buffer): boolean {
  return (
    publicKey.length === KEY_LENGTH || publicKey.length === PREFIXED_KEY_LENGTH
  );
}

export function isDecompressed(publicKey: Buffer): boolean {
  return (
    publicKey.length === DECOMPRESSED_LENGTH ||
    publicKey.length === PREFIXED_DECOMPRESSED_LENGTH
  );
}

export function isPrefixed(publicKey: Buffer) {
  if (isCompressed(publicKey)) {
    return publicKey.length === PREFIXED_KEY_LENGTH;
  }
  return publicKey.length === PREFIXED_DECOMPRESSED_LENGTH;
}

export function sanitizePublicKey(publicKey: Buffer): Buffer {
  return isPrefixed(publicKey)
    ? publicKey
    : Buffer.from(`04${publicKey.toString('hex')}`, 'hex');
}

export function exportRecoveryParam(recoveryParam: number): Buffer {
  return hexToBuffer(sanitizeHex((recoveryParam + 27).toString(16)));
}

export function importRecoveryParam(v: Buffer): number {
  return hexToNumber(removeHexLeadingZeros(bufferToHex(v))) - 27;
}

export function splitSignature(sig: Buffer): Signature {
  return {
    r: sig.slice(0, 32),
    s: sig.slice(32, 64),
    v: sig.slice(64, 65),
  };
}

export function joinSignature(sig: Signature): Buffer {
  return concatBuffers(sig.r, sig.s, sig.v);
}

export function isValidDERSignature(sig: Buffer): boolean {
  return bufferToHex(sig).startsWith('30') && sig.length > 65;
}

export function sanitizeRSVSignature(sig: Buffer): SignResult {
  return {
    signature: sig.slice(0, 64),
    recovery: importRecoveryParam(sig.slice(64, 65)),
  };
}
