import ApiService from './ApiService'
import { DidAuthAdapter } from '../../shared/DidAuthAdapter'

export class DidAuthService {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly api: ApiService

  constructor(private readonly didAuthAdapter: DidAuthAdapter, apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.api = new ApiService(this.baseUrl, {
      Accept: 'application/json',
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    })
  }

  async pullDidAuthRequestToken(): Promise<string> {
    const audienceDid = this.didAuthAdapter.did
    const url = 'did-auth/create-did-auth-request'

    return this.api.execute('POST', url, { audienceDid })
  }

  async createDidAuthResponseToken(didAuthRequestTokenStr: string): Promise<string> {
    return this.didAuthAdapter.createDidAuthResponseToken(didAuthRequestTokenStr)
  }

  isTokenExpired(token: string, tokenRequestTime: number): boolean {
    return this.didAuthAdapter.isResponseTokenExpired(token, tokenRequestTime)
  }
}
