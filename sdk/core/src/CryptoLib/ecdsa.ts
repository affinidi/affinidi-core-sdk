import { isNode } from './lib/env';
import {
  secp256k1GeneratePrivate,
  secp256k1GetPublic,
  secp256k1Sign,
  secp256k1Verify,
  secp256k1GetPublicCompressed,
  secp256k1Compress,
  secp256k1Decompress,
  secp256k1SignatureExport,
  secp256k1Recover,
} from './lib/secp256k1';
import {
  ellipticGeneratePrivate,
  ellipticGetPublic,
  ellipticSign,
  ellipticVerify,
  ellipticGetPublicCompressed,
  ellipticDecompress,
  ellipticCompress,
  ellipticSignatureExport,
  ellipticRecover,
} from './lib/elliptic';
import {
  KeyPair,
  isCompressed,
  isDecompressed,
  checkPrivateKey,
  checkMessage,
  checkPublicKey,
} from './helpers';

export function generatePrivate() {
  return isNode() ? secp256k1GeneratePrivate() : ellipticGeneratePrivate();
}

export function compress(publicKey: Buffer): Buffer {
  if (isCompressed(publicKey)) {
    return publicKey;
  }
  return isNode() ? secp256k1Compress(publicKey) : ellipticCompress(publicKey);
}

export function decompress(publicKey: Buffer): Buffer {
  if (isDecompressed(publicKey)) {
    return publicKey;
  }
  return isNode()
    ? secp256k1Decompress(publicKey)
    : ellipticDecompress(publicKey);
}

export function getPublic(privateKey: Buffer) {
  checkPrivateKey(privateKey);
  return isNode()
    ? secp256k1GetPublic(privateKey)
    : ellipticGetPublic(privateKey);
}

export function getPublicCompressed(privateKey: Buffer) {
  checkPrivateKey(privateKey);
  return isNode()
    ? secp256k1GetPublicCompressed(privateKey)
    : ellipticGetPublicCompressed(privateKey);
}

export function generateKeyPair(): KeyPair {
  const privateKey = generatePrivate();
  const publicKey = getPublic(privateKey);
  return { privateKey, publicKey };
}

export function signatureExport(sig: Buffer): Buffer {
  return isNode()
    ? secp256k1SignatureExport(sig)
    : ellipticSignatureExport(sig);
}

export function sign(privateKey: Buffer, msg: Buffer, rsvSig = false): Buffer {
  checkPrivateKey(privateKey);
  checkMessage(msg);
  return isNode()
    ? secp256k1Sign(msg, privateKey, rsvSig)
    : ellipticSign(msg, privateKey, rsvSig);
}

export function recover(msg: Buffer, sig: Buffer, compressed = false): Buffer {
  checkMessage(msg);
  return isNode()
    ? secp256k1Recover(sig, msg, compressed)
    : ellipticRecover(sig, msg, compressed);
}

export function verify(publicKey: Buffer, msg: Buffer, sig: Buffer): null {
  checkPublicKey(publicKey);
  checkMessage(msg);
  const sigGood = isNode()
    ? secp256k1Verify(sig, msg, publicKey)
    : ellipticVerify(sig, msg, publicKey);
  if (sigGood) {
    return null;
  } else {
    throw new Error('Bad signature');
  }
}
