import { ec as EC } from 'elliptic';
import { Signature } from 'elliptic/lib/elliptic/ec/signature';

import { randomBytes } from '../../random';
import { HEX_ENC, KEY_LENGTH } from '../../constants';
import {
  isValidPrivateKey,
  sanitizePublicKey,
  hexToBuffer,
  concatBuffers,
  exportRecoveryParam,
  importRecoveryParam,
  splitSignature,
  isValidDERSignature,
  sanitizeHex,
  removeHexPrefix,
  removeHexLeadingZeros,
  bufferToHex,
  padLeft,
} from '../../helpers';

const ec = new EC('secp256k1');

export function ellipticRSVSignature(signature: EC.Signature): Buffer {
  return concatBuffers(
    hexToBuffer(
      padLeft(removeHexPrefix(sanitizeHex(signature.r.toString(16))), 64)
    ),
    hexToBuffer(
      padLeft(removeHexPrefix(sanitizeHex(signature.s.toString(16))), 64)
    ),
    exportRecoveryParam(signature.recoveryParam || 0)
  );
}

export function ellipticCompress(publicKey: Buffer): Buffer {
  publicKey = sanitizePublicKey(publicKey);
  const pubPoint = ec.keyFromPublic(publicKey);
  const hex = pubPoint.getPublic().encode(HEX_ENC, true);
  return hexToBuffer(hex);
}

export function ellipticDecompress(publicKey: Buffer): Buffer {
  publicKey = sanitizePublicKey(publicKey);
  const pubPoint = ec.keyFromPublic(publicKey);
  const hex = pubPoint.getPublic().encode(HEX_ENC, false);
  return hexToBuffer(hex);
}

export function ellipticGeneratePrivate(): Buffer {
  let privateKey = randomBytes(KEY_LENGTH);
  while (!ellipticVerifyPrivateKey(privateKey)) {
    privateKey = randomBytes(KEY_LENGTH);
  }
  return privateKey;
}

export function ellipticVerifyPrivateKey(privateKey: Buffer): boolean {
  return isValidPrivateKey(privateKey);
}

export function ellipticGetPublic(privateKey: Buffer): Buffer {
  const hex = ec.keyFromPrivate(privateKey).getPublic(false, HEX_ENC);
  return hexToBuffer(hex);
}

export function ellipticGetPublicCompressed(privateKey: Buffer): Buffer {
  const hex = ec.keyFromPrivate(privateKey).getPublic(true, HEX_ENC);
  return hexToBuffer(hex);
}

export function ellipticDerive(publicKeyB: Buffer, privateKeyA: Buffer) {
  const keyA = ec.keyFromPrivate(privateKeyA);
  const keyB = ec.keyFromPublic(publicKeyB);
  const Px = keyA.derive(keyB.getPublic());
  return Buffer.from(Px.toArray());
}

export function ellipticSignatureExport(sig: Buffer): Buffer {
  return Signature({
    r: sig.slice(0, 32),
    s: sig.slice(32, 64),
    recoveryParam: importRecoveryParam(sig.slice(64, 65)),
  }).toDER();
}

export function ellipticSign(
  msg: Buffer,
  privateKey: Buffer,
  rsvSig = false
): Buffer {
  const signature = ec.sign(msg, privateKey, { canonical: true });

  return rsvSig
    ? ellipticRSVSignature(signature)
    : Buffer.from(signature.toDER());
}

export function ellipticRecover(sig: Buffer, msg: Buffer, compressed = false) {
  if (isValidDERSignature(sig)) {
    throw new Error('Cannot recover from DER signatures');
  }
  const signature = splitSignature(sig);
  const recoveryParam = importRecoveryParam(signature.v);
  const hex = ec
    .recoverPubKey(
      msg,
      {
        r: removeHexLeadingZeros(bufferToHex(signature.r)),
        s: removeHexLeadingZeros(bufferToHex(signature.s)),
        recoveryParam,
      },
      recoveryParam
    )
    .encode(HEX_ENC, compressed);
  return hexToBuffer(hex);
}

export function ellipticVerify(
  sig: Buffer,
  msg: Buffer,
  publicKey: Buffer
): boolean {
  if (!isValidDERSignature) {
    sig = ellipticSignatureExport(sig);
  }
  return ec.verify(msg, sig, publicKey);
}
