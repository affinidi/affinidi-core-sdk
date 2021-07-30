import { JwtService } from '@affinidi/common'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
import { DEFAULT_DID_METHOD } from '../_defaultConfig'

export const Util = {
  /**
   * @description Parses JWT and returns DID
   * @param jwt
   * @returns DID of entity who signed JWT
   */
  getDidFromToken: (jwt: string) => {
    // await ParametersValidator.validateSync(
    //   [
    //     { isArray: false, type: 'jwt', isRequired: true, value: jwt }
    //   ]
    // )

    return JwtService.getDidFromToken(jwt)
  },

  /**
   * @description Returns hex of public key from DID document
   * @param didDocument - user's DID document
   * @returns public key hex
   */
  getPublicKeyHexFromDidDocument: (didDocument: any) => {
    // await ParametersValidator.validateSync(
    //   [
    //     { isArray: false, type: 'object', isRequired: true, value: didDocument }
    //   ]
    // )
    // TODO: review: in general case - need to find section at didDocument.publicKey where id === keyId
    const { publicKeyHex } = didDocument.publicKey[0]

    return publicKeyHex
  },

  /**
   * @description Generates random seed from which keys could be derived
   */
  generateSeed: async (didMethod: string = DEFAULT_DID_METHOD): Promise<any> => {
    await ParametersValidator.validate([{ isArray: false, type: 'didMethod', isRequired: true, value: didMethod }])

    let seed
    switch (didMethod) {
      case 'jolo':
        seed = await randomBytes(32)
        break
      default:
        seed = await randomBytes(32)
    }

    return seed
  },

  /**
   * @description Parses JWT token (request and response tokens of share and offer flows)
   * @param token - JWT
   * @returns parsed object from JWT
   */
  fromJWT: (token: string): any => {
    // await ParametersValidator.validateSync(
    //   [
    //     { isArray: false, type: 'jwt', isRequired: true, value: token }
    //   ]
    // )

    return JwtService.fromJWT(token)
  },
}
