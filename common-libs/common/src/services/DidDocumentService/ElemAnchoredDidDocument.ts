import KeysService from '../KeysService'
import { DidResolver } from '../../shared/DidResolver'

export default class ElemDidDocument {
  private readonly _keysService: KeysService
  private readonly _signingKey: string
  private readonly _didResolver: DidResolver

  constructor(keysService: KeysService, didResolver: DidResolver) {
    this._signingKey = 'primary'
    this._keysService = keysService
    this._didResolver = didResolver
  }

  getMyDid(): string {
    const { anchoredDid } = this._keysService.getMetadata()
    return `${anchoredDid}`
  }
  getKeyId(did: string = null) {
    return `${did ? did : this.getMyDid()}#${this._signingKey}`
  }

  async buildDidDocument() {
    return this._didResolver.resolveDid(this.getMyDid())
  }
}
