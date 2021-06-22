import API from './ApiService'

import { RevocationListOutput, RevocationListParamsInput } from '../dto/revocation.dto'

import { profile } from '@affinidi/common'

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
  _api: API

  constructor(options: ConstructorOptions) {
    this._revocationUrl = options.revocationUrl

    const { registryUrl, issuerUrl, verifierUrl } = options
    this._api = new API(registryUrl, issuerUrl, verifierUrl, options)
  }

  async buildRevocationListStatus(
    { credentialId, subjectDid }: RevocationListParamsInput,
    accessToken: string,
  ): Promise<RevocationListOutput> {
    const url = `${this._revocationUrl}/api/v1/revocation/build-revocation-list-2020-status`

    const headers = {
      authorization: accessToken,
    }

    const {
      body: { credentialStatus, revocationListCredential },
    } = await this._api.execute(null, {
      url,
      headers,
      params: { credentialId, subjectDid },
      method: 'POST',
    })

    const isPublisRequired = !!revocationListCredential

    return { credentialStatus, revocationListCredential, isPublisRequired }
  }

  async publishRevocationListCredential(revocationListCredential: any, accessToken: string): Promise<void> {
    const url = `${this._revocationUrl}/api/v1/revocation/publish-revocation-list-credential`

    const headers = {
      authorization: accessToken,
    }

    await this._api.execute(null, {
      url,
      headers,
      params: revocationListCredential,
      method: 'POST',
    })
  }

  async revokeCredential(
    credentialId: string,
    revocationReason: string,
    accessToken: string,
  ): Promise<{ revocationListCredential: any }> {
    const url = `${this._revocationUrl}/api/v1/revocation/revoke-credential`

    const headers = {
      authorization: accessToken,
    }

    const {
      body: { revocationListCredential },
    } = await this._api.execute(null, {
      url,
      headers,
      params: { id: credentialId, revocationReason },
      method: 'POST',
    })

    return { revocationListCredential }
  }
}
