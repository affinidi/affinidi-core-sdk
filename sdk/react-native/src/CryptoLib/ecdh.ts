import { ellipticDerive } from './lib/elliptic'

import { checkPrivateKey, checkPublicKey } from './helpers'

export function derive(privateKeyA: Buffer, publicKeyB: Buffer): Buffer {
  checkPrivateKey(privateKeyA)
  checkPublicKey(publicKeyB)
  return ellipticDerive(publicKeyB, privateKeyA)
}
