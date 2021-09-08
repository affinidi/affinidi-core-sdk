import { profile } from '@affinidi/tools-common'

import verifierSpec from '../spec/_verifier'
import { createServiceFactory, createServiceOptions, GetParams, ServiceOptions } from './GenericApiService'

type ConstructorOptions = ServiceOptions & { verifierUrl: string }

const service = createServiceFactory(verifierSpec).createInstance()

@profile()
export default class VerifierApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createServiceOptions(options.verifierUrl, options)
  }

  async buildCredentialRequest(params: GetParams<typeof service.BuildCredentialRequest>) {
    return service.BuildCredentialRequest(this.options, { params })
  }

  async verifyCredentials(params: GetParams<typeof service.VerifyCredentials>) {
    return service.VerifyCredentials(this.options, { params })
  }

  async verifyPresentation(params: GetParams<typeof service.VerifyPresentation>) {
    return service.VerifyPresentation(this.options, { params })
  }

  async verifyCredentialShareResponse(params: GetParams<typeof service.VerifyCredentialShareResponse>) {
    return service.VerifyCredentialShareResponse(this.options, { params })
  }
}
