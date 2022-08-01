import { profile } from '@affinidi/tools-common'
import { KeyOptions, SdkOptions } from '../dto/shared.dto'
import { withDidData } from '../shared/getDidData'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import { ParametersValidator } from '../shared/ParametersValidator'
import { BaseNetworkMember, StaticDependencies, ConstructorUserData } from './BaseNetworkMember'

@profile()
export class NetworkMemberWithoutCognito extends BaseNetworkMember {
  constructor(userData: ConstructorUserData, dependencies: StaticDependencies, options: ParsedOptions) {
    super(userData, dependencies, options)
  }

  /**
   * @description Creates DID and anchors it
   * 1. generate seed/keys
   * 2. build DID document
   * 3. sign DID document
   * 5. anchor DID with DID document according to anchoring schema
   * @param password - encryption key which will be used to encrypt randomly created seed/keys pair
   * @param inputOptions - sdk options
   * @param keyOptions - key options to add external keys
   * @returns
   *
   * did - hash from public key (your decentralized ID)
   *
   * encryptedSeed - seed is encrypted by provided password. Seed - it's a source to derive your keys
   */
  static async createWallet(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    password: string,
    keyOptions?: KeyOptions,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: password },
      { isArray: false, type: KeyOptions, isRequired: false, value: keyOptions },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const userData = await NetworkMemberWithoutCognito._register(dependencies, options, password, keyOptions)
    return new NetworkMemberWithoutCognito({ ...userData, password }, dependencies, options)
  }

  /**
   * @description Initilizes instance of SDK from seed
   * @param options - parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @param encryptedSeed - seed for derive keys in string hex format
   * @param password - optional password, will be generated, if not provided
   * @returns initialized instance of SDK
   */
  static async openWalletByEncryptedSeed(
    dependencies: StaticDependencies,
    inputOptions: SdkOptions,
    encryptedSeed: string,
    password: string,
  ) {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: encryptedSeed },
      { isArray: false, type: 'string', isRequired: true, value: password },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    return new NetworkMemberWithoutCognito(withDidData({ password, encryptedSeed }), dependencies, options)
  }
}
