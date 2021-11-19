import { profile } from '@affinidi/tools-common'
import {
  createClientMethods,
  createDidAuthClient,
  createDidAuthSession,
  DidAuthConstructorOptions,
  GetDidAuthParams,
  wrapWithDidAuth,
} from '@affinidi/tools-openapi'

import affinidiVaultSpec from '../spec/_affinidiVault'

type ConstructorOptions = DidAuthConstructorOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const { CreateDidAuthRequest, ...otherMethods } = createClientMethods(affinidiVaultSpec)
const clientMethods = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class AffinidiVaultApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    const didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.client = createDidAuthClient(clientMethods, didAuthSession, options.vaultUrl, options)
  }

  async searchCredentials(storageRegion: string, types?: string[][]) {
    return this.client.SearchCredentials({
      storageRegion,
      queryParams: types ? { types: JSON.stringify(types) } : {},
    })
  }

  async getCredential(storageRegion: string, id: string) {
    return this.client.GetCredential({
      storageRegion,
      pathParams: { id },
    })
  }

  async storeCredential(
    storageRegion: string,
    id: string,
    params: GetDidAuthParams<typeof clientMethods.StoreCredential>,
  ) {
    return this.client.StoreCredential({
      storageRegion,
      params,
      pathParams: { id },
    })
  }

  async deleteCredential(storageRegion: string, id: string) {
    return this.client.DeleteCredential({
      storageRegion,
      pathParams: { id },
    })
  }
}
