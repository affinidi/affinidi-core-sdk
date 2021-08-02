import ElemDidDocument from './ElemDidDocument';
let fetch: any

if (!fetch) {
  fetch = require('node-fetch')
}

import KeysService from '../KeysService'
import {DEFAULT_REGISTRY_URL} from "../../_defaultConfig";

export default class ElemAnchoredDidDocument {
  private readonly _keysService: KeysService
  private readonly _signingKey: string
  private readonly _elementDidService: ElemDidDocument
  private readonly _registryUrl: string
  private readonly _apiKey: string

  constructor(keysService: KeysService, registryUrl?: string, apiKey?: string) {
    this._signingKey = 'primary'
    this._keysService = keysService
    this._elementDidService = new ElemDidDocument(this._keysService)
    this._apiKey = apiKey
    this._registryUrl = registryUrl || DEFAULT_REGISTRY_URL
  }

  async getMyDid(): Promise<string> {
    const legacyDid = await this._elementDidService.getMyDid()
    const elemDid = await this.convertDid(legacyDid)
    return elemDid.split('?')[0]
  }

  async getKeyId(did: string = null) {
    const _did = did ? did : await this.getMyDid()
    return `${_did}#${this._signingKey}`
  }

  async buildDidDocument() {
    return this._elementDidService.buildDidDocument()
  }
  async convertDid(did: string): Promise<any> {
    const url = `${this._registryUrl}/api/v1/did/convert-did-elem`
    const body = JSON.stringify(
      {
        did,
        didDocumentAddress: '',
        ethereumPublicKeyHex: '',
        transactionSignatureJson: {},
        anchoredDidElem: true,
      },
      null,
      2,
    )

    const headers = { Accept: 'application/json', 'Api-Key': this._apiKey, 'Content-Type': 'application/json' }

    const response = await fetch(url, { method: 'POST', headers, body })
    const result = await response.json()

    if (response.status.toString().startsWith('2')) {
      return result.did
    } else {
      let error = new Error(result)

      if (result.message) {
        error = new Error(result.message)
      }

      throw error
    }
  }
}
