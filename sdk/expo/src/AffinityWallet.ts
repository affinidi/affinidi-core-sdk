import { profile } from '@affinidi/common'
import { CommonNetworkMember as CoreNetwork, __dangerous } from '@affinidi/wallet-core-sdk'
import { EventComponent } from '@affinidi/affinity-metrics-lib'

import platformEncryptionTools from './PlatformEncryptionTools'

export type SdkOptions = __dangerous.SdkOptions & {
  issueSignupCredential?: boolean
}

const COMPONENT = EventComponent.AffinidiExpoSDK

@profile()
export class AffinityWallet extends CoreNetwork {
  _skipBackupCredentials: boolean = false
  _credentials: any[] = []

  constructor(
    password: string,
    encryptedSeed: string,
    options: __dangerous.SdkOptions = {},
    component: EventComponent = COMPONENT,
  ) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)

    this.skipBackupCredentials = options.skipBackupCredentials
  }

  set skipBackupCredentials(value: boolean) {
    this._skipBackupCredentials = value
  }

  get skipBackupCredentials() {
    return this._skipBackupCredentials
  }

  get credentials() {
    return this._credentials
  }

  static async afterConfirmSignUp(
    affinityWallet: AffinityWallet,
    originalOptions: SdkOptions = { issueSignupCredential: false },
  ): Promise<void> {
    const options = Object.assign({}, affinityWallet._sdkOptions, originalOptions)
    const { idToken } = affinityWallet.cognitoUserTokens

    if (options.issueSignupCredential) {
      const signedCredentials = await affinityWallet.getSignupCredentials(idToken, options)

      if (affinityWallet.skipBackupCredentials) {
        affinityWallet._credentials = signedCredentials
      } else {
        await affinityWallet.saveCredentials(signedCredentials)
      }
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
   * @description Searches all of VCs for matches for the given credentialShareRequestToken
   *   or returns all of your offline VCs
   *   or fetches a subset of backup VCs
   * 1. pull encrypted VCs
   * 2. decrypt encrypted VCs
   * 3. optionally filter VCs by type
   * @param credentialShareRequestToken - JWT received from verifier, if given will search in all VCs
   * @param fetchBackupCredentials - optional, if false - returns all credentials from instance ignoring pagination
   * @param paginationOptions - if fetching from backup, optional range for credentials to be pulled (default is skip: 0, limit: 100)
   * @returns array of VCs
   */
  async getCredentials(
    credentialShareRequestToken: string = null,
    fetchBackupCredentials: boolean = true,
  ): Promise<any[]> {
    const credentials = fetchBackupCredentials ? await this.fetchAllCredentials() : this._credentials

    if (credentialShareRequestToken) {
      return this._walletStorageService.filterCredentials(credentialShareRequestToken, credentials)
    }

    return credentials
  }

  private async fetchAllCredentials() {
    const credentials = await this._walletStorageService.fetchAllDecryptedCredentials()
    this._credentials = credentials
    return credentials
  }
}
