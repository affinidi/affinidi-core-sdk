import KeysService from '../KeysService'

export default class ElemDidDocument {
  private readonly _keysService: KeysService
  private readonly _signingKey: string
  private readonly _registryUrl: string
  private readonly _apiKey: string

  constructor(keysService: KeysService, registryUrl?: string, apiKey?: string) {
    this._signingKey = 'primary'
    this._keysService = keysService
    this._apiKey = apiKey
    this._registryUrl = registryUrl
  }

  getMyDid(): string {
    const { anchoredDid } = this._keysService.getMetadata()
    return `${anchoredDid}`
  }
  getKeyId(did: string = null) {
    return `${did ? did: this.getMyDid()}#${this._signingKey}`
  }

  async buildDidDocument() {
    return this.resolveDid(this.getMyDid())
  }
  async resolveDid(did: string): Promise<any> {
    const url = `${this._registryUrl}/api/v1/did/resolve-did`
    const body = JSON.stringify(
      {
        did,
      },
      null,
      2,
    )

    const headers = { Accept: 'application/json', 'Api-Key': this._apiKey, 'Content-Type': 'application/json' }

    const response = await fetch(url, { method: 'POST', headers, body })
    const result = await response.json()

    if (response.status.toString().startsWith('2')) {
      return result.didDocument
    } else {
      let error = new Error(result)

      if (result.message) {
        error = new Error(result.message)
      }

      throw error
    }
  }
}
