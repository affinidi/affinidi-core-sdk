import {
  ENCRYPT_OP,
  DECRYPT_OP,
  SIGN_OP,
  VERIFY_OP,
  AES_BROWSER_ALGO,
  AES_LENGTH,
  HMAC_BROWSER_ALGO,
  HMAC_BROWSER,
  HMAC_LENGTH,
  SHA256_BROWSER_ALGO,
  SHA512_BROWSER_ALGO,
  LENGTH_512,
} from '../constants';
import { arrayToBuffer } from '../helpers';
import { fallbackRandomBytes } from './fallback';

export function getBrowerCrypto(): Crypto {
  // @ts-ignore
  return global?.crypto || global?.msCrypto || {};
}

export function getSubtleCrypto(): SubtleCrypto {
  const browserCrypto = getBrowerCrypto();
  // @ts-ignore
  return browserCrypto.subtle || browserCrypto.webkitSubtle;
}

export function getAlgo(type: string): AesKeyAlgorithm | HmacImportParams {
  return type === AES_BROWSER_ALGO
    ? { length: AES_LENGTH, name: AES_BROWSER_ALGO }
    : {
        hash: { name: HMAC_BROWSER_ALGO },
        name: HMAC_BROWSER,
      };
}

export function getOps(type: string): string[] {
  return type === AES_BROWSER_ALGO
    ? [ENCRYPT_OP, DECRYPT_OP]
    : [SIGN_OP, VERIFY_OP];
}

export function browserRandomBytes(length: number): Buffer {
  const browserCrypto = getBrowerCrypto();
  if (typeof browserCrypto.getRandomValues !== 'undefined') {
    return arrayToBuffer(browserCrypto.getRandomValues(new Uint8Array(length)));
  }
  return fallbackRandomBytes(length);
}

export async function browserExportKey(
  cryptoKey: CryptoKey,
  type: string = AES_BROWSER_ALGO
): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  return arrayToBuffer(
    new Uint8Array(await subtle.exportKey('raw', cryptoKey))
  );
}

export async function browserImportKey(
  buffer: Buffer,
  type: string = AES_BROWSER_ALGO
): Promise<CryptoKey> {
  return getSubtleCrypto().importKey(
    'raw',
    buffer,
    getAlgo(type),
    true,
    getOps(type)
  );
}

export async function browserAesEncrypt(
  iv: Buffer,
  key: Buffer,
  data: Buffer
): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, AES_BROWSER_ALGO);
  const result = await subtle.encrypt(
    {
      iv,
      name: AES_BROWSER_ALGO,
    },
    cryptoKey,
    data
  );
  return Buffer.from(result);
}

export async function browserAesDecrypt(
  iv: Buffer,
  key: Buffer,
  data: Buffer
): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, AES_BROWSER_ALGO);
  const result = await subtle.decrypt(
    {
      iv,
      name: AES_BROWSER_ALGO,
    },
    cryptoKey,
    data
  );
  return Buffer.from(result);
}

export async function browserHmacSha256Sign(
  key: Buffer,
  data: Buffer
): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, HMAC_BROWSER);
  const signature = await subtle.sign(
    {
      length: HMAC_LENGTH,
      name: HMAC_BROWSER,
    },
    cryptoKey,
    data
  );
  return Buffer.from(signature);
}

export async function browserHmacSha512Sign(
  key: Buffer,
  data: Buffer
): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  const cryptoKey = await browserImportKey(key, HMAC_BROWSER);
  const signature = await subtle.sign(
    {
      length: LENGTH_512,
      name: HMAC_BROWSER,
    },
    cryptoKey,
    data
  );
  return Buffer.from(signature);
}

export async function browserSha256(data: Buffer): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  const result = await subtle.digest(
    {
      name: SHA256_BROWSER_ALGO,
    },
    data
  );
  return Buffer.from(result);
}

export async function browserSha512(data: Buffer): Promise<Buffer> {
  const subtle = getSubtleCrypto();
  const result = await subtle.digest(
    {
      name: SHA512_BROWSER_ALGO,
    },
    data
  );
  return Buffer.from(result);
}
