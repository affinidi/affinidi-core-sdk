import jwksClient, { SigningKey, Headers } from 'jwks-rsa'

export type JwksSigningKey = SigningKey

export type RequestHeaders = Headers

export class JwksPublicKeyManager {
  private readonly oryJwksClient: jwksClient.JwksClient

  constructor(jwksUri: string, requestHeaders: RequestHeaders = {}, timeout: number = 30000) {
    this.oryJwksClient = jwksClient({
      jwksUri,
      requestHeaders,
      timeout,
    })
  }

  getSigningKeys = async (): Promise<JwksSigningKey[]> => {
    return this.oryJwksClient.getSigningKeys()
  }

  getPublicKey = async (kid?: string | null | undefined): Promise<string> => {
    return (await this.oryJwksClient.getSigningKey(kid)).getPublicKey()
  }
}
