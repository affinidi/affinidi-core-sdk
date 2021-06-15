import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { CommonNetworkMember as GenericCommonNetworkMember } from '../../src/CommonNetworkMember'
import { SdkOptions } from '../../src/dto/shared.dto'

export class CommonNetworkMember extends GenericCommonNetworkMember {
  constructor(password: string, encryptedSeed: string, options: SdkOptions = {}, component?: EventComponent) {
    super(password, encryptedSeed, options, component)
  }

  static async afterConfirmSignUp() {
    // empty implementation of "abstract" static method
  }
}
