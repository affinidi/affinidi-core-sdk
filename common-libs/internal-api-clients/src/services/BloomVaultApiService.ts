import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClientFactory, createClientOptions } from '../helpers/client'
import bloomVaultSpec from '../spec/_bloomVault'

type ConstructorOptions = ClientOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const client = createClientFactory(bloomVaultSpec).createInstance()

@profile()
export default class BloomVaultApiService {
  private readonly options

  constructor({ vaultUrl, ...otherOptions }: ConstructorOptions) {
    this.options = createClientOptions(vaultUrl, otherOptions)
  }

  async requestAuthToken({ did, storageRegion }: { did: string; storageRegion: string }) {
    return client.RequestAuthToken(this.options, {
      storageRegion,
      queryParams: { did },
    })
  }

  async validateAuthToken(params: { accessToken: string; signature: string; did: string; storageRegion: string }) {
    const { accessToken, signature, did, storageRegion } = params
    return client.ValidateAuthToken(this.options, {
      storageRegion,
      params: { accessToken, signature, did },
    })
  }

  async postCredential(params: { accessToken: string; cyphertext: string; storageRegion: string }) {
    const { accessToken, cyphertext, storageRegion } = params
    return client.PostCredential(this.options, {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      params: { cyphertext },
    })
  }

  async deleteCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return client.DeleteCredentials(this.options, {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }

  async getCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return client.GetCredentials(this.options, {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }
}
