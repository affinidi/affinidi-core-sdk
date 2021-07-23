import { profile } from '@affinidi/common'

import affinidiVaultSpec from '../openapi/_affinidiVault'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService from './GenericApiService'

type ConstructorOptions = { vaultUrl: string; accessApiKey: string }

export type BlobType = {
  cyphertext: string
  id: number
}

type ApiType = BuildApiType<ParseSpec<typeof affinidiVaultSpec>>

@profile()
export default class AffinidiVaultApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.vaultUrl, options, affinidiVaultSpec)
  }

  async createDidAuthRequest(params: ApiType['CreateDidAuthRequest']['requestBody']) {
    return this.execute('CreateDidAuthRequest', { params })
  }

  async searchCredentials(accessToken: string, storageRegion: string, types: string[][]) {
    return this.execute('SearchCredentials', {
      authorization: accessToken,
      storageRegion,
      queryParams: { types: JSON.stringify(types) },
    })
  }

  async getCredential(accessToken: string, storageRegion: string, id: string) {
    return this.execute('GetCredential', {
      authorization: accessToken,
      storageRegion,
      pathParams: { id },
    })
  }

  async storeCredential(
    accessToken: string,
    storageRegion: string,
    id: string,
    params: ApiType['StoreCredential']['requestBody'],
  ) {
    return this.execute('StoreCredential', {
      authorization: accessToken,
      storageRegion,
      params,
      pathParams: { id },
    })
  }

  async deleteCredential(accessToken: string, storageRegion: string, id: string) {
    return this.execute('DeleteCredential', {
      authorization: accessToken,
      storageRegion,
      pathParams: { id },
    })
  }
}
