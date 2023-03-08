import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { NetworkMemberWithoutCognito as Wallet } from '../CommonNetworkMember/NetworkMemberWithoutCognito'
import { KeyOptions, SdkOptions } from '../dto/shared.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'

export const createCognitolessWalletFactories = (
  platformCryptographyTools: IPlatformCryptographyTools,
  eventComponent: EventComponent,
) => {
  const dependencies = { platformCryptographyTools, eventComponent }

  return {
    /**
     * @description Generates a new DID and creates a new instance of SDK using password
     * @param inputOptions - parameters with specified environment
     * @param inputPassword - password
     * @param keyOptions - specifies available wallet key types (allowed rsa and bbs; ecdsa - default, no need to specify)
     * @returns initialized instance of SDK
     */
    createWallet: (inputOptions: SdkOptions, inputPassword: string, keyOptions?: KeyOptions) => {
      return Wallet.createWallet(dependencies, inputOptions, inputPassword, keyOptions)
    },

    /**
     * @description Initilizes instance of SDK from seed
     * @param inputOptions - parameters with specified environment
     * @param encryptedSeed - encrypted seed
     * @param password - password
     * @param accountNumber - account number is an optional parameter to derive custom account `keys`/`did` from the root `seed`
     * @returns initialized instance of SDK
     */
    openWalletByEncryptedSeed: (
      inputOptions: SdkOptions,
      encryptedSeed: string,
      password: string,
      accountNumber?: number,
    ) => {
      return Wallet.openWalletByEncryptedSeed(dependencies, inputOptions, encryptedSeed, password, accountNumber)
    },
  }
}
