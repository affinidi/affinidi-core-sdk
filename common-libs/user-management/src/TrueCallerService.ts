import { profile } from '@affinidi/tools-common'
import { pki } from 'node-forge'
import crypto from 'crypto'
import { ProfileTrueCaller, ProfileTrueCallerPayload } from './dto'
import SdkErrorFromCode from './SdkErrorFromCode'
import { TrueCallerPublicKeyManager, trueCallerPublicKeyManager } from './TrueCallerPublicKeyManager'

export const ALGO_MAP: { [key: string]: any } = {
  SHA512withRSA: 'RSA-SHA512',
}

const { TRUECALLER_TOKEN_DEFAULT_EXPIRY_BUFFER } = process.env

/**
 * Service contains logic that helps to inject
 * login/signup `Cognito` user with the verified `Truecaller` token/profile.
 */
@profile()
export class TrueCallerService {
  constructor(public readonly keyManager: TrueCallerPublicKeyManager = trueCallerPublicKeyManager) {}

  getTrueCallerUrl() {
    return this.keyManager.trueCallerPublicKeyUrl
  }

  /**
   * Verify `payload` of `Truecaller` token/profile.
   * See official nodejs example https://github.com/truecaller/backend-sdk-validation/blob/master/nodejs/index.js#L38
   * @param profileTrueCaller
   */
  async verifyProfile(profileTrueCaller: ProfileTrueCaller): Promise<boolean> {
    if (!profileTrueCaller?.payload && !profileTrueCaller?.signature && !profileTrueCaller?.signatureAlgorithm) {
      throw new SdkErrorFromCode('UM-6')
    }

    const res = await this.verifySignature(profileTrueCaller)

    if (res) {
      return res
    }

    return await this.verifySignature(profileTrueCaller, true)
  }

  private async verifySignature(profileTrueCaller: ProfileTrueCaller, invalidatePK: boolean = false): Promise<boolean> {
    let keyResult = await this.keyManager.getKey()
    if (!keyResult || invalidatePK) {
      await this.keyManager.sync()
      keyResult = await this.keyManager.getKey()
    }

    const keyStr = keyResult.key
    const publicKeyPem = this.preparePublicKeyPemFile(keyStr)
    const keyBytes = Buffer.from(publicKeyPem)
    const payload = Buffer.from(profileTrueCaller.payload)
    const signature = Buffer.from(profileTrueCaller.signature, 'base64')
    const signatureAlgorithm = ALGO_MAP[profileTrueCaller.signatureAlgorithm]

    const verifier = crypto.createVerify(signatureAlgorithm)
    verifier.update(payload)

    return verifier.verify(keyBytes, signature)
  }

  /**
   * Validation of payload timestamp.
   * NOTE: Expiration buffer is 12 hours. Could be decrease after providing user timezone in token/profile.
   * @param profileTrueCaller
   */
  validatePayloadTimestamp(profileTrueCaller: ProfileTrueCaller): boolean {
    const { timeStamp } = this.parsePayloadProfileTrueCaller(profileTrueCaller)
    if (timeStamp) {
      const expiryBuffer = Number(TRUECALLER_TOKEN_DEFAULT_EXPIRY_BUFFER) || 12 * 60 * 1000
      const expiredAt = timeStamp + expiryBuffer
      return expiredAt > Date.now()
    }

    return false
  }

  /**
   * Parse base64 `payload` field from `Truecaller` token.
   * Generate `username` as random uuid.
   * Since `payload` is only signed info in `truecaller` token we can trust it.
   * @param profileTrueCaller
   */
  parsePayloadProfileTrueCaller(profileTrueCaller: ProfileTrueCaller): {
    timeStamp: number
    verifier: string
    phoneNumber: string
  } {
    const payloadStr = Buffer.from(profileTrueCaller.payload, 'base64').toString('ascii')
    const payload: ProfileTrueCallerPayload = JSON.parse(payloadStr)
    const { verifier, requestTime, phoneNumber } = payload
    const timeStamp = this.normalizeRequestTime(requestTime)

    return { timeStamp, verifier, phoneNumber }
  }

  /**
   * Preparing right `.pem` formatted public key in order to use it with `crypto` lib.
   * @param keyStr
   */
  preparePublicKeyPemFile(keyStr: string) {
    const publicKeyPem = '-----BEGIN PUBLIC KEY-----' + keyStr + '-----END PUBLIC KEY-----'
    const forgePubKey = pki.publicKeyFromPem(publicKeyPem)

    return pki.publicKeyToPem(forgePubKey)
  }

  /**
   * Normalize `requestTime` from the `payload` field of `Trucaller` profile
   * @param requestTime
   */
  normalizeRequestTime(requestTime: number) {
    const paddedRequestTime = String(requestTime).padEnd(13, '0')

    return Number(paddedRequestTime)
  }
}
