import { KeyVault } from './KeyVault'
import ElemDidDocumentBuilder from './ElemDidDocumentBuilder'

export default class ElemDidDocumentService {
  private readonly _signingKey
  private readonly _builder

  constructor(keyProvider: KeyVault) {
    this._signingKey = 'primary'
    this._builder = new ElemDidDocumentBuilder(keyProvider)
  }

  getMyDid(): string {
    const { did } = this._builder.getMyDidConfig()

    return did
  }

  getKeyId() {
    const { shortFormDid } = this._builder.getMyDidConfig()

    return `${shortFormDid}#${this._signingKey}`
  }

  async buildDidDocumentForRegister() {
    const { did, didDocument, shortFormDid } = await this._builder.buildDidDocumentInfo()
    return {
      did,
      didDocument,
      keyId: `${shortFormDid}#${this._signingKey}`,
    }
  }

  async getDidDocument() {
    const { didDocument } = await this._builder.buildDidDocumentInfo()
    return didDocument
  }
}
