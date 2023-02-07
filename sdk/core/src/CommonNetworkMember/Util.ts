import { JwtService } from '@affinidi/common'
import { validateUsername } from '@affinidi/user-management'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
import { DEFAULT_DID_METHOD } from '../_defaultConfig'
import { decodeBase58, DidDocument } from '@affinidi/common'

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
   * @description Returns public key from DID document
   * @param didDocument - user's DID document
   * @returns publicKey
   */
  getPublicKeyFromDidDocument: (didDocument: DidDocument): Buffer => {
    const keySection = didDocument.publicKey?.[0] // old form of did docs contains publicKey[0].publicKeyHex
    const methodSection = didDocument.verificationMethod?.[0] // new form of did docs contains verificationMethod[0].publicKeyBase58
    if (keySection?.publicKeyPem) return Buffer.from(keySection.publicKeyPem)
    if (keySection?.publicKeyBase58) return Buffer.from(keySection.publicKeyBase58)
    if (keySection?.publicKeyHex) return Buffer.from(keySection.publicKeyHex, 'hex')

    if (methodSection?.publicKeyBase58) return decodeBase58(methodSection?.publicKeyBase58)
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

  /**
   * Simple check if token has JWT structure
   * @param token
   */
  isJWT: (token: string): boolean => {
    return JwtService.isJWT(token)
  },

  getLoginType: (login: string) => {
    const { isEmailValid, isPhoneNumberValid } = validateUsername(login)

    if (isEmailValid) {
      return 'email'
    }

    if (isPhoneNumberValid) {
      return 'phone'
    }

    return 'username'
  },
}
