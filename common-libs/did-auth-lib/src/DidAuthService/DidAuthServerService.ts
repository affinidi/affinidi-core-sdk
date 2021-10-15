import { Affinidi } from '@affinidi/common'
import { JwtService } from '@affinidi/tools-common'
import { parse } from 'did-resolver'
import { VerifierOptions } from '../shared/types'
import { DidAuthResponseToken } from './DidAuthResponseToken'
import { DEFAULT_REQUEST_TOKEN_VALID_IN_MS } from '../shared/constants'
import Signer from '../shared/Signer'

export default class AffinidiDidAuthServerService {
  private readonly _did: string
  private readonly _signer: Signer

  /**
   * Construct a DidAuthService based on the given options
   *
   * @param options auth service options
   */
  constructor(did: string, signer: Signer) {
    this._did = did
    this._signer = signer
  }

  async createDidAuthRequestToken(audienceDid: string, expiresAt?: number): Promise<string> {
    const jwtType = 'DidAuthRequest'
    const NOW = Date.now()

    const jwtObject: any = await JwtService.buildJWTInteractionToken(null, jwtType, null)
    jwtObject.payload.aud = parse(audienceDid).did
    jwtObject.payload.exp = expiresAt > NOW ? expiresAt : NOW + DEFAULT_REQUEST_TOKEN_VALID_IN_MS
    jwtObject.payload.createdAt = NOW

    await this._signer.fillSignature(jwtObject)

    return Affinidi.encodeObjectToJWT(jwtObject)
  }

  async verifyDidAuthResponseToken(didAuthResponseTokenStr: string, options: VerifierOptions): Promise<boolean> {
    const affinidiOptions = {
      registryUrl: `https://affinity-registry.${options.environment}.affinity-project.org`,
      apiKey: options.accessApiKey,
    }
    const affinidi = new Affinidi(affinidiOptions, null as any)

    const didAuthResponseToken = DidAuthResponseToken.fromString(didAuthResponseTokenStr)
    const didAuthRequestToken = didAuthResponseToken.requestToken

    await affinidi.validateJWT(didAuthRequestToken.toString())
    await affinidi.validateJWT(didAuthResponseToken.toString(), didAuthRequestToken.toString())

    const verifierDid = parse(this._did).did

    if (didAuthRequestToken.iss !== verifierDid) {
      throw new Error('Issuer of request is not valid')
    }

    return true
  }
}
