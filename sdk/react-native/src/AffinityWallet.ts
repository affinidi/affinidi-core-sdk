import { CommonNetworkMember as CoreNetwork, __dangerous } from '@affinidi/wallet-core-sdk'

import KeysService from './services/KeysService'
import WalletStorageService from './services/WalletStorageService'

type SdkOptions = __dangerous.SdkOptions & {
  issueSignupCredential?: boolean
}

export class AffinityWallet extends CoreNetwork {
  keysService: KeysService
  walletStorageService: WalletStorageService

  constructor(password: string, encryptedSeed: string, options: __dangerous.SdkOptions = {}) {
    super(password, encryptedSeed, options)

    const sdkOptions = CoreNetwork.setEnvironmentVarialbles(options)

    this.keysService = new KeysService(encryptedSeed, password)
    this.walletStorageService = new WalletStorageService(encryptedSeed, password, sdkOptions)
  }

  /**
   * @description Logins with access token of Cognito user registered in Affinity
   * @param options - optional parameters for AffinityWallet initialization
   * @returns initialized instance of SDK or throws `COR-9` UnprocessableEntityError,
   * if user is not logged in.
   */
  static async init(options: __dangerous.SdkOptions = {}): Promise<any> {
    await __dangerous.ParametersValidator.validate([
      { isArray: false, type: __dangerous.SdkOptions, isRequired: false, value: options },
    ])

    const { keyStorageUrl, userPoolId } = CoreNetwork.setEnvironmentVarialbles(options)
    const { accessToken } = __dangerous.readUserTokensFromSessionStorage(userPoolId)

    const encryptedSeed = await WalletStorageService.pullEncryptedSeed(accessToken, keyStorageUrl, options)
    const encryptionKey = await WalletStorageService.pullEncryptionKey(accessToken)

    return new AffinityWallet(encryptionKey, encryptedSeed, options)
  }

  /**
   * @description Completes sign in
   * @param token - received from #signIn method
   * @param confirmationCode - OTP sent by AWS Cognito/SES
   * @param options - optional parameters for CommonNetworkMember initialization
   * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
   */
  static async confirmSignIn(
    token: string,
    confirmationCode: string,
    options: SdkOptions = { issueSignupCredential: false },
  ): Promise<{ isNew: boolean; commonNetworkMember: any }> {
    await __dangerous.ParametersValidator.validate([
      { isArray: false, type: 'string', isRequired: true, value: token },
      {
        isArray: false,
        type: 'confirmationCode',
        isRequired: true,
        value: confirmationCode,
      },
      { isArray: false, type: __dangerous.SdkOptions, isRequired: false, value: options },
    ])

    let affinityWallet
    // NOTE: loginToken = '{"ChallengeName":"CUSTOM_CHALLENGE","Session":"...","ChallengeParameters":{"USERNAME":"...","email":"..."}}'
    //       signUpToken = 'username::password'
    const isSignUpToken = token.split('::')[1] !== undefined

    if (isSignUpToken) {
      affinityWallet = await this.confirmSignUp(token, confirmationCode, options)

      return { isNew: true, commonNetworkMember: affinityWallet }
    }

    await this.completeLoginChallenge(token, confirmationCode, options)

    affinityWallet = await AffinityWallet.init(options)

    return { isNew: false, commonNetworkMember: affinityWallet }
  }

  /**
   * @description Completes sign up flow with optional VC issuance using sign up info
   * @param token - received from #signUp method
   * @param confirmationCode - OTP sent by AWS Cognito/SES.
   * NOTE: is not required if email or phoneNumber was given on #signUp.
   * @param options - optional parameters for CommonNetworkMember initialization
   * @returns initialized instance of SDK
   */
  static async confirmSignUp(
    token: string,
    confirmationCode: string,
    options: SdkOptions = { issueSignupCredential: false },
  ): Promise<any> {
    const networkMember = await super.confirmSignUp(token, confirmationCode, options)
    const { idToken } = networkMember.cognitoUserTokens
    const { password, encryptedSeed } = networkMember

    options.cognitoUserTokens = networkMember.cognitoUserTokens

    const affinityWallet = new AffinityWallet(password, encryptedSeed, options)

    if (options.issueSignupCredential) {
      const signedCredentials = await affinityWallet.getSignupCredentials(idToken, options)

      await affinityWallet.saveCredentials(signedCredentials)
    }

    return affinityWallet
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

    return this.keysService.encryptByPublicKey(publicKeyHex, object)
  }

  /**
   * @description Decrypts message using user's private key
   * @param encryptedMessage - message encrypted for you by your public key
   * @returns decrypted message
   */
  async readEncryptedMessage(encryptedMessage: string): Promise<any> {
    return this.keysService.decryptByPrivateKey(encryptedMessage)
  }

  /**
   * @description Save's encrypted VCs in Affinity Guardian Wallet
   * 1. encrypt VCs
   * 2. store encrypted VCs in Affinity Guardian Wallet
   * @param data - array of VCs
   * @param storageRegion - (optional) specify AWS region where credentials will be stored
   * @returns array of ids for corelated records
   */
  async saveCredentials(data: any, storageRegion?: string): Promise<any> {
    const encryptedCredentials = await this.walletStorageService.encryptCredentials(data)
    const result = await this.saveEncryptedCredentials(encryptedCredentials, storageRegion)

    this._sendVCSavedMetrics(data)
    // NOTE: what if creds actually were not saved in the vault?
    //       follow up with Isaak/Dustin on this - should we parse the response
    //       to define if we need to send the metrics
    return result
  }

  /**
   * @description Pulls all credentials which match by credentialShareRequestToken,
   *   if token not provided all your VCs will be returned:
   * 1. pull encrypted VCs
   * 2. decrypt encrypted VCs
   * 3. filter VCs by type
   * @param credentialShareRequestToken - JWT received from verifier
   * @returns array of VCs
   */
  async getCredentials(credentialShareRequestToken: string = null): Promise<any> {
    let blobs

    try {
      blobs = await this.walletStorageService.fetchEncryptedCredentials()
    } catch (error) {
      if (error.code === 'COR-14') {
        return []
      } else {
        throw error
      }
    }

    if (blobs.length === 0) {
      return []
    }

    const credentials = await this.walletStorageService.decryptCredentials(blobs)

    const encryptedCredentials = this.walletStorageService.filterCredentials(credentialShareRequestToken, credentials)

    return encryptedCredentials
  }

  /**
   * @description Delete credential by id
   * @param id - id of the credential
   */
  async deleteCredential(id: string): Promise<void> {
    let blobs

    try {
      blobs = await this.walletStorageService.fetchEncryptedCredentials()
    } catch (error) {
      if (error.code === 'COR-14') {
        throw new __dangerous.SdkError('COR-14')
      } else {
        throw error
      }
    }

    await this.walletStorageService.decryptCredentials(blobs)

    const credentialIndexToDelete = this.walletStorageService.findCredentialIndexById(id)

    return this.deleteCredentialByIndex(credentialIndexToDelete)
  }
}
