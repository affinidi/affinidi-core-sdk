import { randomBytes } from '../shared/randomBytes'
import createHash from 'create-hash'

import encode from 'base64url'
import { ecsign } from 'ethereumjs-util'

import DigestService from './DigestService'
import DidDocumentService from './DidDocumentService'

import { validateDidMethodSupported } from '../_helpers'

const tinySecp256k1 = require('tiny-secp256k1')
const aes = require('browserify-aes/browser')
const aesModes = require('browserify-aes/modes')
const bip32 = require('bip32')

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const PASSWORD_LENGTH = 32

const jolocomIdentityKey = "m/73'/0'/0'/0" // eslint-disable-line
const etheriumIdentityKey = "m/44'/60'/0'/0/0" // eslint-disable-line
const elemIdentityPrimaryKey = "m/44'/60'/0'/1/0" // eslint-disable-line

const cachedSigningKey: any = {}

const createCipher = (suite: string, key: any, iv: any, isDecipher = false) => {
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

const createCipheriv = (suite: string, key: any, iv: any) => {
  return createCipher(suite, key, iv)
}

const createDecipheriv = (suite: string, key: any, iv: any) => {
  return createCipher(suite, key, iv, true)
}

export default class KeysService {
  private readonly _digestService: DigestService
  private readonly _encryptedSeed: string
  private readonly _password: string

  constructor(encryptedSeed: string, password: string) {
    this._digestService = new DigestService()
    this._encryptedSeed = encryptedSeed
    this._password = password
  }

  sign(digest: any) {
    const { seed, didMethod } = this.decryptSeed()

    const seedHex = seed.toString('hex')
    const signingKey = KeysService.getKey(seedHex, didMethod)

    return signingKey.sign(digest)
  }

  static verify(digest: Buffer, publicKey: Buffer, signature: Buffer): boolean {
    try {
      return tinySecp256k1.verify(digest, publicKey, signature)
    } catch (error) {
      /* istanbul ignore else: code simplicity */
      if (error.message === 'Expected Signature') {
        return false
      } else {
        throw error
      }
    }
  }

  static sha256(data: any): Buffer {
    return createHash('sha256').update(data).digest()
  }

  static getSigningKey(seedHex: string, deriviationPath: string): any {
    const seed = Buffer.from(seedHex, 'hex')

    const id = `${seedHex}::${deriviationPath}`

    if (cachedSigningKey[id]) {
      return cachedSigningKey[id]
    }

    cachedSigningKey[id] = bip32.fromSeed(seed).derivePath(deriviationPath)

    return cachedSigningKey[id]
  }

  static getKey(seedHex: string, didMethod: string, isAnchoring = false) {
    validateDidMethodSupported(didMethod)

    let deriviationPath
    switch (didMethod) {
      case 'jolo':
        deriviationPath = jolocomIdentityKey

        if (isAnchoring) {
          deriviationPath = etheriumIdentityKey
        }

        break
      case 'elem':
        deriviationPath = elemIdentityPrimaryKey

        if (isAnchoring) {
          deriviationPath = etheriumIdentityKey
        }

        break
    }

    const signingKey = KeysService.getSigningKey(seedHex, deriviationPath)

    return signingKey
  }

  static getPublicAndPrivateKeys(seedHex: string, didMethod: string) {
    const { publicKey, privateKey } = KeysService.getKey(seedHex, didMethod)

    return { publicKey, privateKey }
  }

  static getAnchorTransactionPublicAndPrivateKeys(seedHex: string, didMethod: string) {
    const { publicKey, privateKey } = KeysService.getKey(seedHex, didMethod, true)

    return { publicKey, privateKey }
  }

  static getPublicKey(seedHex: string, didMethod: string) {
    return KeysService.getKey(seedHex, didMethod).publicKey
  }

  static getPrivateKey(seedHex: string, didMethod: string) {
    return KeysService.getKey(seedHex, didMethod).privateKey
  }

  static getAnchorTransactionPrivateKey(seedHex: string, didMethod: string) {
    return KeysService.getKey(seedHex, didMethod, true).privateKey
  }

  static getAnchorTransactionPublicKey(seedHex: string, didMethod: string) {
    return KeysService.getKey(seedHex, didMethod, true).publicKey
  }

  static async encryptSeed(seedHexWithMethod: string, encryptionKeyBuffer: any) {
    const isMethodAdded = seedHexWithMethod.split('++')[1]
    let bufferMethod: undefined | 'hex' = undefined

    if (!isMethodAdded) {
      bufferMethod = 'hex'
    }

    const seedBuffer = Buffer.from(seedHexWithMethod, bufferMethod)
    const iv = await randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKeyBuffer, iv)
    const encryptedSeed = Buffer.concat([cipher.update(seedBuffer), cipher.final()])

    return Buffer.concat([iv, encryptedSeed]).toString('hex')
  }

  private _validateExternalKeyType(keyType: string) {
    const SUPPORTED_EXTERNAL_KEY_TYPES = ['rsa']
    if (!SUPPORTED_EXTERNAL_KEY_TYPES.includes(keyType)) {
      throw new Error(`${keyType} is not supported external key type, Supprted: ${SUPPORTED_EXTERNAL_KEY_TYPES}`)
    }
  }

  private _getExternalKey(keyType: string, privateOrPublic: 'private' | 'public') {
    this._validateExternalKeyType(keyType)

    const { externalKeys } = this.decryptSeed()
    const keyObject = externalKeys.find((key: any) => key.type === keyType)

    if (!keyObject) {
      throw new Error('Such key not present at your seed')
    }

    return keyObject[privateOrPublic]
  }

  getExternalPublicKey(keyType: string) {
    return this._getExternalKey(keyType, 'public')
  }

  getExternalPrivateKey(keyType: string) {
    return this._getExternalKey(keyType, 'private')
  }

  decryptSeed() {
    return KeysService.decryptSeed(this._encryptedSeed, this._password)
  }

  static decryptSeed(encryptedSeed: string, encryptionKey: string) {
    const encryptedSeedBuffer = Buffer.from(encryptedSeed, 'hex')
    const password = KeysService.normalizePassword(encryptionKey)
    const iv = encryptedSeedBuffer.slice(0, IV_LENGTH)
    const encryptedSeedWtihoutVector = encryptedSeedBuffer.slice(IV_LENGTH)

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, password, iv)

    const decryptedBuffer = Buffer.concat([decipher.update(encryptedSeedWtihoutVector), decipher.final()])

    const decryptedString = decryptedBuffer.toString()
    const seedParts = decryptedString.split('++')
    const seedString = seedParts[0]
    let didMethod = seedParts[1]
    const base64EncodedKeys = seedParts[2]

    let externalKeys
    let seed
    if (!didMethod) {
      // to suppoer already created seeds
      didMethod = 'jolo'
      seed = decryptedBuffer
    } else {
      seed = Buffer.from(seedString, 'hex')
    }

    validateDidMethodSupported(didMethod)
    const seedHex = seed.toString('hex')
    const seedHexWithMethod = `${seedHex}++${didMethod}`

    if (base64EncodedKeys) {
      externalKeys = JSON.parse(encode.decode(base64EncodedKeys))
    }

    return { seed, didMethod, seedHexWithMethod, externalKeys }
  }

  static normalizePassword(password: string): Buffer | undefined {
    const passwordBuffer = Buffer.from(password)

    if (!passwordBuffer.length) {
      return undefined
    }

    const passwordHexBuffer = Buffer.from(password, 'hex')

    if (passwordHexBuffer.length === PASSWORD_LENGTH) {
      return passwordHexBuffer
    }

    if (passwordBuffer.length !== PASSWORD_LENGTH) {
      return KeysService.sha256(passwordBuffer)
    }

    return passwordBuffer
  }

  async signDidDocument(didDocument: any) {
    const { digest } = await this._digestService.getJsonLdDigest(didDocument)

    const signature = this.sign(digest)
    didDocument.proof = didDocument.proof || {}
    didDocument.proof.signatureValue = signature.toString('hex')

    return didDocument
  }

  async createTransactionSignature(digestHex: string, seedHex: string) {
    const seed = Buffer.from(seedHex, 'hex')
    const privateKey = bip32.fromSeed(seed).derivePath(etheriumIdentityKey).privateKey

    const buffer = Buffer.from(digestHex, 'hex')
    const signature = ecsign(buffer, privateKey)

    const { r, s, v } = signature

    const serializedSignature = {
      r: r.toString('hex'),
      s: s.toString('hex'),
      v,
    }

    return JSON.stringify(serializedSignature)
  }

  signJWT(jwtObject: any, keyId: string = null) {
    if (!keyId) {
      const didDocumentService = new DidDocumentService(this)
      const did = didDocumentService.getMyDid()
      keyId = didDocumentService.getKeyId()

      jwtObject.payload.kid = keyId
      jwtObject.payload.iss = did
    } else {
      jwtObject.payload.iss = keyId
    }

    const toSign = [encode(JSON.stringify(jwtObject.header)), encode(JSON.stringify(jwtObject.payload))].join('.')

    const digest = KeysService.sha256(Buffer.from(toSign))

    const signature = this.sign(digest)

    jwtObject.signature = signature.toString('hex')

    return jwtObject
  }
}
