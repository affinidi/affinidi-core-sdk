import { KeyVault } from './KeyVault'
import ElemDidDocumentBuilder from './ElemDidDocumentBuilder'

export default class WebDidDocumentService {
  private readonly _signingKey
  private readonly _elemBuilder
  private _keyProvider

  constructor(keyProvider: KeyVault) {
    this._signingKey = 'primary'
    this._keyProvider = keyProvider
    this._elemBuilder = new ElemDidDocumentBuilder(keyProvider)
  }

  getMyDid(): string {
    const { metadata } = this._keyProvider
    const { webDomain } = metadata

    return `did:web:${webDomain}`
  }

  getKeyId() {
    const did = this.getMyDid()

    return `${did}#${this._signingKey}`
  }

  async _buildDidDocumentInformation() {
    const did = this.getMyDid()
    const didDocModel = this._elemBuilder.buildDIDDocModel(this._keyProvider.externalKeys)
    const { didDocument } = await this._elemBuilder.buildDidDocumentInfoFromParams(did, didDocModel, '')

    return { did, didDocument }
  }

  async buildDidDocumentForRegister() {
    const { did, didDocument } = await this._buildDidDocumentInformation()
    return {
      did,
      didDocument,
      keyId: `${did}#${this._signingKey}`,
    }
  }

  // NOTE: double check - potentially could be remade to resolve it from registry, done this way for performance optimization
  async getDidDocument() {
    const { didDocument } = await this._buildDidDocumentInformation()
    return didDocument
  }
}
