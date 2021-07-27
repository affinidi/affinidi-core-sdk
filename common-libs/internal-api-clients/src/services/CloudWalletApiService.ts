import { profile } from '@affinidi/common'

import cloudWalletSpec from '../openapi/_cloudWallet'
import GenericApiService from './GenericApiService'
import { ParseSpec } from '../types/openapiParser'
import { BuildApiType } from '../types/typeBuilder'

type ConstructorOptions = { cloudWalletUrl: string; accessApiKey: string }

type ApiType = BuildApiType<ParseSpec<typeof cloudWalletSpec>>

@profile()
export default class CloudWalletApiService extends GenericApiService<ApiType> {
  constructor(options: ConstructorOptions) {
    super(options.cloudWalletUrl, options, cloudWalletSpec)
  }

  async login(params: ApiType['Login']['requestBody']) {
    return this.execute('Login', { params })
  }

  async signCredential(params: ApiType['SignCredential']['requestBody'], accessToken: string) {
    return this.execute('SignCredential', { params, authorization: accessToken })
  }
}
