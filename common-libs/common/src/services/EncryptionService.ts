import { randomBytes } from '../shared/randomBytes'
const aes = require('browserify-aes/browser')
const aesModes = require('browserify-aes/modes')
const createHash = require('create-hash/browser')

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const KEY_LENGTH = 32
const createCipher = (suite: string, key: unknown, iv: unknown, isDecipher = false) => {
  let cipherType = 'createCipheriv'
  if (isDecipher) {
    cipherType = 'createDecipheriv'
  }

  suite = suite.toLowerCase()

  if (aesModes[suite]) {
    return aes[cipherType](suite, key, iv)
  }

  throw new Error('invalid suite type')
}

const createCipheriv = (suite: string, key: unknown, iv: unknown) => {
  return createCipher(suite, key, iv)
}

const createDecipheriv = (suite: string, key: unknown, iv: unknown) => {
  return createCipher(suite, key, iv, true)
}

const normalizeKey = (key: string): Buffer | undefined => {
  const keyBuffer = Buffer.from(key)

  if (!keyBuffer.length) {
    return undefined
  }

  const passwordHexBuffer = Buffer.from(key, 'hex')

  if (passwordHexBuffer.length === KEY_LENGTH) {
    return passwordHexBuffer
  }

  if (keyBuffer.length !== KEY_LENGTH) {
    return createHash('sha256').update(key).digest()
  }

  return keyBuffer
}

export class EncryptionService {
  static async encrypt(seedHexWithMethod: string, key: string) {
    const keyBuffer = normalizeKey(key)
    const seedBuffer = Buffer.from(seedHexWithMethod, 'hex')
    const iv = await randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv)
    const encryptedSeed = Buffer.concat([cipher.update(seedBuffer), cipher.final()])

    return Buffer.concat([iv, encryptedSeed]).toString('hex')
  }

  static decrypt(data: string, key: string) {
    const dataBuffer = Buffer.from(data, 'hex')
    const iv = dataBuffer.slice(0, IV_LENGTH)
    const encryptedSeedWtihoutVector = dataBuffer.slice(IV_LENGTH)

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, normalizeKey(key), iv)
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedSeedWtihoutVector), decipher.final()])
    return decryptedBuffer.toString('hex')
  }
}