import { profile } from '@affinidi/common'

import issuerSpec from '../openapi/_issuer'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

type ConstructorOptions = { issuerUrl: string; accessApiKey: string }

type ApiSpec = typeof issuerSpec

@profile()
export default class IssuerApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.issuerUrl, options, issuerSpec)
  }

  async buildCredentialOffer(params: ExtractRequestType<ApiSpec, 'BuildCredentialOffer'>) {
    return this.execute('BuildCredentialOffer', { params })
  }

  async verifyCredentialOfferResponse(params: ExtractRequestType<ApiSpec, 'VerifyCredentialOfferResponse'>) {
    return this.execute('VerifyCredentialOfferResponse', { params })
  }

  async buildUnsignedCredentials(params: ExtractRequestType<ApiSpec, 'BuildUnsigned'>) {
    return this.execute('BuildUnsigned', { params })
  }
}
