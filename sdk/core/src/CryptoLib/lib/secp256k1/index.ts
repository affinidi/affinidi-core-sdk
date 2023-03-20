import * as _secp256k1 from 'secp256k1';

import { ISecp256k1 } from './typings';

import { KEY_LENGTH } from '../../constants';
import {
  trimLeft,
  sanitizePublicKey,
} from '../../helpers';

export const secp256k1: ISecp256k1 = _secp256k1 as any;

export function secp256k1Compress(publicKey: Buffer): Buffer {
  publicKey = sanitizePublicKey(publicKey);
  return secp256k1.publicKeyConvert(publicKey, true);
}

export function secp256k1Decompress(publicKey: Buffer): Buffer {
  publicKey = sanitizePublicKey(publicKey);
  return secp256k1.publicKeyConvert(publicKey, false);
}

export function secp256k1GetPublic(privateKey: Buffer): Buffer {
  const result = secp256k1.publicKeyCreate(privateKey, false);
  return result;
}

export function secp256k1Derive(
  publicKey: Buffer,
  privateKey: Buffer,
  compressed?: boolean
) {
  let result = secp256k1.ecdhUnsafe(publicKey, privateKey, compressed);
  return trimLeft(result, KEY_LENGTH);
}
