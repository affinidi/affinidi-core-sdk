import { RevocationListOutput, RevocationListParamsInput } from '../dto/revocation.dto'

import { profile } from '@affinidi/common'
import GenericApiService from './GenericApiService'

type ConstructorOptions = {
  revocationUrl: string
  registryUrl: string
  issuerUrl: string
  verifierUrl: string
  accessApiKey: string
}

@profile()
export default class RevocationService {
  _revocationUrl: string
  _accessApiKey: string

  constructor(options: ConstructorOptions) {
    this._revocationUrl = options.revocationUrl
    this._accessApiKey = options.accessApiKey
  }

  async buildRevocationListStatus(
    { credentialId, subjectDid }: RevocationListParamsInput,
    accessToken: string,
  ): Promise<RevocationListOutput> {
    const headers = {
      authorization: accessToken,
    }

    const {
      body: { credentialStatus, revocationListCredential },
    } = await GenericApiService.executeByOptions(
      this._accessApiKey,
      `${this._revocationUrl}/api/v1/revocation/build-revocation-list-2020-status`,
      { headers, params: { credentialId, subjectDid }, method: 'POST' },
    )

    const isPublisRequired = !!revocationListCredential

    return { credentialStatus, revocationListCredential, isPublisRequired }
  }

  async publishRevocationListCredential(revocationListCredential: any, accessToken: string): Promise<void> {
    const headers = {
      authorization: accessToken,
    }

    await GenericApiService.executeByOptions(
      this._accessApiKey,
      `${this._revocationUrl}/api/v1/revocation/publish-revocation-list-credential`,
      { headers, params: revocationListCredential, method: 'POST' },
    )
  }

  async revokeCredential(
    credentialId: string,
    revocationReason: string,
    accessToken: string,
  ): Promise<{ revocationListCredential: any }> {
    const headers = {
      authorization: accessToken,
    }

    const {
      body: { revocationListCredential },
    } = await GenericApiService.executeByOptions(
      this._accessApiKey,
      `${this._revocationUrl}/api/v1/revocation/revoke-credential`,
      { headers, params: { id: credentialId, revocationReason }, method: 'POST' },
    )

    return { revocationListCredential }
  }
}
