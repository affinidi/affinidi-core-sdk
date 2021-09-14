import KeysService from '../KeysService'
import { RegistryResolveDidService } from '../RegistryResolveDidService'

export default class ElemDidDocument {
  private readonly _keysService: KeysService
  private readonly _signingKey: string
  private readonly _registryResolveDidService: RegistryResolveDidService

  constructor(keysService: KeysService, registryResolveDidService: RegistryResolveDidService) {
    this._signingKey = 'primary'
    this._keysService = keysService
    this._registryResolveDidService = registryResolveDidService
  }

  getMyDid(): string {
    const { anchoredDid } = this._keysService.getMetadata()
    return `${anchoredDid}`
  }
  getKeyId(did: string = null) {
    return `${did ? did : this.getMyDid()}#${this._signingKey}`
  }

  async buildDidDocument() {
    return this._registryResolveDidService.resolveDid(this.getMyDid())
  }
}
