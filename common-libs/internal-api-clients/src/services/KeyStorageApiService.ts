import { profile } from '@affinidi/tools-common'
import { ClientOptions, createClient, createClientMethods, GetParams } from '@affinidi/tools-openapi'

import keyStorageSpec from '../spec/_keyStorage'

// It calls getSignedCredential of issuer.controller.ts in affinidi-common-backend.
// getSignedCredential there only uses options to create a new instance of its own CommonNetworkMember,
// and then it only calls networkMember.verifyCredentialOfferResponseToken and networkMember.signCredentials
type GetSignedCredentialOptions = {
  // For remote IssuerApiService (used by networkMember.verifyCredentialOfferResponseToken)
  env?: Env
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

type DoesUserExistInput = {
  field: 'username' | 'email' | 'phone_number'
  value: string
}

const clientMethods = createClientMethods(keyStorageSpec)

@profile()
export default class KeyStorageApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    this.client = createClient(clientMethods, options.keyStorageUrl, options)
  }

  async storeTemplate(params: GetParams<typeof clientMethods.StoreTemplate>) {
    return this.client.StoreTemplate({ params })
  }

  async readMyKey({ accessToken }: { accessToken: string }) {
    return this.client.ReadMyKey({ authorization: accessToken })
  }

  async storeMyKey(accessToken: string, params: GetParams<typeof clientMethods.StoreMyKey>) {
    return this.client.StoreMyKey({ authorization: accessToken, params })
  }

  async adminConfirmUser(params: GetParams<typeof clientMethods.AdminConfirmUser>) {
    return this.client.AdminConfirmUser({ params })
  }

  async adminDeleteUnconfirmedUser(params: GetParams<typeof clientMethods.AdminDeleteUnconfirmedUser>) {
    return this.client.AdminDeleteUnconfirmedUser({ params })
  }

  async adminDeleteIncompleteUser({ accessToken }: { accessToken: string }) {
    return this.client.AdminDeleteIncompleteUser({ authorization: accessToken })
  }

  async adminLogOutUser({ accessToken }: { accessToken: string }) {
    return this.client.AdminLogOutUser({ authorization: accessToken })
  }

  async doesUserExist({ field, value }: DoesUserExistInput): Promise<{ isUnconfirmed: boolean; userExists: boolean }> {
    const result = await this.client.DoesUserExist({ queryParams: { field, value } })
    return result.body
  }

  async getCredentialOffer({ accessToken, env }: { accessToken: string; env: Env }) {
    return this.client.GetCredentialOffer({ authorization: accessToken, queryParams: { env } })
  }

  async getSignedCredential(accessToken: string, params: GetSignedCredentialRequest) {
    return this.client.GetSignedCredential({ authorization: accessToken, params })
  }
}
