import { KeyVault } from './KeyVault'
import { DidResolver } from '../../shared/DidResolver'
import ElemDidDocumentBuilder from './ElemDidDocumentBuilder'

export default class ElemAnchoredDidDocumentService {
  private readonly _keyVault: KeyVault
  private readonly _signingKey: string
  private readonly _builder

  constructor(keyVault: KeyVault) {
    this._signingKey = 'primary'
    this._keyVault = keyVault
    this._builder = new ElemDidDocumentBuilder(keyVault)
  }

  getMyDid(): string {
    const metadata = this._keyVault.metadata
    if (!metadata) {
      // should not happen, elem-anchored seeds are always created with metadata
      throw new Error('Metadata is empty')
    }

    return metadata.anchoredDid
  }

  getKeyId(did: string = null) {
    return `${did ? did : this.getMyDid()}#${this._signingKey}`
  }

  async buildDidDocumentForRegister() {
    const { did, didDocument, shortFormDid } = await this._builder.buildDidDocumentInfo()
    return {
      did,
      didDocument,
      keyId: `${shortFormDid}#${this._signingKey}`,
    }
  }

  getDidDocument(didResolver: DidResolver) {
    return didResolver.resolveDid(this.getMyDid())
  }
}
