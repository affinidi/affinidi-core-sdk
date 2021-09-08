import { profile } from '@affinidi/tools-common'

import { createClient, createClientOptions } from '../helpers/client'
import { createDidAuthSession } from '../helpers/DidAuthManager'
import { DidAuthConstructorOptions, GetParams, wrapWithDidAuth } from '../helpers/didAuthClientWrapper'
import affinidiVaultSpec from '../spec/_affinidiVault'

type ConstructorOptions = DidAuthConstructorOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const { CreateDidAuthRequest, ...otherMethods } = createClient(affinidiVaultSpec)
const client = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class AffinidiVaultApiService {
  private readonly didAuthSession
  private readonly options

  constructor(options: ConstructorOptions) {
    this.didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.options = createClientOptions(options.vaultUrl, options)
  }

  async searchCredentials(storageRegion: string, types?: string[][]) {
    return client.SearchCredentials(this.didAuthSession, this.options, {
      storageRegion,
      queryParams: types ? { types: JSON.stringify(types) } : {},
    })
  }

  async getCredential(storageRegion: string, id: string) {
    return client.GetCredential(this.didAuthSession, this.options, {
      storageRegion,
      pathParams: { id },
    })
  }

  async storeCredential(storageRegion: string, id: string, params: GetParams<typeof client.StoreCredential>) {
    return client.StoreCredential(this.didAuthSession, this.options, {
      storageRegion,
      params,
      pathParams: { id },
    })
  }

  async deleteCredential(storageRegion: string, id: string) {
    return client.DeleteCredential(this.didAuthSession, this.options, {
      storageRegion,
      pathParams: { id },
    })
  }
}
