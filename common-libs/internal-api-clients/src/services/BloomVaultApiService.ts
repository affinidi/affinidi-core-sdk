import { profile } from '@affinidi/tools-common'
import { ClientOptions, createClient, createClientMethods } from '@affinidi/tools-openapi'

import bloomVaultSpec from '../spec/_bloomVault'

type ConstructorOptions = ClientOptions & { vaultUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const clientMethods = createClientMethods(bloomVaultSpec)

@profile()
export default class BloomVaultApiService {
  private readonly client

  constructor({ vaultUrl, ...otherOptions }: ConstructorOptions) {
    this.client = createClient(clientMethods, vaultUrl, otherOptions)
  }

  async requestAuthToken({ did, storageRegion }: { did: string; storageRegion: string }) {
    return this.client.RequestAuthToken({
      storageRegion,
      queryParams: { did },
    })
  }

  async validateAuthToken(params: { accessToken: string; signature: string; did: string; storageRegion: string }) {
    const { accessToken, signature, did, storageRegion } = params
    return this.client.ValidateAuthToken({
      storageRegion,
      params: { accessToken, signature, did },
    })
  }

  async postCredential(params: { accessToken: string; cyphertext: string; storageRegion: string }) {
    const { accessToken, cyphertext, storageRegion } = params
    return this.client.PostCredential({
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      params: { cyphertext },
    })
  }

  async deleteCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return this.client.DeleteCredentials({
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }

  async getCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return this.client.GetCredentials({
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      pathParams: { start: `${start}`, end: `${end}` },
    })
  }
}
