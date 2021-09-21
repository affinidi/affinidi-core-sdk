import KeysService from '../KeysService'
import { randomBytes } from '../../shared/randomBytes'

import { defaultContext } from './defaultJoloContext'
import { ConcreteDidDocument } from './ConcreteDidDocument'

const keccak256 = require('keccak256')

export default class JoloDidDocument implements ConcreteDidDocument {
  private readonly _keysService: KeysService
  private readonly _signingKey: string

  constructor(keysService: KeysService) {
    this._signingKey = 'keys-1'
    this._keysService = keysService
  }

  private _getDid(seedHex: string) {
    const publicKey = KeysService.getPublicKey(seedHex, 'jolo')
    const prefix = 'did:jolo:'
    const suffix = keccak256(publicKey)

    return prefix + suffix.toString('hex')
  }

  getMyDid(): string {
    const { seed } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')

    return this._getDid(seedHex)
  }

  getKeyId(did: string = null) {
    if (!did) {
      did = this.getMyDid()
    }

    return `${did}#${this._signingKey}`
  }

  async buildDidDocument() {
    const { seed } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')

    const publicKey = KeysService.getPublicKey(seedHex, 'jolo')

    const did = this._getDid(seedHex)
    const keyId = `${did}#${this._signingKey}`

    const nonce = await randomBytes(8)

    return {
      '@context': defaultContext,
      id: did,
      created: new Date().toISOString(),
      authentication: [keyId],
      assertionMethod: [keyId],
      publicKey: [
        {
          id: keyId,
          controller: did,
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: publicKey.toString('hex'),
        },
      ],
      proof: {
        type: 'EcdsaKoblitzSignature2016',
        created: new Date().toISOString(),
        creator: keyId,
        nonce: nonce.toString('hex'),
        signatureValue: '',
      },
    }
  }
}
