import { JwtService } from '@affinidi/common'
import { parse } from 'did-resolver'

// partially parsed did auth request token
export class DidAuthRequestToken {
  private constructor(
    private readonly _str: string,
    private readonly _iss: string,
    private readonly _createdAt: number,
    private readonly _exp?: number,
  ) {}

  get iss(): string {
    return this._iss
  }

  get createdAt(): number {
    return this._createdAt
  }

  get exp(): number | undefined {
    return this._exp
  }

  toString(): string {
    return this._str
  }

  static fromString(str: string): DidAuthRequestToken {
    let tokenDecoded: any

    try {
      tokenDecoded = JwtService.fromJWT(str)
    } catch (error) {
      throw new Error(`Token can't be decoded`)
    }

    const iss = parse(tokenDecoded.payload.iss).did
    const { exp, createdAt } = tokenDecoded.payload

    return new DidAuthRequestToken(str, iss, createdAt, exp)
  }
}
