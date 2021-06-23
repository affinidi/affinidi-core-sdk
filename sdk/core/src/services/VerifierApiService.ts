import { profile } from '@affinidi/common'

import { CredentialRequirement } from '../dto/shared.dto'
import verifierSpec from '../_verifier'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { verifierUrl: string; accessApiKey: string }

@profile()
export default class VerifierApiService extends GenericApiService<ExtractOperationIdTypes<typeof verifierSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.verifierUrl, options, verifierSpec)
  }

  async buildCredentialRequest(params: {
    credentialRequirements: CredentialRequirement[]
    issuerDid: string
    audienceDid?: string
    expiresAt?: string
    nonce?: string
    callbackUrl?: string
  }) {
    return this.execute<{ credentialShareRequest: any }>('BuildCredentialRequest', { params })
  }
}
