import { profile } from '@affinidi/common'

import revocationSpec from '../spec/_revocation'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import DidAuthApiService, { DidAuthConstructorOptions } from './DidAuthApiService'

type ConstructorOptions = DidAuthConstructorOptions & { revocationUrl: string }

type ApiType = BuildApiType<ParseSpec<typeof revocationSpec>>

type ReplaceFieldsWithAny<T> = {
  [key in keyof T]: any
}

@profile()
export default class RevocationApiService extends DidAuthApiService<ApiType, 'CreateDidAuthRequest'> {
  constructor(options: ConstructorOptions) {
    super(options.revocationUrl, 'CreateDidAuthRequest', options, revocationSpec)
  }

  async buildRevocationListStatus(params: ApiType['BuildRevocationListStatus']['requestBody']) {
    return this.executeWithDidAuth('BuildRevocationListStatus', { params })
  }

  async publishRevocationListCredential(
    params: ReplaceFieldsWithAny<ApiType['PublishRevocationListCredential']['requestBody']>,
  ) {
    return this.executeWithDidAuth('PublishRevocationListCredential', { params })
  }

  async revokeCredential(params: ApiType['RevokeCredential']['requestBody']) {
    const response = await this.executeWithDidAuth('RevokeCredential', { params })

    return response as { body: { revocationListCredential: any } }
  }
}
