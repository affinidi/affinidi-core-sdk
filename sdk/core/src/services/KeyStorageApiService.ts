import { profile } from '@affinidi/common'

import { Env } from '../dto/shared.dto'
import keyStorageSpec from '../openapi/_keyStorage'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

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

type ConstructorOptions = { keyStorageUrl: string; accessApiKey: string }

type ApiSpec = typeof keyStorageSpec

@profile()
export default class KeyStorageApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.keyStorageUrl, options, keyStorageSpec)
  }

  async storeTemplate(params: ExtractRequestType<ApiSpec, 'StoreTemplate'>) {
    return this.execute('StoreTemplate', { params })
  }

  async readMyKey({ accessToken }: { accessToken: string }) {
    return this.execute('ReadMyKey', { authorization: accessToken })
  }

  async storeMyKey(accessToken: string, params: ExtractRequestType<ApiSpec, 'StoreMyKey'>) {
    return this.execute('StoreMyKey', { authorization: accessToken, params })
  }

  async adminConfirmUser(params: ExtractRequestType<ApiSpec, 'AdminConfirmUser'>) {
    return this.execute('AdminConfirmUser', { params })
  }

  async adminDeleteUnconfirmedUser(params: ExtractRequestType<ApiSpec, 'AdminDeleteUnconfirmedUser'>) {
    return this.execute('AdminDeleteUnconfirmedUser', { params })
  }

  async getCredentialOffer({ accessToken, env }: { accessToken: string; env: Env }) {
    return this.execute('GetCredentialOffer', { authorization: accessToken, urlPostfix: `?env=${env}` })
  }

  async getSignedCredential(accessToken: string, params: GetSignedCredentialRequest) {
    return this.execute('GetSignedCredential', { authorization: accessToken, params })
  }
}
