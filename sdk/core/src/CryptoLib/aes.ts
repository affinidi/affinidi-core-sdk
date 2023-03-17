import { isBrowser, isNode } from './lib/env';
import { browserAesEncrypt, browserAesDecrypt } from './lib/browser';
import { nodeAesEncrypt, nodeAesDecrypt } from './lib/node';
import { fallbackAesEncrypt, fallbackAesDecrypt } from './lib/fallback';

export async function aesCbcEncrypt(
  iv: Buffer,
  key: Buffer,
  data: Buffer
): Promise<Buffer> {
  let result;
  if (isBrowser()) {
    result = await browserAesEncrypt(iv, key, data);
  } else if (isNode()) {
    result = nodeAesEncrypt(iv, key, data);
  } else {
    result = fallbackAesEncrypt(iv, key, data);
  }
  return result;
}

export async function aesCbcDecrypt(
  iv: Buffer,
  key: Buffer,
  data: Buffer
): Promise<Buffer> {
  let result;
  if (isBrowser()) {
    result = await browserAesDecrypt(iv, key, data);
  } else if (isNode()) {
    result = nodeAesDecrypt(iv, key, data);
  } else {
    result = fallbackAesDecrypt(iv, key, data);
  }
  return result;
}

export function aesCbcEncryptSync(
  iv: Buffer,
  key: Buffer,
  data: Buffer
): Buffer {
  let result;
  if (isNode()) {
    result = nodeAesEncrypt(iv, key, data);
  } else {
    result = fallbackAesEncrypt(iv, key, data);
  }
  return result;
}

export function aesCbcDecryptSync(
  iv: Buffer,
  key: Buffer,
  data: Buffer
): Buffer {
  let result;
  if (isNode()) {
    result = nodeAesDecrypt(iv, key, data);
  } else {
    result = fallbackAesDecrypt(iv, key, data);
  }
  return result;
}
