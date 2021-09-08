import { profile } from '@affinidi/tools-common'

import bloomVaultSpec from '../spec/_bloomVault'
import { createServiceFactory, createServiceOptions, ServiceOptions } from './GenericApiService'

type ConstructorOptions = ServiceOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const service = createServiceFactory(bloomVaultSpec).createInstance()

@profile()
export default class BloomVaultApiService {
  private readonly options

  constructor({ vaultUrl, ...otherOptions }: ConstructorOptions) {
    this.options = createServiceOptions(vaultUrl, otherOptions)
  }

  async requestAuthToken({ did, storageRegion }: { did: string; storageRegion: string }) {
    return service.RequestAuthToken(this.options, {
      storageRegion,
      queryParams: { did },
    })
  }

  async validateAuthToken(params: { accessToken: string; signature: string; did: string; storageRegion: string }) {
    const { accessToken, signature, did, storageRegion } = params
    return service.ValidateAuthToken(this.options, {
      storageRegion,
      params: { accessToken, signature, did },
    })
  }

  async postCredential(params: { accessToken: string; cyphertext: string; storageRegion: string }) {
    const { accessToken, cyphertext, storageRegion } = params
    return service.PostCredential(this.options, {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      params: { cyphertext },
    })
  }

  async deleteCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return service.DeleteCredentials(this.options, {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }

  async getCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return service.GetCredentials(this.options, {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }
}
