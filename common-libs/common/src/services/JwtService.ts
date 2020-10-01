import DidDocumentService from './DidDocumentService'
import { decodeToken } from 'jsontokens'
import encode from 'base64url'
import { randomBytes } from '../shared/randomBytes'

import { DEFAULT_JWT_EXPIRY_MS } from '../_defaultConfig'

export default class JwtService {
  static getDidFromToken(jwt: string) {
    const jwtObject: any = JwtService.fromJWT(jwt)
    const issuerKey = jwtObject.payload.iss

    return DidDocumentService.keyIdToDid(issuerKey)
  }

  static fromJWT(token: string): any {
    let data

    try {
      data = decodeToken(token)
    } catch (error) {
      // NOTE: to add approrpaite error handler (see NEP-336)
      throw new Error('Invalid Token')
    }

    return data
  }

  encodeObjectToJWT(jwtObject: any) {
    if (!jwtObject.payload || !jwtObject.header || !jwtObject.signature) {
      throw new Error('The JWT is not complete, header / payload / signature are missing')
    }

    return [
      encode(JSON.stringify(jwtObject.header)),
      encode(JSON.stringify(jwtObject.payload)),
      jwtObject.signature,
    ].join('.')
  }

  static async buildJWTInteractionToken(interactionToken: any, type: string, receivedToken: any) {
    const expiration = Date.now() + DEFAULT_JWT_EXPIRY_MS

    const jwt = {
      header: {
        typ: 'JWT',
        alg: 'ES256K',
      },
      payload: {
        interactionToken,
        exp: expiration,
        typ: type,
        jti: '',
        aud: '',
      },
    }

    if (receivedToken) {
      const keyId = receivedToken.payload.iss
      const did = keyId.substring(0, keyId.indexOf('#'))
      jwt.payload.aud = did
      jwt.payload.jti = receivedToken.payload.jti
    } else {
      jwt.payload.jti = await randomBytes(8).toString('hex')
    }

    return jwt
  }
}
