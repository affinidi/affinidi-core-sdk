import { JwtService } from '@affinidi/tools-common'
import { parse } from 'did-resolver'

import { CreateResponseTokenOptions } from './types'
import { DEFAULT_MAX_TOKEN_VALID_IN_MS } from './constants'

export const buildResponseJwtObject = async (didAuthRequestToken: string, options?: CreateResponseTokenOptions) => {
  const didAuthRequestTokenDecoded = JwtService.fromJWT(didAuthRequestToken)
  const jwtType = 'DidAuthResponse'
  const NOW = Date.now()

  const jwtObject: any = await JwtService.buildJWTInteractionToken(null, jwtType, didAuthRequestTokenDecoded)
  jwtObject.payload.requestToken = didAuthRequestToken
  jwtObject.payload.aud = parse(didAuthRequestTokenDecoded.payload.iss).did
  jwtObject.payload.exp = NOW + (options?.maxTokenValidInMs ?? DEFAULT_MAX_TOKEN_VALID_IN_MS)
  jwtObject.payload.createdAt = NOW
  return jwtObject
}
