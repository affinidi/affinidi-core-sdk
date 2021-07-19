import { profile } from '@affinidi/common'

import bloomVaultSpec from '../openapi/_bloomVault'
import GenericApiService from './GenericApiService'

type ConstructorOptions = { vaultUrl: string; accessApiKey: string }

export type BlobType = {
  cyphertext: string
  id: number
}

type ApiSpec = typeof bloomVaultSpec

@profile()
export default class BloomVaultApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.vaultUrl, options, bloomVaultSpec)
  }

  async requestAuthToken({ did, storageRegion }: { did: string; storageRegion: string }) {
    return this.execute('RequestAuthToken', {
      storageRegion,
      queryParams: { did },
    })
  }

  async validateAuthToken(params: { accessToken: string; signature: string; did: string; storageRegion: string }) {
    const { accessToken, signature, did, storageRegion } = params
    return this.execute('ValidateAuthToken', {
      storageRegion,
      params: { accessToken, signature, did },
    })
  }

  async postCredential(params: { accessToken: string; cyphertext: string; storageRegion: string }) {
    const { accessToken, cyphertext, storageRegion } = params
    return this.execute('PostCredential', {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      params: { cyphertext },
    })
  }

  async deleteCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return this.execute('DeleteCredentials', {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }

  async getCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return this.execute('GetCredentials', {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }
}
