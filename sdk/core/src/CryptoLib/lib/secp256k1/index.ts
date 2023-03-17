import * as _secp256k1 from 'secp256k1';

import { ISecp256k1 } from './typings';

import { randomBytes } from '../../random';
import { KEY_LENGTH } from '../../constants';
import {
  trimLeft,
  sanitizePublicKey,
  concatBuffers,
  exportRecoveryParam,
  isValidDERSignature,
  sanitizeRSVSignature,
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

export function secp256k1GeneratePrivate(): Buffer {
  let privateKey = randomBytes(KEY_LENGTH);
  while (!secp256k1VerifyPrivateKey(privateKey)) {
    privateKey = randomBytes(KEY_LENGTH);
  }
  return privateKey;
}

export function secp256k1VerifyPrivateKey(privateKey: Buffer): boolean {
  return secp256k1.privateKeyVerify(privateKey);
}

export function secp256k1GetPublic(privateKey: Buffer): Buffer {
  const result = secp256k1.publicKeyCreate(privateKey, false);
  return result;
}

export function secp256k1GetPublicCompressed(privateKey: Buffer): Buffer {
  const result = secp256k1.publicKeyCreate(privateKey, true);
  return result;
}

export function secp256k1SignatureExport(sig: Buffer) {
  return secp256k1.signatureExport(sig);
}

export function secp256k1SignatureImport(sig: Buffer) {
  return secp256k1.signatureImport(sig);
}

export function secp256k1Sign(
  msg: Buffer,
  privateKey: Buffer,
  rsvSig = false
): Buffer {
  const { signature, recovery } = secp256k1.sign(msg, privateKey);
  return rsvSig
    ? concatBuffers(signature, exportRecoveryParam(recovery))
    : secp256k1SignatureExport(signature);
}

export function secp256k1Recover(sig: Buffer, msg: Buffer, compressed = false) {
  if (isValidDERSignature(sig)) {
    throw new Error('Cannot recover from DER signatures');
  }
  const { signature, recovery } = sanitizeRSVSignature(sig);
  return secp256k1.recover(msg, signature, recovery, compressed);
}

export function secp256k1Verify(
  sig: Buffer,
  msg: Buffer,
  publicKey: Buffer
): boolean {
  if (isValidDERSignature(sig)) {
    sig = secp256k1SignatureImport(sig);
  }
  sig = sanitizeRSVSignature(sig).signature;
  return secp256k1.verify(msg, sig, publicKey);
}

export function secp256k1Derive(
  publicKey: Buffer,
  privateKey: Buffer,
  compressed?: boolean
) {
  let result = secp256k1.ecdhUnsafe(publicKey, privateKey, compressed);
  return trimLeft(result, KEY_LENGTH);
}
