import { randomBytes } from '../shared/randomBytes'
const aes = require('browserify-aes/browser')
const aesModes = require('browserify-aes/modes')
const createHash = require('create-hash/browser')

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const IV_LENGTH_GCM = 12
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
    return createHash('sha256').update(keyBuffer).digest()
  }

  return keyBuffer
}

export class EncryptionService {
  static async encrypt(data: string, key: string, encryption_algo: string = ENCRYPTION_ALGORITHM) {
    if (encryption_algo.endsWith('-gcm')) {
      const keyBuffer = normalizeKey(key)
      const dataBuffer = Buffer.from(data, undefined)
      const iv = await randomBytes(IV_LENGTH_GCM)

      const cipher = createCipheriv(encryption_algo, keyBuffer, iv)
      const encryptedData = Buffer.concat([cipher.update(dataBuffer), cipher.final()])

      return `${Buffer.concat([iv, encryptedData]).toString('hex')}-${cipher.getAuthTag().toString('hex')}`
    } else {
      const keyBuffer = normalizeKey(key)
      const dataBuffer = Buffer.from(data, undefined)
      const iv = await randomBytes(IV_LENGTH)

      const cipher = createCipheriv(encryption_algo, keyBuffer, iv)
      const encryptedData = Buffer.concat([cipher.update(dataBuffer), cipher.final()])

      return Buffer.concat([iv, encryptedData]).toString('hex')
    }
  }

  static decrypt(data: string, key: string, encryption_algo: string = ENCRYPTION_ALGORITHM) {
    if (encryption_algo.endsWith('-gcm')) {
      const dataBuffer = Buffer.from(data.substring(0, data.lastIndexOf('-')), 'hex')
      const passwordBuffer = normalizeKey(key)
      const iv = dataBuffer.slice(0, IV_LENGTH_GCM)
      const encryptedDataWtihoutVector = dataBuffer.slice(IV_LENGTH_GCM)

      const decipher = createDecipheriv(encryption_algo, passwordBuffer, iv)
      const authTag = Buffer.from(data.slice(data.lastIndexOf('-') + 1), 'hex')
      decipher.setAuthTag(authTag)

      const decryptedBuffer = Buffer.concat([decipher.update(encryptedDataWtihoutVector), decipher.final()])
      return decryptedBuffer.toString()
    } else {
      const dataBuffer = Buffer.from(data, 'hex')
      const passwordBuffer = normalizeKey(key)
      const iv = dataBuffer.slice(0, IV_LENGTH)
      const encryptedDataWtihoutVector = dataBuffer.slice(IV_LENGTH)

      const decipher = createDecipheriv(encryption_algo, passwordBuffer, iv)
      const decryptedBuffer = Buffer.concat([decipher.update(encryptedDataWtihoutVector), decipher.final()])
      return decryptedBuffer.toString()
    }
  }
}
