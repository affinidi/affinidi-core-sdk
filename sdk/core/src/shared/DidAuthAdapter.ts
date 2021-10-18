import { DidAuthClientService, LocalExpiringDidAuthResponseToken } from '@affinidi/affinidi-did-auth-lib'

export class DidAuthAdapter {
  constructor(private readonly _did: string, private readonly _didAuthService: DidAuthClientService) {}

  get did(): string {
    return this._did
  }

  createDidAuthResponseToken(didAuthRequestToken: string): Promise<string> {
    return this._didAuthService.createDidAuthResponseToken(didAuthRequestToken)
  }

  isResponseTokenExpired(token: string, tokenRequestTime: number): boolean {
    const localExpiringDidAuthResponseTokenCheck = LocalExpiringDidAuthResponseToken.initialize(tokenRequestTime, token)
    return localExpiringDidAuthResponseTokenCheck.isExpiredAt(Date.now())
  }
}
