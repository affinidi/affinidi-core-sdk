import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { NetworkMemberWithoutCognito, UniversalDerivedType } from '../CommonNetworkMember/NetworkMemberWithoutCognito'
import { SdkOptions } from '../dto/shared.dto'
import { ParsedOptions } from '../shared/getOptionsFromEnvironment'
import { IPlatformEncryptionTools } from '../shared/interfaces'

const createWallet = (platformEncryptionTools: IPlatformEncryptionTools, component: EventComponent) => {
  class Wallet extends NetworkMemberWithoutCognito {
    constructor(password: string, encryptedSeed: string, options: ParsedOptions) {
      super(password, encryptedSeed, platformEncryptionTools, options, component)
    }
  }

  return Wallet as UniversalDerivedType
}

export const createCognitolessWalletFactories = (
  platformEncryptionTools: IPlatformEncryptionTools,
  component: EventComponent,
) => {
  const Wallet = createWallet(platformEncryptionTools, component)

  return {
    /**
     * @description Initilizes instance of SDK from seed
     * @param options - parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
     * @param seedHexWithMethod - seed for derive keys in string hex format
     * @param password - optional password, will be generated, if not provided
     * @returns initialized instance of SDK
     */
    createFromUnencryptedSeed: (inputOptions: SdkOptions, seedHexWithMethod: string, inputPassword?: string) => {
      return Wallet.createFromUnencryptedSeed(inputOptions, seedHexWithMethod, inputPassword)
    },

    /**
     * @description Initilizes instance of SDK from seed
     * @param options - parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
     * @param encryptedSeed - seed for derive keys in string hex format
     * @param password - optional password, will be generated, if not provided
     * @returns initialized instance of SDK
     */
    createFromEncryptedSeedAndPassword: (inputOptions: SdkOptions, encryptedSeed: string, password: string) => {
      return Wallet.createFromEncryptedSeedAndPassword(inputOptions, encryptedSeed, password)
    },
  }
}
