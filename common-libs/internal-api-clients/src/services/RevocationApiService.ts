import { profile } from '@affinidi/tools-common'

import { createDidAuthSession } from '../helpers/DidAuthManager'
import revocationSpec from '../spec/_revocation'
import { DidAuthConstructorOptions, GetParams, wrapWithDidAuth } from './DidAuthApiService'
import { createServiceFactory, createServiceOptions } from './GenericApiService'

type ConstructorOptions = DidAuthConstructorOptions & { revocationUrl: string }

type ReplaceFieldsWithAny<T> = {
  [key in keyof T]: any
}

const { CreateDidAuthRequest, ...otherMethods } = createServiceFactory(revocationSpec).createInstance()
const service = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class RevocationApiService {
  private readonly didAuthSession
  private readonly options

  constructor(options: ConstructorOptions) {
    this.didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.options = createServiceOptions(options.revocationUrl, options)
  }

  async buildRevocationListStatus(params: GetParams<typeof service.BuildRevocationListStatus>) {
    return service.BuildRevocationListStatus(this.didAuthSession, this.options, { params })
  }

  async publishRevocationListCredential(
    params: ReplaceFieldsWithAny<GetParams<typeof service.PublishRevocationListCredential>>,
  ) {
    return service.PublishRevocationListCredential(this.didAuthSession, this.options, { params })
  }

  async revokeCredential(params: GetParams<typeof service.RevokeCredential>) {
    const response = await service.RevokeCredential(this.didAuthSession, this.options, { params })

    return response as { body: { revocationListCredential: any } }
  }
}
