const RESOLVE_DID_PATH = '/api/v1/did/resolve-did'

let fetch: any

if (!fetch) {
  fetch = require('node-fetch')
}

export class RegistryResolveDidService {
  constructor(private readonly _registryUrl: string, private readonly _apiKey: string) {}

  async resolveDid(did: string): Promise<any> {
    const url = `${this._registryUrl}${RESOLVE_DID_PATH}`
    const body = JSON.stringify({ did }, null, 2)

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
