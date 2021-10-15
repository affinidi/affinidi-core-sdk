import { Affinidi } from '@affinidi/common'
import { buildResponseJwtObject } from '../shared/builder'

let fetch: any

if (!fetch) {
  fetch = require('node-fetch')
}

export default class AffinidiDidAuthCloudService {
  async createDidAuthResponseTokenThroughCloudWallet(
    didAuthRequestToken: string,
    apiKey: string,
    cloudWalletAccessToken: string,
    environment: string,
  ): Promise<string> {
    const jwtObject = await buildResponseJwtObject(didAuthRequestToken)
    const cloudWalletSignJwt = `https://cloud-wallet-api.${environment}.affinity-project.org/api/v1/utilities/sign-jwt`
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
      Authorization: cloudWalletAccessToken,
    }
    const options = {
      headers,
      method: 'POST',
      body: JSON.stringify({ jwtObject }),
    }
    const response = await fetch(cloudWalletSignJwt, options)
    const jwtSigned = await response.json()

    return Affinidi.encodeObjectToJWT(jwtSigned.jwtObject)
  }
}
