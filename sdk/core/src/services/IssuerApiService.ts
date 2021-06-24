import { profile } from '@affinidi/common'
import { OfferedCredential } from '../dto/shared.dto'

import issuerSpec from '../openapi/_issuer'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { issuerUrl: string; accessApiKey: string }

@profile()
export default class IssuerApiService extends GenericApiService<ExtractOperationIdTypes<typeof issuerSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.issuerUrl, options, issuerSpec)
  }

  async buildCredentialOffer(params: {
    offeredCredentials: OfferedCredential[]
    audienceDid?: string
    expiresAt?: string
    nonce?: string
    callbackUrl?: string
  }) {
    return this.execute<{ credentialOffer: any }>('BuildCredentialOffer', { params })
  }

  async verifyCredentialOfferResponse(params: {
    credentialOfferResponseToken: string
    credentialOfferRequestToken: string
  }) {
    return this.execute<{
      isValid: boolean
      issuer: string
      jti: string
      selectedCredentials: OfferedCredential[]
      errors: string[]
    }>('VerifyCredentialOfferResponse', { params })
  }
}
