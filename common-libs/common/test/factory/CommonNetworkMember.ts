import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { CommonNetworkMember as GenericCommonNetworkMember, __dangerous } from '@affinidi/wallet-core-sdk'

const testPlatformTools = {
  platformName: 'stub',
  decryptByPrivateKey: async () => {
    throw new Error('not implemented')
  },
  encryptByPublicKey: async () => {
    throw new Error('not implemented')
  },
}
export class CommonNetworkMember extends GenericCommonNetworkMember {
  constructor(
    password: string,
    encryptedSeed: string,
    options: __dangerous.SdkOptions = {},
    component?: EventComponent,
  ) {
    super(password, encryptedSeed, testPlatformTools, options, component)
  }

  static async afterConfirmSignUp() {
    // empty implementation of "abstract" static method
  }
}
