import { profile } from '@affinidi/common'

import { Env, SignedCredential } from '../dto/shared.dto'
import keyStorageSpec from '../openapi/_keyStorage'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

// It calls getSignedCredential of issuer.controller.ts in affinidi-common-backend.
// getSignedCredential there only uses options to create a new instance of its own CommonNetworkMember,
// and then it only calls networkMember.verifyCredentialOfferResponseToken and networkMember.signCredentials
type GetSignedCredentialOptions = {
  // For remote IssuerApiService (used by networkMember.verifyCredentialOfferResponseToken)
  issuerUrl?: string
  accessApiKey?: string
  apiKey?: string
  // Remote networkMember.signCredentials calls Affinity.signCredential.
  // It only uses metrics service which only needs metricsUrl and component,
  // but we removed metricsUrl from options in the original version of this code,
  // and component is always passed separately.
  // Affinity.signCredential also gets passed encryptedSeed and encryptionKey,
  // but CommonNetworkMember in affinidi-common-backend is already initialized with
  // KEYSTONE_VC_ISSUER_ENCRYPTED_SEED and KEYSTONE_VC_ISSUER_PASSWORD (used as encryptionKey),
  // so no further fields are needed.
}

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
    return this.execute<{ encryptedSeed: string }>('ReadMyKey', { authorization: accessToken })
  }

  async storeMyKey({ accessToken, encryptedSeed }: { accessToken: string; encryptedSeed: string }) {
    return this.execute('StoreMyKey', {
      authorization: accessToken,
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
      authorization: accessToken,
      urlPostfix: `?env=${env}`,
    })
  }

  async getSignedCredential(params: {
    credentialOfferResponseToken: string
    accessToken: string
    options: GetSignedCredentialOptions
  }) {
    const { credentialOfferResponseToken, accessToken, options } = params
    return this.execute<{ signedCredentials: SignedCredential[] }>('GetSignedCredential', {
      authorization: accessToken,
      params: { credentialOfferResponseToken, options },
    })
  }
}
