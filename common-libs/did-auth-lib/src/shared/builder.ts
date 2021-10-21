import { JwtService } from '@affinidi/tools-common'
import { parse } from 'did-resolver'

export const buildResponseJwtObject = async (didAuthRequestToken: string) => {
  const didAuthRequestTokenDecoded = JwtService.fromJWT(didAuthRequestToken)
  const jwtType = 'DidAuthResponse'
  const NOW = Date.now()

  const jwtObject: any = await JwtService.buildJWTInteractionToken(null, jwtType, didAuthRequestTokenDecoded)
  jwtObject.payload.requestToken = didAuthRequestToken
  jwtObject.payload.aud = parse(didAuthRequestTokenDecoded.payload.iss).did
  jwtObject.payload.exp = undefined
  jwtObject.payload.createdAt = NOW
  return jwtObject
}
