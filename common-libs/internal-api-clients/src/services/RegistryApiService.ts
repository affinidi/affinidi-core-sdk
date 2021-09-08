import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClientFactory, createClientOptions, GetParams } from '../helpers/client'
import registrySpec from '../spec/_registry'

type ConstructorOptions = ClientOptions & { registryUrl: string }

const client = createClientFactory(registrySpec).createInstance()

@profile()
export default class RegistryApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createClientOptions(options.registryUrl, options)
  }

  async putDocumentInIpfs(params: GetParams<typeof client.PutDocumentInIpfs>) {
    return client.PutDocumentInIpfs(this.options, { params })
  }

  async createAnchorTransaction(params: GetParams<typeof client.CreateAnchorTransaction>) {
    return client.CreateAnchorTransaction(this.options, { params })
  }

  async anchorDid({
    did,
    didDocumentAddress,
    ethereumPublicKeyHex,
    transactionSignatureJson,
    nonce,
  }: {
    did: string
    didDocumentAddress: string
    ethereumPublicKeyHex: string
    transactionSignatureJson: string
    nonce?: number
  }) {
    const params = {
      did,
      didDocumentAddress,
      ethereumPublicKeyHex,
      transactionSignatureJson: transactionSignatureJson as any,
      nonce,
    }
    return client.AnchorDid(this.options, { params })
  }

  async resolveDid(params: GetParams<typeof client.ResolveDid>) {
    return client.ResolveDid(this.options, { params })
  }

  async transactionCount(params: GetParams<typeof client.TransactionCount>) {
    return client.TransactionCount(this.options, { params })
  }
}
