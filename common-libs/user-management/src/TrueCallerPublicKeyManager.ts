import { fetch } from '@affinidi/platform-fetch'
import SdkErrorFromCode from './SdkErrorFromCode'

export class TrueCallerPublicKeyManager {
  constructor(
    private readonly trueCallerPublicKeyUrl: string,
    private keys: Array<{ keyType: string; key: string }> = [],
  ) {}

  /**
   //  * Fetch `Truecaller` public key.
   //  * See docs https://docs.truecaller.com/truecaller-sdk/android/server-side-response-validation/for-truecaller-users-verification-flow
   //  */
  async sync() {
    let result: Array<{ keyType: string; key: string }>
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
      this.keys = result
    }
  }

  async getKey(): Promise<{ keyType: string; key: string }> {
    return this.keys[0]
  }
}
