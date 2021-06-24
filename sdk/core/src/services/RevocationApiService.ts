import { profile } from '@affinidi/common'
import { CredentialStatus } from '../dto/revocation.dto'

import revocationSpec from '../openapi/_revocation'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { revocationUrl: string; accessApiKey: string }

@profile()
export default class RevocationApiService extends GenericApiService<ExtractOperationIdTypes<typeof revocationSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.revocationUrl, options, revocationSpec)
  }

  async buildRevocationListStatus(params: { accessToken: string; credentialId: string; subjectDid: string }) {
    const { accessToken, credentialId, subjectDid } = params
    return this.execute<{
      credentialStatus: CredentialStatus
      revocationListCredential: any
    }>('BuildRevocationListStatus', {
      authorization: accessToken,
      params: { credentialId, subjectDid },
    })
  }

  async publishRevocationListCredential(params: { accessToken: string; revocationSignedListCredential: any }) {
    const { accessToken, revocationSignedListCredential } = params
    return this.execute('PublishRevocationListCredential', {
      authorization: accessToken,
      params: revocationSignedListCredential,
    })
  }

  async revokeCredential(params: { accessToken: string; id: string; revocationReason: string }) {
    const { accessToken, id, revocationReason } = params
    return this.execute<{ revocationListCredential: any }>('RevokeCredential', {
      authorization: accessToken,
      params: { id, revocationReason },
    })
  }
}
