import { DidResolver } from '../../shared/DidResolver'
import { KeyVault } from './KeyVault'
import { encodeBase58 } from '../../utils/ethUtils'
import { DidDocument, ExternalKey } from '../../shared/interfaces'

const buildOnlyDefaultKeyDidDocument = (publicKeyBase58: string, did: string, externalKeys: ExternalKey[]): any => {
  const eddsaSection = {
    id: `${did}#default`,
    type: 'Ed25519VerificationKey2018',
    controller: did,
    publicKeyBase58,
  }
  const externalSections = (externalKeys ?? []).map((e) => ({
    id: `${did}#${e.type}`,
    controller: did,
    ...(e.type === 'bbs' && { type: 'Bls12381G2Key2020' }),
    ...(e.type === 'rsa' && { type: 'RsaVerificationKey2018' }),
    ...(e.format === 'base58' && { publicKeyBase58: e.public }),
    ...(e.format === 'pem' && { publicKeyPem: e.public }),
  }))
  const sections = [eddsaSection, ...externalSections]
  const template: any = {
    '@context': ['https://w3id.org/did/v1.0', 'https://w3id.org/sol/v1'],
    id: did,
    controller: [],
    verificationMethod: sections,
    authentication: [],
    assertionMethod: [],
    keyAgreement: [],
    capabilityInvocation: [`${did}#default`],
    capabilityDelegation: [],
    service: [],
    publicKey: sections,
  }

  return template
}

export default class SolDidDocumentService {
  constructor(
    private readonly _keyVault: KeyVault,
    private readonly _options: { network: 'mainnet' | 'testnet' | 'devnet' },
  ) {}

  buildDidDocumentForRegister(): Promise<{ did: string; didDocument: DidDocument; keyId: string }> {
    const did = this.getMyDid()
    const keyId = this.getKeyId()
    const publicKeyBase58 = this.getMyPubKeyBase58()
    const didDocument: DidDocument = buildOnlyDefaultKeyDidDocument(publicKeyBase58, did, this.getMyExternalKeys())
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

  getMyExternalKeys() {
    return this._keyVault.externalKeys
  }

  private getDidMethod(): 'sol' | 'sol:testnet' | 'sol:devnet' {
    console.log({ network123: this._options.network })
    if (this._options.network === 'mainnet') return 'sol'
    return `sol:${this._options.network}`
  }
}
