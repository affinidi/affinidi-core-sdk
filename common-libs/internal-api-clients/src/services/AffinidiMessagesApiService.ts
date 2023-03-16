import { profile } from '@affinidi/tools-common'
import {
  createClientMethods,
  createDidAuthClient,
  createDidAuthSession,
  DidAuthConstructorOptions,
  GetDidAuthParams,
  wrapWithDidAuth,
} from '@affinidi/tools-openapi'

import affinidiMessagesSpec from '../spec/_affinidiMessages'

type ConstructorOptions = DidAuthConstructorOptions & { affinidiMessagesUrl: string }

const { CreateDidAuthRequest, ...otherMethods } = createClientMethods(affinidiMessagesSpec) as Record<string, any>
const clientMethods = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class AffinidiMessagesApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    const didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.client = createDidAuthClient(clientMethods, didAuthSession, options.affinidiMessagesUrl, options)
  }

  async sendMessage(params: GetDidAuthParams<typeof clientMethods.SendMessage>) {
    return this.client.SendMessage({ params })
  }

  async pullMyMessages() {
    return this.client.PullMyMessages({})
  }

  async deleteMyMessage(id: string) {
    return this.client.DeleteMyMessage({ pathParams: { id } })
  }
}
