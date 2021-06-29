import { profile } from '@affinidi/common'

import verifierSpec from '../openapi/_verifier'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

type ConstructorOptions = { verifierUrl: string; accessApiKey: string }

type ApiSpec = typeof verifierSpec

@profile()
export default class VerifierApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.verifierUrl, options, verifierSpec)
  }

  async buildCredentialRequest(params: ExtractRequestType<ApiSpec, 'BuildCredentialRequest'>) {
    return this.execute('BuildCredentialRequest', { params })
  }
}
