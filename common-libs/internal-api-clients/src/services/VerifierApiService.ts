import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClient, createClientOptions, GetParams } from '../helpers/client'
import verifierSpec from '../spec/_verifier'

type ConstructorOptions = ClientOptions & { verifierUrl: string }

const client = createClient(verifierSpec)

@profile()
export default class VerifierApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createClientOptions(options.verifierUrl, options)
  }

  async buildCredentialRequest(params: GetParams<typeof client.BuildCredentialRequest>) {
    return client.BuildCredentialRequest(this.options, { params })
  }

  async verifyCredentials(params: GetParams<typeof client.VerifyCredentials>) {
    return client.VerifyCredentials(this.options, { params })
  }

  async verifyPresentation(params: GetParams<typeof client.VerifyPresentation>) {
    return client.VerifyPresentation(this.options, { params })
  }

  async verifyCredentialShareResponse(params: GetParams<typeof client.VerifyCredentialShareResponse>) {
    return client.VerifyCredentialShareResponse(this.options, { params })
  }
}
