import { profile } from '@affinidi/common'

import revocationSpec from '../openapi/_revocation'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

type ConstructorOptions = { revocationUrl: string; accessApiKey: string }

type ApiSpec = typeof revocationSpec

type ReplaceFieldsWithAny<T> = {
  [key in keyof T]: any
}

@profile()
export default class RevocationApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.revocationUrl, options, revocationSpec)
  }

  async buildRevocationListStatus(
    accessToken: string,
    params: ExtractRequestType<ApiSpec, 'BuildRevocationListStatus'>,
  ) {
    return this.execute('BuildRevocationListStatus', { authorization: accessToken, params })
  }

  async publishRevocationListCredential(
    accessToken: string,
    params: ReplaceFieldsWithAny<ExtractRequestType<ApiSpec, 'PublishRevocationListCredential'>>,
  ) {
    return this.execute('PublishRevocationListCredential', { authorization: accessToken, params })
  }

  async revokeCredential(accessToken: string, params: ExtractRequestType<ApiSpec, 'RevokeCredential'>) {
    const response = await this.execute('RevokeCredential', { authorization: accessToken, params })

    return response as { body: { revocationListCredential: any } }
  }
}
