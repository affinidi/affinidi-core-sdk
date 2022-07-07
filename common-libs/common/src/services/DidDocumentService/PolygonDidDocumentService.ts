import { DidResolver } from '../../shared/DidResolver'
import { KeyVault } from './KeyVault'
import { addressFromPubKey, encodeBase58 } from '../../utils/ethUtils'
import { DidDocument } from '../../shared/interfaces'

export default class PolygonDidDocumentService {
  constructor(private readonly _keyVault: KeyVault, private readonly _options: { isTestnet: boolean }) {}

  buildDidDocumentForRegister(): Promise<{ did: string; didDocument: DidDocument; keyId: string }> {
    const did = this.getMyDid()
    const keyId = this.getKeyId()
    const publicKeyBase58 = this.getMyPubKeyBase58()
    const didDocument: DidDocument = {
      '@context': 'https://w3id.org/did/v1',
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'EcdsaSecp256k1VerificationKey2019', // external (property value)
          controller: did,
          publicKeyBase58: publicKeyBase58,
        },
      ],
    }
    return Promise.resolve({ did, didDocument, keyId })
  }

  getDidDocument(didResolver: DidResolver): Promise<DidDocument> {
    return didResolver.resolveDid(this.getMyDid())
  }

  getKeyId(): string {
    return `${this.getMyDid()}#key-1`
  }

  getMyDid(): string {
    const publicKey = this._keyVault.primaryPublicKey
    return `did:${this.getDidMethod()}:${addressFromPubKey(publicKey)}`
  }

  getMyPubKeyBase58(): string {
    return encodeBase58(this._keyVault.primaryPublicKey)
  }

  private getDidMethod(): 'polygon' | 'polygon:testnet' {
    return this._options.isTestnet ? 'polygon:testnet' : 'polygon'
  }
}
