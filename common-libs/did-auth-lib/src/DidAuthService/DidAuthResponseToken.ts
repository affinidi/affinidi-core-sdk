import { DidAuthRequestToken } from './DidAuthRequestToken'
import { JwtService } from '@affinidi/common'

// partially parsed did auth response token
export class DidAuthResponseToken {
  private constructor(private readonly _str: string, private readonly _requestToken: DidAuthRequestToken) {}

  get requestToken(): DidAuthRequestToken {
    return this._requestToken
  }

  toString(): string {
    return this._str
  }

  static fromString(str: string): DidAuthResponseToken {
    let tokenDecoded: any

    try {
      tokenDecoded = JwtService.fromJWT(str)
    } catch (error) {
      throw new Error(`Token can't be decoded`)
    }

    const {
      payload: { requestToken: requestTokenStr },
    } = tokenDecoded

    if (!requestTokenStr) {
      throw new Error('Response does not contain request token')
    }

    const requestToken = DidAuthRequestToken.fromString(requestTokenStr)

    return new DidAuthResponseToken(str, requestToken)
  }
}
