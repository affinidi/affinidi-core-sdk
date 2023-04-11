import { ellipticGetPublic, ellipticDecompress } from './lib/elliptic'
import { isDecompressed, checkPrivateKey } from './helpers'

export function decompress(publicKey: Buffer): Buffer {
  if (isDecompressed(publicKey)) {
    return publicKey
  }

  return ellipticDecompress(publicKey)
}

export function getPublic(privateKey: Buffer) {
  checkPrivateKey(privateKey)
  return ellipticGetPublic(privateKey)
}
