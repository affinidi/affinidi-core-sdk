import { Affinidi } from '@affinidi/common'
import { CloudWalletApiService } from '@affinidi/internal-api-clients'
import { buildResponseJwtObject } from '../shared/builder'

export default class DidAuthCloudService {
  constructor(private readonly _cloudWallet: CloudWalletApiService, private readonly _cloudWalletAccessToken: string) {}

  async createDidAuthResponseToken(didAuthRequestToken: string): Promise<string> {
    const jwtObject = await buildResponseJwtObject(didAuthRequestToken)
    const response = await this._cloudWallet.signJwt(jwtObject, this._cloudWalletAccessToken)
    return Affinidi.encodeObjectToJWT(response.body.jwtObject)
  }
}
