import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClient, createClientOptions, GetParams } from '../helpers/client'
import issuerSpec from '../spec/_issuer'

type ConstructorOptions = ClientOptions & { issuerUrl: string }

const client = createClient(issuerSpec)

@profile()
export default class IssuerApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createClientOptions(options.issuerUrl, options)
  }

  async buildCredentialOffer(params: GetParams<typeof client.BuildCredentialOffer>) {
    return client.BuildCredentialOffer(this.options, { params })
  }

  async verifyCredentialOfferResponse(params: GetParams<typeof client.VerifyCredentialOfferResponse>) {
    return client.VerifyCredentialOfferResponse(this.options, { params })
  }

  async buildUnsignedCredentials(params: GetParams<typeof client.BuildUnsigned>) {
    return client.BuildUnsigned(this.options, { params })
  }
}
