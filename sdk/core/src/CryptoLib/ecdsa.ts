import { isBrowser, isNode } from './lib/env';
import {
  secp256k1GetPublic,
  secp256k1Decompress,
} from './lib/secp256k1';
import {
  ellipticGetPublic,
  ellipticDecompress,
} from './lib/elliptic';
import {
  isDecompressed,
  checkPrivateKey,
} from './helpers';

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
