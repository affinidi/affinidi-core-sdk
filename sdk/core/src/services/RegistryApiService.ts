import { profile } from '@affinidi/common'

import registrySpec from '../_registry'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { registryUrl: string; accessApiKey: string }

@profile()
export default class IssuerApiService extends GenericApiService<ExtractOperationIdTypes<typeof registrySpec>> {
  constructor(options: ConstructorOptions) {
    super(options.registryUrl, options, registrySpec)
  }

  async putDocumentInIpfs(params: { document: unknown }) {
    return this.execute<{ hash: string }>('PutDocumentInIpfs', { params })
  }

  async createAnchorTransaction(params: { nonce: number; did: string; didDocumentAddress: string }) {
    return this.execute<{ digestHex: string }>('CreateAnchorTransaction', { params })
  }

  async anchorDid(params: {
    did: string
    didDocumentAddress: string
    ethereumPublicKeyHex: string
    transactionSignatureJson: string
    nonce?: number
  }) {
    return this.execute('AnchorDid', { params })
  }

  async resolveDid(params: { did: string }) {
    return this.execute<{ didDocument: any }>('ResolveDid', { params })
  }

  async transactionCount(params: { ethereumPublicKeyHex: string }) {
    return this.execute<{ transactionCount: number }>('TransactionCount', { params })
  }
}
