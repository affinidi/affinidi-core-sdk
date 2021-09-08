import { profile } from '@affinidi/tools-common'

import { createDidAuthSession } from '../helpers/DidAuthManager'
import affinidiVaultSpec from '../spec/_affinidiVault'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import { DidAuthConstructorOptions, wrapWithDidAuth } from './DidAuthApiService'
import { createServiceFactory, createServiceOptions } from './GenericApiService'

type ConstructorOptions = DidAuthConstructorOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const { CreateDidAuthRequest, ...otherMethods } = createServiceFactory(affinidiVaultSpec).createInstance()
const service = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

type ApiType = BuildApiType<ParseSpec<typeof affinidiVaultSpec>>

@profile()
export default class AffinidiVaultApiService {
  private readonly didAuthSession
  private readonly options

  constructor(options: ConstructorOptions) {
    this.didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.options = createServiceOptions(options.vaultUrl, options)
  }

  async searchCredentials(storageRegion: string, types?: string[][]) {
    return service.SearchCredentials(this.didAuthSession, this.options, {
      storageRegion,
      queryParams: types ? { types: JSON.stringify(types) } : {},
    })
  }

  async getCredential(storageRegion: string, id: string) {
    return service.GetCredential(this.didAuthSession, this.options, {
      storageRegion,
      pathParams: { id },
    })
  }

  async storeCredential(storageRegion: string, id: string, params: ApiType['StoreCredential']['requestBody']) {
    return service.StoreCredential(this.didAuthSession, this.options, {
      storageRegion,
      params,
      pathParams: { id },
    })
  }

  async deleteCredential(storageRegion: string, id: string) {
    return service.DeleteCredential(this.didAuthSession, this.options, {
      storageRegion,
      pathParams: { id },
    })
  }
}
