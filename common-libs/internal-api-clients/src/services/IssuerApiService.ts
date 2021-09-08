import { profile } from '@affinidi/tools-common'

import issuerSpec from '../spec/_issuer'
import { createServiceFactory, createServiceOptions, GetParams, ServiceOptions } from './GenericApiService'

type ConstructorOptions = ServiceOptions & { issuerUrl: string }

const service = createServiceFactory(issuerSpec).createInstance()

@profile()
export default class IssuerApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createServiceOptions(options.issuerUrl, options)
  }

  async buildCredentialOffer(params: GetParams<typeof service.BuildCredentialOffer>) {
    return service.BuildCredentialOffer(this.options, { params })
  }

  async verifyCredentialOfferResponse(params: GetParams<typeof service.VerifyCredentialOfferResponse>) {
    return service.VerifyCredentialOfferResponse(this.options, { params })
  }

  async buildUnsignedCredentials(params: GetParams<typeof service.BuildUnsigned>) {
    return service.BuildUnsigned(this.options, { params })
  }
}
