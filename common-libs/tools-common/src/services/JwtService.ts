import { decodeToken } from 'jsontokens'
import encode from 'base64url'
import { randomBytes } from '../shared/randomBytes'

const JwtService = {
  DEFAULT_JWT_EXPIRY_MS: 10 * 60 * 1000,

  keyIdToDid: (keyId: string) => {
    if (keyId.indexOf('#') === -1) {
      return keyId
    }

    return keyId.substring(0, keyId.indexOf('#'))
  },

  getDidFromToken: (jwt: string) => {
    const jwtObject: any = JwtService.fromJWT(jwt)
    const issuerKey = jwtObject.payload.iss

    return JwtService.keyIdToDid(issuerKey)
  },

  fromJWT: (token: string): any => {
    try {
      return decodeToken(token)
    } catch (error) {
      // NOTE: to add approrpaite error handler (see NEP-336)
      throw new Error('Invalid Token')
    }
  },

  encodeObjectToJWT: (jwtObject: { header: unknown; payload: unknown; signature: string }) => {
    if (!jwtObject.payload || !jwtObject.header || !jwtObject.signature) {
      throw new Error('The JWT is not complete, header / payload / signature are missing')
    }

    return [
      encode(JSON.stringify(jwtObject.header)),
      encode(JSON.stringify(jwtObject.payload)),
      jwtObject.signature,
    ].join('.')
  },

  buildJWTInteractionToken: async (interactionToken: any, type: string, receivedToken: any, expiresAt?: string) => {
    let expiration = Date.now() + JwtService.DEFAULT_JWT_EXPIRY_MS
    if (expiresAt) {
      expiration = new Date(expiresAt).getTime()
    }

    if (expiration < Date.now()) {
      throw new Error('ExpiresAt parameter should be in future.')
    }

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
      const did = JwtService.keyIdToDid(receivedToken.payload.iss)
      jwt.payload.aud = did
      jwt.payload.jti = receivedToken.payload.jti
    } else {
      jwt.payload.jti = await randomBytes(8).toString('hex')
    }

    return jwt
  },

  isJWT: (token: string): boolean => {
    try {
      JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    } catch (err) {
      return false
    }

    return true
  },
}

export default JwtService
