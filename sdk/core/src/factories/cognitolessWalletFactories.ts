import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { NetworkMemberWithoutCognito, UniversalDerivedType } from '../CommonNetworkMember/NetworkMemberWithoutCognito'
import { SdkOptions } from '../dto/shared.dto'
import { ParsedOptions } from '../shared/getOptionsFromEnvironment'
import { AffinidiCommonConstructor, IPlatformEncryptionTools } from '../shared/interfaces'

const createWallet = (
  platformEncryptionTools: IPlatformEncryptionTools,
  affinidiCommon: AffinidiCommonConstructor | null,
  component: EventComponent,
) => {
  class Wallet extends NetworkMemberWithoutCognito {
    constructor(password: string, encryptedSeed: string, options: ParsedOptions) {
      super(password, encryptedSeed, platformEncryptionTools, affinidiCommon, options, component)
    }
  }

  return Wallet as UniversalDerivedType
}

export const createCognitolessWalletFactories = (
  platformEncryptionTools: IPlatformEncryptionTools,
  affinidiCommon: AffinidiCommonConstructor | null,
  component: EventComponent,
) => {
  const Wallet = createWallet(platformEncryptionTools, affinidiCommon, component)

  return {
    /**
     * @description Generates a new DID and creates a new instance of SDK using password
     * @param options - parameters with specified environment
     * @param password - password
     * @returns initialized instance of SDK
     */
    createWallet: (inputOptions: SdkOptions, inputPassword: string) => {
      return Wallet.createWallet(inputOptions, inputPassword)
    },

    /**
     * @description Initilizes instance of SDK from seed
     * @param options - parameters with specified environment
     * @param encryptedSeed - encrypted seed
     * @param password - password
     * @returns initialized instance of SDK
     */
    openWalletByEncryptedSeed: (inputOptions: SdkOptions, encryptedSeed: string, password: string) => {
      return Wallet.openWalletByEncryptedSeed(inputOptions, encryptedSeed, password)
    },
  }
}
