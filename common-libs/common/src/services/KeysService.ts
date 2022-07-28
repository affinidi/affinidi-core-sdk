import encode from 'base64url'
import { fromSeed as bip32FromSeed, BIP32Interface } from 'bip32'
import { ecsign } from 'ethereumjs-util'

import { validateDidMethodSupported } from '../_helpers'
import { randomBytes } from '../shared/randomBytes'
import { convertDecryptedSeedBufferToString, parseDecryptedSeed } from '../shared/seedTools'
import DigestService from './DigestService'
import DidDocumentService from './DidDocumentService'
import { SUPPORTED_DID_METHODS } from '../_defaultConfig'

const createHash = require('create-hash/browser')
const tinySecp256k1 = require('tiny-secp256k1')
const aes = require('browserify-aes/browser')
const aesModes = require('browserify-aes/modes')

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const PASSWORD_LENGTH = 32

const jolocomIdentityKey = "m/73'/0'/0'/0" // eslint-disable-line
const etheriumIdentityKey = "m/44'/60'/0'/0/0" // eslint-disable-line
const elemIdentityPrimaryKey = "m/44'/60'/0'/1/0" // eslint-disable-line

const cachedSigningKey: Record<string, BIP32Interface> = {}

// eslint-disable-next-line max-len, prettier/prettier
type TypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array
type DocumentWithOptionalProof = { proof?: Record<string, unknown> }
type JwtObject = {
  header?: unknown
  payload: Record<string, unknown>
  signature?: string
}

type DidMethod = typeof SUPPORTED_DID_METHODS[number]

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

export default class KeysService {
  private readonly _digestService: DigestService
  private readonly _encryptedSeed: string
  private readonly _password: string

  constructor(encryptedSeed: string, password: string) {
    this._digestService = new DigestService()
    this._encryptedSeed = encryptedSeed
    this._password = password
  }

  sign(digest: Buffer) {
    const { seed, didMethod } = this.decryptSeed()

    const seedHex = seed.toString('hex')
    const signingKey = KeysService.getKey(seedHex, didMethod)

    return signingKey.sign(digest)
  }

  static async fromSeedAndPassword(
    fullSeed: string,
    password: string,
  ): Promise<{ keysService: KeysService; encryptedSeed: string }> {
    const passwordBuffer = KeysService.normalizePassword(password)
    const encryptedSeed = await KeysService.encryptSeed(fullSeed, passwordBuffer)
    const keysService = new KeysService(encryptedSeed, password)
    return { encryptedSeed, keysService }
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

  static sha256(data: string | Buffer | TypedArray | DataView): Buffer {
    return createHash('sha256').update(data).digest()
  }

  private static getDerivationPath(didMethod: DidMethod, isAnchoring: boolean) {
    if (isAnchoring) {
      return etheriumIdentityKey
    }

    switch (didMethod) {
      case 'jolo':
        return jolocomIdentityKey
      case 'elem':
      case 'elem-anchored':
        return elemIdentityPrimaryKey
      case 'polygon':
      case 'polygon:testnet':
        return etheriumIdentityKey
    }
  }

  private static getKey(seedHex: string, didMethod: string, isAnchoring = false) {
    validateDidMethodSupported(didMethod)
    const derivationPath = KeysService.getDerivationPath(didMethod, isAnchoring)
    const seed = Buffer.from(seedHex, 'hex')
    const id = `${seedHex}::${derivationPath}`
    if (!cachedSigningKey[id]) {
      cachedSigningKey[id] = bip32FromSeed(seed).derivePath(derivationPath)
    }

    return cachedSigningKey[id]
  }

  static getPublicAndPrivateKeys(seedHex: string, didMethod: string) {
    const { publicKey, privateKey } = KeysService.getKey(seedHex, didMethod)

    return { publicKey, privateKey }
  }

  static getAnchorTransactionPublicAndPrivateKeys(seedHex: string, didMethod: string) {
    const { publicKey, privateKey } = KeysService.getKey(seedHex, didMethod, true)

    return { publicKey, privateKey }
  }

  getOwnPublicKey() {
    const { seed, didMethod } = this.decryptSeed()
    const seedHex = seed.toString('hex')
    return KeysService.getPublicKey(seedHex, didMethod)
  }

  static getPublicKey(seedHex: string, didMethod: string) {
    return KeysService.getKey(seedHex, didMethod).publicKey
  }

  public getOwnPrivateKey() {
    const { seed, didMethod } = this.decryptSeed()
    const seedHex = seed.toString('hex')
    return KeysService.getPrivateKey(seedHex, didMethod)
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

  static async encryptSeed(seedHexWithMethod: string, encryptionKeyBuffer: unknown) {
    // legacy seeds are not actually strings, so should be encoded with hex
    const bufferMethod = seedHexWithMethod.includes('++') ? undefined : 'hex'

    const seedBuffer = Buffer.from(seedHexWithMethod, bufferMethod)
    const iv = await randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKeyBuffer, iv)
    const encryptedSeed = Buffer.concat([cipher.update(seedBuffer), cipher.final()])

    return Buffer.concat([iv, encryptedSeed]).toString('hex')
  }

  private _validateExternalKeyType(keyType: string) {
    const SUPPORTED_EXTERNAL_KEY_TYPES = ['rsa', 'bbs']
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
    const decryptedString = convertDecryptedSeedBufferToString(decryptedBuffer)

    return parseDecryptedSeed(decryptedString)
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

  /**
   * Note that this function modifies the source object for backwards compatibility reasons
   */
  async signDidDocument<T extends DocumentWithOptionalProof>(didDocument: T) {
    const { digest } = await this._digestService.getJsonLdDigest(didDocument)

    const signature = this.sign(digest)
    return Object.assign(didDocument, {
      proof: Object.assign(didDocument.proof ?? {}, {
        signatureValue: signature.toString('hex'),
      }),
    })
  }

  async createTransactionSignature(digestHex: string, seedHex?: string) {
    let seed: Buffer
    if (seedHex) {
      seed = Buffer.from(seedHex, 'hex')
    } else {
      ;({ seed } = this.decryptSeed())
    }

    const privateKey = bip32FromSeed(seed).derivePath(etheriumIdentityKey).privateKey

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

  private getJWTAdditionalPayload(keyId?: string) {
    const didDocumentService = DidDocumentService.createDidDocumentService(this)

    return {
      iss: didDocumentService.getMyDid(),
      kid: keyId ?? didDocumentService.getKeyId(),
    }
  }

  /**
   * Note that this function modifies the source object for backwards compatibility reasons
   */
  signJWT<T extends JwtObject>(sourceObject: T, keyId: string = null) {
    const payload = Object.assign(sourceObject.payload, this.getJWTAdditionalPayload(keyId))
    const jwtObject = Object.assign(sourceObject, { payload })

    const toSign = [encode(JSON.stringify(jwtObject.header)), encode(JSON.stringify(jwtObject.payload))].join('.')

    const digest = KeysService.sha256(Buffer.from(toSign))

    const signature = this.sign(digest)

    return Object.assign(jwtObject, { signature: signature.toString('hex') })
  }
}
