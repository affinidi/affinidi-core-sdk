import { DidAuthService, LocalExpiringDidAuthResponseToken } from '@affinidi/affinidi-did-auth-lib'
import { AffinidiDidAuthServiceOptions } from '@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService'

export class DidAuthAdapter {
  private readonly _didAuthService: DidAuthService

  constructor(private readonly _did: string, didAuthOptions: AffinidiDidAuthServiceOptions) {
    this._didAuthService = new DidAuthService(didAuthOptions)
  }

  get did(): string {
    return this._did
  }

  createDidAuthResponseToken(didAuthRequestToken: string): Promise<string> {
    return this._didAuthService.createDidAuthResponseToken(didAuthRequestToken)
  }

  isTokenExpired(token: string, tokenRequestTime: number): boolean {
    const localExpiringDidAuthResponseTokenCheck = LocalExpiringDidAuthResponseToken.initialize(tokenRequestTime, token)
    return localExpiringDidAuthResponseTokenCheck.isExpiredAt(Date.now())
  }
}
