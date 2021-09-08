import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClient, createClientOptions, GetParams } from '../helpers/client'
import keyStorageSpec from '../spec/_keyStorage'

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

type ConstructorOptions = ClientOptions & { keyStorageUrl: string }

const client = createClient(keyStorageSpec)

@profile()
export default class KeyStorageApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createClientOptions(options.keyStorageUrl, options)
  }

  async storeTemplate(params: GetParams<typeof client.StoreTemplate>) {
    return client.StoreTemplate(this.options, { params })
  }

  async readMyKey({ accessToken }: { accessToken: string }) {
    return client.ReadMyKey(this.options, { authorization: accessToken })
  }

  async storeMyKey(accessToken: string, params: GetParams<typeof client.StoreMyKey>) {
    return client.StoreMyKey(this.options, { authorization: accessToken, params })
  }

  async adminConfirmUser(params: GetParams<typeof client.AdminConfirmUser>) {
    return client.AdminConfirmUser(this.options, { params })
  }

  async adminDeleteUnconfirmedUser(params: GetParams<typeof client.AdminDeleteUnconfirmedUser>) {
    return client.AdminDeleteUnconfirmedUser(this.options, { params })
  }

  async getCredentialOffer({ accessToken, env }: { accessToken: string; env: Env }) {
    return client.GetCredentialOffer(this.options, { authorization: accessToken, queryParams: { env } })
  }

  async getSignedCredential(accessToken: string, params: GetSignedCredentialRequest) {
    return client.GetSignedCredential(this.options, { authorization: accessToken, params })
  }
}
