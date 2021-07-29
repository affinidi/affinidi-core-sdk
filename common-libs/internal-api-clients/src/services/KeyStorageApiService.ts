import { profile } from '@affinidi/common'

import keyStorageSpec from '../openapi/_keyStorage'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'

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

type GetSignedCredentialRequest = {
  credentialOfferResponseToken: string
  options: GetSignedCredentialOptions
}

type Env = 'dev' | 'staging' | 'prod'

type ConstructorOptions = GenericConstructorOptions & { keyStorageUrl: string }

type ApiType = BuildApiType<ParseSpec<typeof keyStorageSpec>>

@profile()
export default class KeyStorageApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.keyStorageUrl, options, keyStorageSpec)
  }

  async storeTemplate(params: ApiType['StoreTemplate']['requestBody']) {
    return this.execute('StoreTemplate', { params })
  }

  async readMyKey({ accessToken }: { accessToken: string }) {
    return this.execute('ReadMyKey', { authorization: accessToken })
  }

  async storeMyKey(accessToken: string, params: ApiType['StoreMyKey']['requestBody']) {
    return this.execute('StoreMyKey', { authorization: accessToken, params })
  }

  async adminConfirmUser(params: ApiType['AdminConfirmUser']['requestBody']) {
    return this.execute('AdminConfirmUser', { params })
  }

  async adminDeleteUnconfirmedUser(params: ApiType['AdminDeleteUnconfirmedUser']['requestBody']) {
    return this.execute('AdminDeleteUnconfirmedUser', { params })
  }

  async getCredentialOffer({ accessToken, env }: { accessToken: string; env: Env }) {
    return this.execute('GetCredentialOffer', { authorization: accessToken, queryParams: { env } })
  }

  async getSignedCredential(accessToken: string, params: GetSignedCredentialRequest) {
    return this.execute('GetSignedCredential', { authorization: accessToken, params })
  }
}
