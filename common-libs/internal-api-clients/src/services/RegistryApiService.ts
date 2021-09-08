import { profile } from '@affinidi/tools-common'

import registrySpec from '../spec/_registry'
import { createServiceFactory, createServiceOptions, GetParams, ServiceOptions } from './GenericApiService'

type ConstructorOptions = ServiceOptions & { registryUrl: string }

const service = createServiceFactory(registrySpec).createInstance()

@profile()
export default class RegistryApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createServiceOptions(options.registryUrl, options)
  }

  async putDocumentInIpfs(params: GetParams<typeof service.PutDocumentInIpfs>) {
    return service.PutDocumentInIpfs(this.options, { params })
  }

  async createAnchorTransaction(params: GetParams<typeof service.CreateAnchorTransaction>) {
    return service.CreateAnchorTransaction(this.options, { params })
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
    return service.AnchorDid(this.options, { params })
  }

  async resolveDid(params: GetParams<typeof service.ResolveDid>) {
    return service.ResolveDid(this.options, { params })
  }

  async transactionCount(params: GetParams<typeof service.TransactionCount>) {
    return service.TransactionCount(this.options, { params })
  }
}
