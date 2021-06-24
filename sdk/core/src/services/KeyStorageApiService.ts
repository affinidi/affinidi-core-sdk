import { profile } from '@affinidi/common'

import { Env, SignedCredential } from '../dto/shared.dto'
import keyStorageSpec from '../openapi/_keyStorage'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { keyStorageUrl: string; accessApiKey: string }

@profile()
export default class KeyStorageApiService extends GenericApiService<ExtractOperationIdTypes<typeof keyStorageSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.keyStorageUrl, options, keyStorageSpec)
  }

  async storeTemplate(params: { username: string; template: string; subject?: string; htmlTemplate?: string }) {
    return this.execute('StoreTemplate', { params })
  }

  async readMyKey({ accessToken }: { accessToken: string }) {
    return this.execute<{ encryptedSeed: string }>('ReadMyKey', {
      headers: { authorization: accessToken },
    })
  }

  async storeMyKey({ accessToken, encryptedSeed }: { accessToken: string; encryptedSeed: string }) {
    return this.execute('StoreMyKey', {
      headers: { authorization: accessToken },
      params: { encryptedSeed },
    })
  }

  async adminConfirmUser(params: { username: string }) {
    return this.execute('AdminConfirmUser', { params })
  }

  async adminDeleteUnconfirmedUser(params: { username: string }) {
    return this.execute('AdminDeleteUnconfirmedUser', { params })
  }

  async getCredentialOffer({ accessToken, env }: { accessToken: string; env: Env }) {
    return this.execute<{ offerToken: string }>('GetCredentialOffer', {
      headers: { authorization: accessToken },
      urlPostfix: `?env=${env}`,
    })
  }

  async getSignedCredential(params: { credentialOfferResponseToken: string; accessToken: string; options: any }) {
    const { credentialOfferResponseToken, accessToken, options } = params
    return this.execute<{ signedCredentials: SignedCredential[] }>('GetSignedCredential', {
      headers: { authorization: accessToken },
      params: { credentialOfferResponseToken, options },
    })
  }
}
