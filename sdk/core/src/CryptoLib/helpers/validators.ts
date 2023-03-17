import {
  KEY_LENGTH,
  MAX_MSG_LENGTH,
  PREFIXED_DECOMPRESSED_LENGTH,
  PREFIXED_KEY_LENGTH,
  ERROR_BAD_PRIVATE_KEY,
  ERROR_BAD_PUBLIC_KEY,
  ERROR_EMPTY_MESSAGE,
  ERROR_MESSAGE_TOO_LONG,
  ZERO32,
  EC_GROUP_ORDER,
  LENGTH_0,
  MAX_KEY_LENGTH,
} from '../constants';

export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function isScalar(x: Buffer): boolean {
  return Buffer.isBuffer(x) && x.length === 32;
}

export function isValidPrivateKey(privateKey: Buffer): boolean {
  if (!isScalar(privateKey)) {
    return false;
  }
  return (
    privateKey.compare(ZERO32) > 0 && privateKey.compare(EC_GROUP_ORDER) < 0 // > 0
  ); // < G
}

// Compare two buffers in constant time to prevent timing attacks.
export function equalConstTime(b1: Buffer, b2: Buffer): boolean {
  if (b1.length !== b2.length) {
    return false;
  }
  let res = 0;
  for (let i = 0; i < b1.length; i++) {
    res |= b1[i] ^ b2[i];
  }
  return res === 0;
}

export function isValidKeyLength(length: number) {
  return !(
    length <= LENGTH_0 ||
    length > MAX_KEY_LENGTH ||
    parseInt(String(length)) !== length
  );
}

export function checkPrivateKey(privateKey: Buffer): void {
  assert(privateKey.length === KEY_LENGTH, ERROR_BAD_PRIVATE_KEY);
  assert(isValidPrivateKey(privateKey), ERROR_BAD_PRIVATE_KEY);
}

export function checkPublicKey(publicKey: Buffer): void {
  assert(
    publicKey.length === PREFIXED_DECOMPRESSED_LENGTH ||
      publicKey.length === PREFIXED_KEY_LENGTH,
    ERROR_BAD_PUBLIC_KEY
  );
  if (publicKey.length === PREFIXED_DECOMPRESSED_LENGTH) {
    assert(publicKey[0] === 4, ERROR_BAD_PUBLIC_KEY);
  }
  if (publicKey.length === PREFIXED_KEY_LENGTH) {
    assert(publicKey[0] === 2 || publicKey[0] === 3, ERROR_BAD_PUBLIC_KEY);
  }
}

export function checkMessage(msg: Buffer): void {
  assert(msg.length > 0, ERROR_EMPTY_MESSAGE);
  assert(msg.length <= MAX_MSG_LENGTH, ERROR_MESSAGE_TOO_LONG);
}
