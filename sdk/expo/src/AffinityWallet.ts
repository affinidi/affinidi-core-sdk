import { profile } from '@affinidi/common'
import { CommonNetworkMember as CoreNetwork, __dangerous } from '@affinidi/wallet-core-sdk'
import { EventComponent } from '@affinidi/affinity-metrics-lib'

import platformEncryptionTools from './PlatformEncryptionTools'

export type SdkOptions = __dangerous.SdkOptions & {
  issueSignupCredential?: boolean
}

const COMPONENT = EventComponent.AffinidiExpoSDK

@profile()
export class AffinityWallet extends CoreNetwork<SdkOptions> {
  constructor(password: string, encryptedSeed: string, options: SdkOptions, component: EventComponent = COMPONENT) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)

    this.skipBackupCredentials = options.skipBackupCredentials
  }

  set skipBackupCredentials(value: boolean) {
    this._sdkOptions.otherOptions.skipBackupCredentials = value
  }

  get skipBackupCredentials() {
    return this._sdkOptions.otherOptions.skipBackupCredentials
  }

  static async afterConfirmSignUp(affinityWallet: AffinityWallet, originalOptions: SdkOptions): Promise<void> {
    const options = Object.assign({}, affinityWallet._sdkOptions, originalOptions)
    const { idToken } = affinityWallet.cognitoUserTokens

    if (options.issueSignupCredential) {
      const signedCredentials = await affinityWallet.getSignupCredentials(idToken, options)

      await affinityWallet.saveCredentials(signedCredentials)
    }
  }

  /**
   * @description Creates encrypted message for another user DID
   * 1. resolve DID (for whom message will be encrypted)
   * 2. get public key from resolved DID document
   * 3. encrypt message using public key of resolved DID
   * @param did - DID of user for whom message will be sent (only this user
   * will be able to decrypt it using his private key),
   * or if DID Document is passed, resolveDid won't happen
   * @param object - message object which will be send
   * @returns encryptedMessage - string version of encrypted message
   */
  async createEncryptedMessage(did: string | any, object: any) {
    let didDocument = did

    if (typeof did === 'string') {
      didDocument = await this.resolveDid(did)
    }

    const publicKeyHex = this.getPublicKeyHexFromDidDocument(didDocument)
    const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex')

    return platformEncryptionTools.encryptByPublicKey(publicKeyBuffer, object)
  }

  /**
   * @description Decrypts message using user's private key
   * @param encryptedMessage - message encrypted for you by your public key
   * @returns decrypted message
   */
  async readEncryptedMessage(encryptedMessage: string): Promise<any> {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    return platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, encryptedMessage)
  }

  /**
   * @description Searches all of VCs for matches for the given credentialShareRequestToken.
   * If a token is not given returns all the available credentials
   * @param credentialShareRequestToken - JWT received from verifier
   * @returns array of VCs
   */
  async getCredentials(credentialShareRequestToken: string = null): Promise<any[]> {
    if (credentialShareRequestToken) {
      return this.getCredentialsByShareToken(credentialShareRequestToken)
    }

    return this.getAllCredentials()
  }
}
