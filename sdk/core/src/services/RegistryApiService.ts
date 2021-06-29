import { profile } from '@affinidi/common'

import registrySpec from '../openapi/_registry'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

type ConstructorOptions = { registryUrl: string; accessApiKey: string }

type ApiSpec = typeof registrySpec

@profile()
export default class RegistryApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.registryUrl, options, registrySpec)
  }

  async putDocumentInIpfs(params: ExtractRequestType<ApiSpec, 'PutDocumentInIpfs'>) {
    return this.execute('PutDocumentInIpfs', { params })
  }

  async createAnchorTransaction(params: ExtractRequestType<ApiSpec, 'CreateAnchorTransaction'>) {
    return this.execute('CreateAnchorTransaction', { params })
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
    return this.execute('AnchorDid', { params })
  }

  async resolveDid(params: ExtractRequestType<ApiSpec, 'ResolveDid'>) {
    return this.execute('ResolveDid', { params })
  }

  async transactionCount(params: ExtractRequestType<ApiSpec, 'TransactionCount'>) {
    return this.execute('TransactionCount', { params })
  }
}
