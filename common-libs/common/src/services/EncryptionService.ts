import { randomBytes } from '../shared/randomBytes'
const aes = require('browserify-aes/browser')
const aesModes = require('browserify-aes/modes')

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

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

export class EncryptionService {
  static async encrypt(seedHexWithMethod: string, key: string) {
    const keyBuffer = Buffer.from(key, 'hex')
    const seedBuffer = Buffer.from(seedHexWithMethod, 'hex')
    const iv = await randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv)
    const encryptedSeed = Buffer.concat([cipher.update(seedBuffer), cipher.final()])

    return Buffer.concat([iv, encryptedSeed]).toString('hex')
  }

  static decrypt(payload: string, encryptionKey: string) {
    const encryptedSeedBuffer = Buffer.from(payload, 'hex')
    const iv = encryptedSeedBuffer.slice(0, IV_LENGTH)
    const encryptedSeedWtihoutVector = encryptedSeedBuffer.slice(IV_LENGTH)

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv)
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedSeedWtihoutVector), decipher.final()])
    return decryptedBuffer.toString('hex')
  }
}
