import { profile } from '@affinidi/tools-common'

import cloudWalletSpec from '../spec/_cloudWallet'
import { createClient, createClientMethods, GetParams } from '../helpers/client'

type ConstructorOptions = { cloudWalletUrl: string; accessApiKey: string }

const clientMethods = createClientMethods(cloudWalletSpec)

@profile()
export default class CloudWalletApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    this.client = createClient(clientMethods, options.cloudWalletUrl, options)
  }

  async login(params: GetParams<typeof clientMethods.Login>) {
    return this.client.Login({ params })
  }

  async signCredential(params: GetParams<typeof clientMethods.SignCredential>, accessToken: string) {
    return this.client.SignCredential({ params, authorization: accessToken })
  }

  async storeCredentials(params: GetParams<typeof clientMethods.StoreCredentials>, accessToken: string) {
    return this.client.StoreCredentials({ params, authorization: accessToken })
  }

  async signJwt(jwtObject: GetParams<typeof clientMethods.SignJwt>['jwtObject'], accessToken: string) {
    return this.client.SignJwt({ params: { jwtObject }, authorization: accessToken })
  }
}
