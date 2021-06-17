import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { CommonNetworkMember as GenericCommonNetworkMember } from '../../src/CommonNetworkMember'
import { SdkOptions } from '../../src/dto/shared.dto'
import { testPlatformTools } from './testPlatformTools'

export class CommonNetworkMember extends GenericCommonNetworkMember {
  constructor(password: string, encryptedSeed: string, options: SdkOptions = {}, component?: EventComponent) {
    super(password, encryptedSeed, testPlatformTools, options, component)
  }

  static async afterConfirmSignUp() {
    // empty implementation of "abstract" static method
  }
}
