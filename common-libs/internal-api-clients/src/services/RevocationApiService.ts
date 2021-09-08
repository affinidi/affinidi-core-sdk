import { profile } from '@affinidi/tools-common'

import { createClient, createClientOptions } from '../helpers/client'
import { createDidAuthSession } from '../helpers/DidAuthManager'
import { DidAuthConstructorOptions, GetParams, wrapWithDidAuth } from '../helpers/didAuthClientWrapper'
import revocationSpec from '../spec/_revocation'

type ConstructorOptions = DidAuthConstructorOptions & { revocationUrl: string }

type ReplaceFieldsWithAny<T> = {
  [key in keyof T]: any
}

const { CreateDidAuthRequest, ...otherMethods } = createClient(revocationSpec)
const client = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class RevocationApiService {
  private readonly didAuthSession
  private readonly options

  constructor(options: ConstructorOptions) {
    this.didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.options = createClientOptions(options.revocationUrl, options)
  }

  async buildRevocationListStatus(params: GetParams<typeof client.BuildRevocationListStatus>) {
    return client.BuildRevocationListStatus(this.didAuthSession, this.options, { params })
  }

  async publishRevocationListCredential(
    params: ReplaceFieldsWithAny<GetParams<typeof client.PublishRevocationListCredential>>,
  ) {
    return client.PublishRevocationListCredential(this.didAuthSession, this.options, { params })
  }

  async revokeCredential(params: GetParams<typeof client.RevokeCredential>) {
    const response = await client.RevokeCredential(this.didAuthSession, this.options, { params })

    return response as { body: { revocationListCredential: any } }
  }
}
