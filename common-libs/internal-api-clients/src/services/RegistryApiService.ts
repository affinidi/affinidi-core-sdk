import { profile } from '@affinidi/tools-common'
import { ClientOptions, createClient, createClientMethods, GetParams } from '@affinidi/tools-openapi'

import registrySpec from '../spec/_registry'

type ConstructorOptions = ClientOptions & { registryUrl: string }

const clientMethods = createClientMethods(registrySpec)

@profile()
export default class RegistryApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    this.client = createClient(clientMethods, options.registryUrl, options)
  }

  async putDocumentInIpfs(params: GetParams<typeof clientMethods.PutDocumentInIpfs>) {
    return this.client.PutDocumentInIpfs({ params })
  }

  async createAnchorTransaction(params: GetParams<typeof clientMethods.CreateAnchorTransaction>) {
    return this.client.CreateAnchorTransaction({ params })
  }

  async anchorDid(params: GetParams<typeof clientMethods.AnchorDid>) {
    const originFromEnv = process.env.REGISTRY_ORIGIN
    const paramsExtended: GetParams<typeof clientMethods.AnchorDid> =
      !params.origin && originFromEnv
        ? {
            ...params,
            origin: originFromEnv,
          }
        : params

    return this.client.AnchorDid({ params: paramsExtended })
  }

  async resolveDid(params: GetParams<typeof clientMethods.ResolveDid>) {
    return this.client.ResolveDid({ params })
  }

  async transactionCount(params: GetParams<typeof clientMethods.TransactionCount>) {
    return this.client.TransactionCount({ params })
  }
}
