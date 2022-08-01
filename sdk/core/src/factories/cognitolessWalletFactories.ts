import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { NetworkMemberWithoutCognito as Wallet } from '../CommonNetworkMember/NetworkMemberWithoutCognito'
import {KeyOptions, SdkOptions} from '../dto/shared.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'

export const createCognitolessWalletFactories = (
  platformCryptographyTools: IPlatformCryptographyTools,
  eventComponent: EventComponent,
) => {
  const dependencies = { platformCryptographyTools, eventComponent }

  return {
    /**
     * @description Generates a new DID and creates a new instance of SDK using password
     * @param options - parameters with specified environment
     * @param password - password
     * @returns initialized instance of SDK
     */
    createWallet: (inputOptions: SdkOptions, inputPassword: string, keysOption?: KeyOptions) => {
      return Wallet.createWallet(dependencies, inputOptions, inputPassword, keysOption)
    },

    /**
     * @description Initilizes instance of SDK from seed
     * @param options - parameters with specified environment
     * @param encryptedSeed - encrypted seed
     * @param password - password
     * @returns initialized instance of SDK
     */
    openWalletByEncryptedSeed: (inputOptions: SdkOptions, encryptedSeed: string, password: string) => {
      return Wallet.openWalletByEncryptedSeed(dependencies, inputOptions, encryptedSeed, password)
    },
  }
}
