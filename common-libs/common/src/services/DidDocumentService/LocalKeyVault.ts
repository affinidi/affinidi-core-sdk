import { KeyVault } from './KeyVault'
import { KeysService } from '../index'
import * as secp256k1 from 'secp256k1'

/**
 * KeyStore backed implementation when the seed is known
 */
export class LocalKeyVault implements KeyVault {
  private readonly _publicKey: Buffer
  private readonly _recoveryPublicKey: Buffer
  private readonly _externalKeys: any[]
  private readonly _privateKey: Buffer

  constructor(keyService: KeysService) {
    const { seed, externalKeys } = keyService.decryptSeed()
    this._externalKeys = externalKeys

    const seedHex = seed.toString('hex')

    const { publicKey, privateKey } = KeysService.getPublicAndPrivateKeys(seedHex, 'elem')
    this._publicKey = publicKey
    this._privateKey = privateKey

    const { publicKey: recoveryPublicKey } = KeysService.getAnchorTransactionPublicAndPrivateKeys(seedHex, 'elem')
    this._recoveryPublicKey = recoveryPublicKey
  }

  get primaryPublicKey(): Buffer {
    return this._publicKey
  }

  get recoveryPublicKey(): Buffer {
    return this._recoveryPublicKey
  }

  get externalKeys(): any[] {
    return this._externalKeys
  }

  sign(payload: Buffer): Buffer {
    const signatureObject = secp256k1.ecdsaSign(payload, this._privateKey)

    return Buffer.from(signatureObject.signature)
  }
}
