import { profile } from '@affinidi/tools-common'

import keyStorageSpec from '../spec/_keyStorage'
import { createServiceFactory, createServiceOptions, GetParams, ServiceOptions } from './GenericApiService'

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

type ConstructorOptions = ServiceOptions & { keyStorageUrl: string }

const service = createServiceFactory(keyStorageSpec).createInstance()

@profile()
export default class KeyStorageApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createServiceOptions(options.keyStorageUrl, options)
  }

  async storeTemplate(params: GetParams<typeof service.StoreTemplate>) {
    return service.StoreTemplate(this.options, { params })
  }

  async readMyKey({ accessToken }: { accessToken: string }) {
    return service.ReadMyKey(this.options, { authorization: accessToken })
  }

  async storeMyKey(accessToken: string, params: GetParams<typeof service.StoreMyKey>) {
    return service.StoreMyKey(this.options, { authorization: accessToken, params })
  }

  async adminConfirmUser(params: GetParams<typeof service.AdminConfirmUser>) {
    return service.AdminConfirmUser(this.options, { params })
  }

  async adminDeleteUnconfirmedUser(params: GetParams<typeof service.AdminDeleteUnconfirmedUser>) {
    return service.AdminDeleteUnconfirmedUser(this.options, { params })
  }

  async getCredentialOffer({ accessToken, env }: { accessToken: string; env: Env }) {
    return service.GetCredentialOffer(this.options, { authorization: accessToken, queryParams: { env } })
  }

  async getSignedCredential(accessToken: string, params: GetSignedCredentialRequest) {
    return service.GetSignedCredential(this.options, { authorization: accessToken, params })
  }
}
