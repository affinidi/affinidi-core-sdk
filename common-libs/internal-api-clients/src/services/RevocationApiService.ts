import { profile } from '@affinidi/tools-common'

import { createClientMethods } from '../helpers/client'
import { createDidAuthSession } from '../helpers/DidAuthManager'
import { createClient, DidAuthConstructorOptions, GetParams, wrapWithDidAuth } from '../helpers/didAuthClientWrapper'
import revocationSpec from '../spec/_revocation'

type ConstructorOptions = DidAuthConstructorOptions & { revocationUrl: string }

type ReplaceFieldsWithAny<T> = {
  [key in keyof T]: any
}

const { CreateDidAuthRequest, ...otherMethods } = createClientMethods(revocationSpec)
const clientMethods = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class RevocationApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    const didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.client = createClient(clientMethods, didAuthSession, options.revocationUrl, options)
  }

  async buildRevocationListStatus(params: GetParams<typeof clientMethods.BuildRevocationListStatus>) {
    return this.client.BuildRevocationListStatus({ params })
  }

  async publishRevocationListCredential(
    params: ReplaceFieldsWithAny<GetParams<typeof clientMethods.PublishRevocationListCredential>>,
  ) {
    return this.client.PublishRevocationListCredential({ params })
  }

  async revokeCredential(params: GetParams<typeof clientMethods.RevokeCredential>) {
    const response = await this.client.RevokeCredential({ params })

    return response as { body: { revocationListCredential: any } }
  }
}
