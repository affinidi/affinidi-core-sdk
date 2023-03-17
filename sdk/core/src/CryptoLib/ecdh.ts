import { isNode } from './lib/env';
import { secp256k1Derive } from './lib/secp256k1';
import { ellipticDerive } from './lib/elliptic';

import { checkPrivateKey, checkPublicKey } from './helpers';

export function derive(privateKeyA: Buffer, publicKeyB: Buffer): Buffer {
  checkPrivateKey(privateKeyA);
  checkPublicKey(publicKeyB);
  return isNode()
    ? secp256k1Derive(publicKeyB, privateKeyA)
    : ellipticDerive(publicKeyB, privateKeyA);
}
