import { fetch } from '@affinidi/platform-fetch'
import SdkErrorFromCode from './SdkErrorFromCode'

const TRUE_CALLER_PUBLIC_KEY_URL = 'https://api4.truecaller.com/v1/key'

type TrueCallerPK = { keyType: string; key: string }

export class TrueCallerPublicKeyManager {
  private key: TrueCallerPK

  constructor(public readonly trueCallerPublicKeyUrl: string) {}

  /**
   //  * Fetch `Truecaller` public key.
   //  * See docs https://docs.truecaller.com/truecaller-sdk/android/server-side-response-validation/for-truecaller-users-verification-flow
   //  */
  async sync() {
    let result: Array<TrueCallerPK>
    try {
      const resp = await fetch(this.trueCallerPublicKeyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/ld+json, application/json',
        },
      })

      result = await resp.json()
    } catch (error) {
      throw new SdkErrorFromCode('UM-5', { error })
    }

    if (result.length < 1) {
      throw new SdkErrorFromCode('UM-4')
    } else {
      this.key = result[0]
    }
  }

  async getKey(): Promise<TrueCallerPK> {
    return this.key
  }
}

export const trueCallerPublicKeyManager = new TrueCallerPublicKeyManager(TRUE_CALLER_PUBLIC_KEY_URL)
