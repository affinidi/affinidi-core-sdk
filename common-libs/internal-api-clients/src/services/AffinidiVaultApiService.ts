import { profile } from '@affinidi/common'

import affinidiVaultSpec from '../spec/_affinidiVault'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import DidAuthApiService, { DidAuthConstructorOptions } from './DidAuthApiService'

type ConstructorOptions = DidAuthConstructorOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

type ApiType = BuildApiType<ParseSpec<typeof affinidiVaultSpec>>

@profile()
export default class AffinidiVaultApiService extends DidAuthApiService<ApiType, 'CreateDidAuthRequest'> {
  constructor(options: ConstructorOptions) {
    super(options.vaultUrl, 'CreateDidAuthRequest', options, affinidiVaultSpec)
  }

  async searchCredentials(storageRegion: string, types?: string[][]) {
    return this.executeWithDidAuth('SearchCredentials', {
      storageRegion,
      queryParams: types ? { types: JSON.stringify(types) } : {},
    })
  }

  async getCredential(storageRegion: string, id: string) {
    return this.executeWithDidAuth('GetCredential', {
      storageRegion,
      pathParams: { id },
    })
  }

  async storeCredential(storageRegion: string, id: string, params: ApiType['StoreCredential']['requestBody']) {
    return this.executeWithDidAuth('StoreCredential', {
      storageRegion,
      params,
      pathParams: { id },
    })
  }

  async deleteCredential(storageRegion: string, id: string) {
    return this.executeWithDidAuth('DeleteCredential', {
      storageRegion,
      pathParams: { id },
    })
  }
}
