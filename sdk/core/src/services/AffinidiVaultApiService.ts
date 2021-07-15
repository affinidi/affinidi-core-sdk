import { profile } from '@affinidi/common'

import affinidiVaultSpec from '../openapi/_affinidiVault'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

type ConstructorOptions = { vaultUrl: string; accessApiKey: string }

export type BlobType = {
  cyphertext: string
  id: number
}

type ApiSpec = typeof affinidiVaultSpec

@profile()
export default class AffinidiVaultApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.vaultUrl, options, affinidiVaultSpec)
  }

  async createDidAuthRequest(params: ExtractRequestType<ApiSpec, 'CreateDidAuthRequest'>) {
    return this.execute('CreateDidAuthRequest', { params })
  }

  async searchCredentials(accessToken: string, storageRegion: string, types: string[]) {
    return this.execute('SearchCredentials', {
      authorization: accessToken,
      storageRegion,
      urlPostfix: `?types=${types}`
    })
  }

  async getCredential(accessToken: string, storageRegion: string, id: string) {
    return this.execute('GetCredential', {
      authorization: accessToken,
      storageRegion,
      urlPostfix: `/${id}`
    })
  }

  async storeCredential(id: string, params: ExtractRequestType<ApiSpec, 'StoreCredential'>) {
    return this.execute('StoreCredential', { params, urlPostfix: `/${id}` })
  }

  async deleteCredential(accessToken: string, storageRegion: string, id: string) {
    return this.execute('DeleteCredential', {
      authorization: accessToken,
      storageRegion,
      urlPostfix: `/${id}`
    })
  }
}
