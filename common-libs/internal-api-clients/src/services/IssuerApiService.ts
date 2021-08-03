import { profile } from '@affinidi/common'

import issuerSpec from '../spec/_issuer'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'

type ConstructorOptions = GenericConstructorOptions & { issuerUrl: string }

type ApiType = BuildApiType<ParseSpec<typeof issuerSpec>>

@profile()
export default class IssuerApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.issuerUrl, options, issuerSpec)
  }

  async buildCredentialOffer(params: ApiType['BuildCredentialOffer']['requestBody']) {
    return this.execute('BuildCredentialOffer', { params })
  }

  async verifyCredentialOfferResponse(params: ApiType['VerifyCredentialOfferResponse']['requestBody']) {
    return this.execute('VerifyCredentialOfferResponse', { params })
  }

  async buildUnsignedCredentials(params: ApiType['BuildUnsigned']['requestBody']) {
    return this.execute('BuildUnsigned', { params })
  }
}
