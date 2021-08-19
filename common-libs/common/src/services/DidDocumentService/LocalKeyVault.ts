import { KeyVault } from './KeyVault'
import { KeysService } from '../index'
import * as secp256k1 from 'secp256k1'

/**
 * KeyStore backed implementation when the seed is known
 */
export class LocalKeyVault implements KeyVault {
  private _keyService: KeysService

  constructor(keyService: KeysService) {
    this._keyService = keyService
  }

  get primaryPublicKey(): Buffer {
    const { seed } = this._keyService.decryptSeed()
    const seedHex = seed.toString('hex')

    const { publicKey } = KeysService.getPublicAndPrivateKeys(seedHex, 'elem')
    return publicKey
  }

  get recoveryPublicKey(): Buffer {
    const { seed } = this._keyService.decryptSeed()
    const seedHex = seed.toString('hex')

    const { publicKey } = KeysService.getAnchorTransactionPublicAndPrivateKeys(seedHex, 'elem')
    return publicKey
  }

  externalKeys(): any[] {
    const { externalKeys } = this._keyService.decryptSeed()
    return externalKeys
  }

  sign(payload: Buffer): Buffer {
    const { seed } = this._keyService.decryptSeed()
    const seedHex = seed.toString('hex')

    const { privateKey } = KeysService.getPublicAndPrivateKeys(seedHex, 'elem')

    const signatureObject = secp256k1.ecdsaSign(payload, privateKey)

    return Buffer.from(signatureObject.signature)
  }
}
