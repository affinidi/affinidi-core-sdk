import { KeyVault } from './KeyVault'
import { DidResolver } from '../../shared/DidResolver'
import { ConcreteDidDocument } from './ConcreteDidDocument'

export default class ElemAnchoredDidDocument implements ConcreteDidDocument<any> {
  private readonly _keyVault: KeyVault
  private readonly _signingKey: string

  constructor(keyVault: KeyVault) {
    this._signingKey = 'primary'
    this._keyVault = keyVault
  }

  getMyDid(): string {
    const { anchoredDid } = this._keyVault.metadata
    return `${anchoredDid}`
  }
  getKeyId(did: string = null) {
    return `${did ? did : this.getMyDid()}#${this._signingKey}`
  }

  async buildDidDocument(didResolver?: DidResolver) {
    if (!didResolver) {
      throw new Error('Provide DidResolver to use buildDidDocument for elem-anchored method')
    }

    return didResolver.resolveDid(this.getMyDid())
  }
}
