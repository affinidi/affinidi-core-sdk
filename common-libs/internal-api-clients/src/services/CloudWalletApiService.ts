import { profile } from '@affinidi/common'

import cloudWalletSpec from '../openapi/_cloudWallet'
import GenericApiService from './GenericApiService'
import { ExtractRequestType } from './SwaggerTypes'

type ConstructorOptions = { cloudWalletUrl: string; accessApiKey: string }

type ApiSpec = typeof cloudWalletSpec

@profile()
export default class CloudWalletApiService extends GenericApiService<ApiSpec> {
  constructor(options: ConstructorOptions) {
    super(options.cloudWalletUrl, options, cloudWalletSpec)
  }

  async login(params: ExtractRequestType<ApiSpec, 'Login'>) {
    return this.execute('Login', { params })
  }

  async signCredential(params: ExtractRequestType<ApiSpec, 'SignCredential'>) {
    return this.execute('SignCredential', { params })
  }
}
