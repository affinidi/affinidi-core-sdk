import crypto from 'crypto';
import {
  HMAC_NODE_ALGO,
  AES_NODE_ALGO,
  SHA512_NODE_ALGO,
  SHA256_NODE_ALGO,
  RIPEMD160_NODE_ALGO,
} from '../constants';
import { concatBuffers } from '../helpers';

export function nodeRandomBytes(length: number): Buffer {
  return crypto.randomBytes(length);
}

export function nodeAesEncrypt(iv: Buffer, key: Buffer, data: Buffer): Buffer {
  const cipher = crypto.createCipheriv(AES_NODE_ALGO, key, iv);
  return concatBuffers(cipher.update(data), cipher.final());
}

export function nodeAesDecrypt(iv: Buffer, key: Buffer, data: Buffer): Buffer {
  const decipher = crypto.createDecipheriv(AES_NODE_ALGO, key, iv);
  return concatBuffers(decipher.update(data), decipher.final());
}

export function nodeHmacSha256Sign(key: Buffer, data: Buffer): Buffer {
  return crypto
    .createHmac(HMAC_NODE_ALGO, Buffer.from(key))
    .update(data)
    .digest();
}

export function nodeHmacSha512Sign(key: Buffer, data: Buffer): Buffer {
  return crypto
    .createHmac(SHA512_NODE_ALGO, Buffer.from(key))
    .update(data)
    .digest();
}

export function nodeSha256(data: Buffer): Buffer {
  return crypto
    .createHash(SHA256_NODE_ALGO)
    .update(data)
    .digest();
}

export function nodeSha512(data: Buffer): Buffer {
  return crypto
    .createHash(SHA512_NODE_ALGO)
    .update(data)
    .digest();
}

export function nodeRipemd160(data: Buffer): Buffer {
  return crypto
    .createHash(RIPEMD160_NODE_ALGO)
    .update(data)
    .digest();
}
