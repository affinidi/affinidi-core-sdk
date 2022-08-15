import { Affinidi } from '@affinidi/common'
import { JwtService } from '@affinidi/tools-common'
import { DidAuthResponseToken } from './DidAuthResponseToken'
import { DEFAULT_REQUEST_TOKEN_VALID_IN_MS } from '../shared/constants'
import Signer from '../shared/Signer'
import { parse } from 'did-resolver'

export default class DidAuthServerService {
  constructor(
    private readonly _verifierDid: string,
    private readonly _signer: Signer,
    private readonly _affinidi: Affinidi,
  ) {}

  async createDidAuthRequestToken(audienceDid: string, expiresAt?: number): Promise<string> {
    const jwtType = 'DidAuthRequest'
    const NOW = Date.now()

    const jwtObject: any = await JwtService.buildJWTInteractionToken(null, jwtType, null)
    jwtObject.payload.aud = parse(audienceDid).did
    jwtObject.payload.exp = expiresAt > NOW ? expiresAt : NOW + DEFAULT_REQUEST_TOKEN_VALID_IN_MS
    jwtObject.payload.createdAt = NOW

    await this._signer.fillSignature(jwtObject)

    return JwtService.encodeObjectToJWT(jwtObject)
  }

  async verifyDidAuthResponseToken(didAuthResponseTokenStr: string): Promise<boolean> {
    const didAuthResponseToken = DidAuthResponseToken.fromString(didAuthResponseTokenStr)
    const didAuthRequestToken = didAuthResponseToken.requestToken

    await this._affinidi.validateJWT(didAuthRequestToken.toString())
    await this._affinidi.validateJWT(didAuthResponseToken.toString(), didAuthRequestToken.toString())

    if (didAuthRequestToken.iss !== this._verifierDid) {
      throw new Error('Issuer of request is not valid')
    }

    return true
  }
}
