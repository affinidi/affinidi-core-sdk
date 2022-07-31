import { DidResolver } from '../../shared/DidResolver'
import { KeyVault } from './KeyVault'
import { encodeBase58 } from '../../utils/ethUtils'
import { DidDocument } from '../../shared/interfaces'

const buildOnlyDefaultKeyDidDocument = (publicKeyBase58: string, did: string): any => ({
  '@context': ['https://w3id.org/did/v1.0', 'https://w3id.org/sol/v1'],
  id: did,
  controller: [],
  verificationMethod: [
    {
      id: `${did}#default`,
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58,
    },
  ],
  authentication: [],
  assertionMethod: [
    {
      id: `${did}#default`,
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58,
    },
  ],
  keyAgreement: [],
  capabilityInvocation: [`${did}#default`],
  capabilityDelegation: [],
  service: [],
  publicKey: [
    {
      id: `${did}#default`,
      // type: 'Secp256k1VerificationKey2018', used for all other dids
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58,
    },
  ],
})

export default class SolDidDocumentService {
  constructor(
    private readonly _keyVault: KeyVault,
    private readonly _options: { network: 'mainnet' | 'testnet' | 'devnet' },
  ) {}

  buildDidDocumentForRegister(): Promise<{ did: string; didDocument: DidDocument; keyId: string }> {
    const did = this.getMyDid()
    const keyId = this.getKeyId()
    const publicKeyBase58 = this.getMyPubKeyBase58()
    const didDocument: DidDocument = buildOnlyDefaultKeyDidDocument(publicKeyBase58, did)
    return Promise.resolve({ did, didDocument, keyId })
  }

  getDidDocument(didResolver: DidResolver): Promise<DidDocument> {
    return didResolver.resolveDid(this.getMyDid())
  }

  getKeyId(): string {
    return `${this.getMyDid()}#default`
  }

  getMyDid(): string {
    return `did:${this.getDidMethod()}:${this.getMyPubKeyBase58()}`
  }

  getMyPubKeyBase58(): string {
    return encodeBase58(this._keyVault.primaryPublicKey)
  }

  private getDidMethod(): 'sol' | 'sol:testnet' | 'sol:devnet' {
    if (this._options.network === 'mainnet') return 'sol'
    return `sol:${this._options.network}`
  }
}
