import { ec as EC } from 'elliptic'
import { HEX_ENC } from '../../constants'
import { sanitizePublicKey, hexToBuffer } from '../../helpers'

const ec = new EC('secp256k1')

export function ellipticCompress(publicKey: Buffer): Buffer {
  publicKey = sanitizePublicKey(publicKey)
  const pubPoint = ec.keyFromPublic(publicKey)
  const hex = pubPoint.getPublic().encode(HEX_ENC, true)
  return hexToBuffer(hex)
}

export function ellipticDecompress(publicKey: Buffer): Buffer {
  publicKey = sanitizePublicKey(publicKey)
  const pubPoint = ec.keyFromPublic(publicKey)
  const hex = pubPoint.getPublic().encode(HEX_ENC, false)
  return hexToBuffer(hex)
}

export function ellipticGetPublic(privateKey: Buffer): Buffer {
  const hex = ec.keyFromPrivate(privateKey).getPublic(false, HEX_ENC)
  return hexToBuffer(hex)
}

export function ellipticDerive(publicKeyB: Buffer, privateKeyA: Buffer) {
  const keyA = ec.keyFromPrivate(privateKeyA)
  const keyB = ec.keyFromPublic(publicKeyB)
  const Px = keyA.derive(keyB.getPublic())
  return Buffer.from(Px.toArray())
}
