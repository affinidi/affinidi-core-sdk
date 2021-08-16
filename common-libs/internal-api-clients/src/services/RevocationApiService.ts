import { profile } from '@affinidi/common'

import revocationSpec from '../spec/_revocation'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'

type ConstructorOptions = GenericConstructorOptions & { revocationUrl: string }

type ApiType = BuildApiType<ParseSpec<typeof revocationSpec>>

type ReplaceFieldsWithAny<T> = {
  [key in keyof T]: any
}

@profile()
export default class RevocationApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.revocationUrl, options, revocationSpec)
  }

  async buildRevocationListStatus(accessToken: string, params: ApiType['BuildRevocationListStatus']['requestBody']) {
    return this.execute('BuildRevocationListStatus', { authorization: accessToken, params })
  }

  async publishRevocationListCredential(
    accessToken: string,
    params: ReplaceFieldsWithAny<ApiType['PublishRevocationListCredential']['requestBody']>,
  ) {
    return this.execute('PublishRevocationListCredential', { authorization: accessToken, params })
  }

  async revokeCredential(accessToken: string, params: ApiType['RevokeCredential']['requestBody']) {
    const response = await this.execute('RevokeCredential', { authorization: accessToken, params })

    return response as { body: { revocationListCredential: any } }
  }
}
