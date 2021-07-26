import { profile } from '@affinidi/common'

import issuerSpec from '../openapi/_issuer'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService from './GenericApiService'

type ConstructorOptions = { issuerUrl: string; accessApiKey: string, headers?: object }

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
}
