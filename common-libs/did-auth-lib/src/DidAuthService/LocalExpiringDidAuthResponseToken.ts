import { DidAuthResponseToken } from './DidAuthResponseToken'
import { DidAuthRequestToken } from './DidAuthRequestToken'

/**
 * Utility class that can encapsulate a DidAuthResponseToken
 * and keep track of its expiry time according to the local
 * time of the client. This is needed in case the local
 * time of the client can diverge from the server time
 */
export class LocalExpiringDidAuthResponseToken {
  // by default, tokens should expire 5s before their expiration date
  public static readonly DEFAULT_EXPIRY_BUFFER = 5 * 1000

  private constructor(
    private readonly _didAuthResponseToken: DidAuthResponseToken,
    private readonly _expireAt: number,
  ) {}

  isExpiredAt(time: number): boolean {
    return this._expireAt < time
  }

  toString(): string {
    return this._didAuthResponseToken.toString()
  }

  /**
   * @param tokenRequestTime unix timestamp in milliseconds
   * @param token the did auth response token
   * @param expiryBuffer milliseconds
   */
  static initialize(
    tokenRequestTime: number,
    token: string,
    expiryBuffer: number = this.DEFAULT_EXPIRY_BUFFER,
  ): LocalExpiringDidAuthResponseToken {
    const didAuthResponseToken = DidAuthResponseToken.fromString(token)
    const expireAt = this.calculateExpireAt(tokenRequestTime, expiryBuffer, didAuthResponseToken.requestToken)

    return new LocalExpiringDidAuthResponseToken(didAuthResponseToken, expireAt)
  }

  private static calculateExpireAt(
    tokenRequestTime: number,
    expiryBuffer: number,
    didAuthRequestToken: DidAuthRequestToken,
  ): number {
    const estimatedClockDifference = tokenRequestTime - didAuthRequestToken.createdAt
    const expireAt = didAuthRequestToken.exp + estimatedClockDifference + expiryBuffer

    if (isNaN(expireAt)) {
      throw new Error('could not calculate expiry time')
    }

    return expireAt
  }
}
