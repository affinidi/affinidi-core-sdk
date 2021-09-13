import { profile } from '@affinidi/tools-common'

import { ClientOptions, createClient, createClientMethods, GetParams } from '../helpers/client'
import verifierSpec from '../spec/_verifier'

type ConstructorOptions = ClientOptions & { verifierUrl: string }

const clientMethods = createClientMethods(verifierSpec)

@profile()
export default class VerifierApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    this.client = createClient(clientMethods, options.verifierUrl, options)
  }

  async buildCredentialRequest(params: GetParams<typeof clientMethods.BuildCredentialRequest>) {
    return this.client.BuildCredentialRequest({ params })
  }

  async verifyCredentials(params: GetParams<typeof clientMethods.VerifyCredentials>) {
    return this.client.VerifyCredentials({ params })
  }

  async verifyPresentation(params: GetParams<typeof clientMethods.VerifyPresentation>) {
    return this.client.VerifyPresentation({ params })
  }

  async verifyCredentialShareResponse(params: GetParams<typeof clientMethods.VerifyCredentialShareResponse>) {
    return this.client.VerifyCredentialShareResponse({ params })
  }
}
