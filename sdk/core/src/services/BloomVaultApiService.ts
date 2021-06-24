import { profile } from '@affinidi/common'

import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { vaultUrl: string; accessApiKey: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const createOperation = <T extends string>(operationId: T) => ({ operationId })

// Swagger documentation is unavailable for bloom vault
const bloomVaultSpec = {
  servers: [{ url: '' }],
  paths: {
    '/auth/request-token': {
      post: createOperation('RequestAuthToken'),
    },
    '/auth/validate-token': {
      post: createOperation('ValidateAuthToken'),
    },
    '/data': {
      post: createOperation('PostCredential'),
      get: createOperation('GetCredentials'),
      delete: createOperation('DeleteCredentials'),
    },
  },
} as const

@profile()
export default class BloomVaultApiService extends GenericApiService<ExtractOperationIdTypes<typeof bloomVaultSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.vaultUrl, options, bloomVaultSpec)
  }

  async requestAuthToken({ did, storageRegion }: { did: string; storageRegion: string }) {
    return this.execute<{ token: string }>('RequestAuthToken', {
      storageRegion,
      urlPostfix: `?did=${did}`,
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
      urlPostfix: `/${start}/${end}`,
    })
  }

  async getCredentials(params: { accessToken: string; start: number; end: number; storageRegion: string }) {
    const { accessToken, start, end, storageRegion } = params
    return this.execute<BlobType[]>('GetCredentials', {
      authorization: `Bearer ${accessToken}`,
      storageRegion,
      urlPostfix: `/${start}/${end}`,
    })
  }
}
