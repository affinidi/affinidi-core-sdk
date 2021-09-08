import { profile } from '@affinidi/tools-common'

import cloudWalletSpec from '../spec/_cloudWallet'
import { createServiceFactory, createServiceOptions, GetParams } from './GenericApiService'

type ConstructorOptions = { cloudWalletUrl: string; accessApiKey: string }

const service = createServiceFactory(cloudWalletSpec).createInstance()

@profile()
export default class CloudWalletApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createServiceOptions(options.cloudWalletUrl, options)
  }

  async login(params: GetParams<typeof service.Login>) {
    return service.Login(this.options, { params })
  }

  async signCredential(params: GetParams<typeof service.SignCredential>, accessToken: string) {
    return service.SignCredential(this.options, { params, authorization: accessToken })
  }

  async storeCredentials(params: GetParams<typeof service.StoreCredentials>, accessToken: string) {
    return service.StoreCredentials(this.options, { params, authorization: accessToken })
  }
}
