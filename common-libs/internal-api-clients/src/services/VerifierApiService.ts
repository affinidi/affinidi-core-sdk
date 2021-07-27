import { profile } from '@affinidi/common'

import verifierSpec from '../openapi/_verifier'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService from './GenericApiService'

type ConstructorOptions = { verifierUrl: string; accessApiKey: string }

type ApiType = BuildApiType<ParseSpec<typeof verifierSpec>>

@profile()
export default class VerifierApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.verifierUrl, options, verifierSpec)
  }

  async buildCredentialRequest(params: ApiType['BuildCredentialRequest']['requestBody']) {
    return this.execute('BuildCredentialRequest', { params })
  }

  async verifyCredentials(params: ApiType['VerifyCredentials']['requestBody']) {
    return this.execute('VerifyCredentials', { params })
  }

  async verifyPresentation(params: ApiType['VerifyPresentation']['requestBody']) {
    return this.execute('VerifyPresentation', { params })
  }

  async verifyCredentialShareResponse(params: ApiType['VerifyCredentialShareResponse']['requestBody']) {
    return this.execute('VerifyCredentialShareResponse', { params })
  }
}
