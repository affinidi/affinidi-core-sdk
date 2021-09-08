import { profile } from '@affinidi/tools-common'

import registrySpec from '../spec/_registry'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'

type ConstructorOptions = GenericConstructorOptions & { registryUrl: string }

type ApiType = BuildApiType<ParseSpec<typeof registrySpec>>

@profile()
export default class RegistryApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.registryUrl, options, registrySpec)
  }

  async putDocumentInIpfs(params: ApiType['PutDocumentInIpfs']['requestBody']) {
    return this.execute('PutDocumentInIpfs', { params })
  }

  async createAnchorTransaction(params: ApiType['CreateAnchorTransaction']['requestBody']) {
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

  async resolveDid(params: ApiType['ResolveDid']['requestBody']) {
    return this.execute('ResolveDid', { params })
  }

  async transactionCount(params: ApiType['TransactionCount']['requestBody']) {
    return this.execute('TransactionCount', { params })
  }
}
