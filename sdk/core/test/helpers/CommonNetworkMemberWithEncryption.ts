import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { CommonNetworkMember as GenericCommonNetworkMember } from '../../src/CommonNetworkMember'
import { SdkOptions } from '../../src/dto/shared.dto'
import { testPlatformToolsWithEncryption } from './testPlatformToolsWithEncryption'

export class CommonNetworkMemberWithEncryption extends GenericCommonNetworkMember {
  constructor(password: string, encryptedSeed: string, options: SdkOptions, component?: EventComponent) {
    super(password, encryptedSeed, testPlatformToolsWithEncryption, options, component)
  }
}
