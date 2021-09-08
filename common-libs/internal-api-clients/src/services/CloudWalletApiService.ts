import { profile } from '@affinidi/tools-common'

import cloudWalletSpec from '../spec/_cloudWallet'
import { createClient, createClientOptions, GetParams } from '../helpers/client'

type ConstructorOptions = { cloudWalletUrl: string; accessApiKey: string }

const client = createClient(cloudWalletSpec)

@profile()
export default class CloudWalletApiService {
  private readonly options

  constructor(options: ConstructorOptions) {
    this.options = createClientOptions(options.cloudWalletUrl, options)
  }

  async login(params: GetParams<typeof client.Login>) {
    return client.Login(this.options, { params })
  }

  async signCredential(params: GetParams<typeof client.SignCredential>, accessToken: string) {
    return client.SignCredential(this.options, { params, authorization: accessToken })
  }

  async storeCredentials(params: GetParams<typeof client.StoreCredentials>, accessToken: string) {
    return client.StoreCredentials(this.options, { params, authorization: accessToken })
  }
}
