import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClient, createClientMethods, GetParams } from '../helpers/client'
import issuerSpec from '../spec/_issuer'

type ConstructorOptions = ClientOptions & { issuerUrl: string }

const clientMethods = createClientMethods(issuerSpec)

@profile()
export default class IssuerApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    this.client = createClient(clientMethods, options.issuerUrl, options)
  }

  async buildCredentialOffer(params: GetParams<typeof clientMethods.BuildCredentialOffer>) {
    return this.client.BuildCredentialOffer({ params })
  }

  async verifyCredentialOfferResponse(params: GetParams<typeof clientMethods.VerifyCredentialOfferResponse>) {
    return this.client.VerifyCredentialOfferResponse({ params })
  }

  async buildUnsignedCredentials(params: GetParams<typeof clientMethods.BuildUnsigned>) {
    return this.client.BuildUnsigned({ params })
  }
}
