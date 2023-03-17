import {
  aesCbcEncrypt,
  aesCbcDecrypt,
} from './aes';
import { derive } from './ecdh';
import { getPublic, decompress, compress } from './ecdsa';
import {
  hmacSha256Sign,
  hmacSha256Verify,
} from './hmac';
import { randomBytes } from './random';
import { sha512 } from './sha2';

import {
  LENGTH_0,
  KEY_LENGTH,
  IV_LENGTH,
  MAC_LENGTH,
  PREFIXED_KEY_LENGTH,
  ERROR_BAD_MAC,
} from './constants';
import {
  PreEncryptOpts,
  isValidPrivateKey,
  Encrypted,
  assert,
  concatBuffers,
} from './helpers';

function getSharedKey(privateKey: Buffer, publicKey: Buffer) {
  publicKey = decompress(publicKey);
  return derive(privateKey, publicKey);
}

function getEncryptionKey(hash: Buffer) {
  return Buffer.from(hash.slice(LENGTH_0, KEY_LENGTH));
}

function getMacKey(hash: Buffer) {
  return Buffer.from(hash.slice(KEY_LENGTH));
}

async function getEciesKeys(privateKey: Buffer, publicKey: Buffer) {
  const sharedKey = getSharedKey(privateKey, publicKey);
  const hash = await sha512(sharedKey);
  return { encryptionKey: getEncryptionKey(hash), macKey: getMacKey(hash) };
}

function getEphemKeyPair(opts?: Partial<PreEncryptOpts>) {
  let ephemPrivateKey = opts?.ephemPrivateKey || randomBytes(KEY_LENGTH);
  while (!isValidPrivateKey(ephemPrivateKey)) {
    ephemPrivateKey = opts?.ephemPrivateKey || randomBytes(KEY_LENGTH);
  }
  const ephemPublicKey = getPublic(ephemPrivateKey);
  return { ephemPrivateKey, ephemPublicKey };
}

export async function encrypt(
  publicKeyTo: Buffer,
  msg: Buffer,
  opts?: Partial<PreEncryptOpts>
): Promise<Encrypted> {
  const { ephemPrivateKey, ephemPublicKey } = getEphemKeyPair(opts);
  const { encryptionKey, macKey } = await getEciesKeys(
    ephemPrivateKey,
    publicKeyTo
  );
  const iv = opts?.iv || randomBytes(IV_LENGTH);
  const ciphertext = await aesCbcEncrypt(iv, encryptionKey, msg);
  const dataToMac = concatBuffers(iv, ephemPublicKey, ciphertext);
  const mac = await hmacSha256Sign(macKey, dataToMac);
  return { iv, ephemPublicKey, ciphertext, mac: mac };
}

export async function decrypt(
  privateKey: Buffer,
  opts: Encrypted
): Promise<Buffer> {
  const { ephemPublicKey, iv, mac, ciphertext } = opts;
  const { encryptionKey, macKey } = await getEciesKeys(
    privateKey,
    ephemPublicKey
  );
  const dataToMac = concatBuffers(iv, ephemPublicKey, ciphertext);
  const macTest = await hmacSha256Verify(macKey, dataToMac, mac);
  assert(macTest, ERROR_BAD_MAC);
  const msg = await aesCbcDecrypt(opts.iv, encryptionKey, opts.ciphertext);
  return msg;
}

export function serialize(opts: Encrypted): Buffer {
  const ephemPublicKey = compress(opts.ephemPublicKey);
  return concatBuffers(opts.iv, ephemPublicKey, opts.mac, opts.ciphertext);
}

export function deserialize(buf: Buffer): Encrypted {
  const slice0 = LENGTH_0;
  const slice1 = slice0 + IV_LENGTH;
  const slice2 = slice1 + PREFIXED_KEY_LENGTH;
  const slice3 = slice2 + MAC_LENGTH;
  const slice4 = buf.length;
  return {
    iv: buf.slice(slice0, slice1),
    ephemPublicKey: decompress(buf.slice(slice1, slice2)),
    mac: buf.slice(slice2, slice3),
    ciphertext: buf.slice(slice3, slice4),
  };
}
