import { Affinidi } from '@affinidi/common'
import { buildResponseJwtObject } from '../shared/builder'
import { DEFAULT_MAX_TOKEN_VALID_IN_MS } from '../shared/constants'
import Signer from '../shared/Signer'
import { CreateResponseTokenOptions } from '../shared/types'
import { DidAuthRequestToken } from './DidAuthRequestToken'

export default class DidAuthClientService {
  private readonly _signer: Signer

  /**
   * Construct a DidAuthService based on the given options
   *
   * @param options auth service options
   */
  constructor(signer: Signer) {
    this._signer = signer
  }

  async createDidAuthResponseToken(
    didAuthRequestTokenStr: string,
    options?: CreateResponseTokenOptions,
  ): Promise<string> {
    const didAuthRequestToken = DidAuthRequestToken.fromString(didAuthRequestTokenStr)
    const maxTokenValidityPeriod = options?.maxTokenValidInMs ?? DEFAULT_MAX_TOKEN_VALID_IN_MS

    // the token expiration date here is checked with the client clock
    // this means if client clock diverges from the server clock;
    //   - if the client clock is ahead of the server; client may allow tokens that are valid for more than 'maxTokenValidityPeriod'
    //   - if the client clock is behind the server; client may not sign tokens that are valid for less then 'maxTokenValidityPeriod'
    if (!didAuthRequestToken.exp || didAuthRequestToken.exp > Date.now() + maxTokenValidityPeriod) {
      throw new Error(
        `request token can not be valid more than max token validity period of ${maxTokenValidityPeriod}ms`,
      )
    }

    const jwtObject = await buildResponseJwtObject(didAuthRequestTokenStr)

    await this._signer.fillSignature(jwtObject)

    return Affinidi.encodeObjectToJWT(jwtObject)
  }
}
