import { CommonNetworkMember as CoreNetwork, __dangerous } from '@affinidi/wallet-core-sdk'
import { EventComponent } from '@affinidi/affinity-metrics-lib'

import KeysService from './services/KeysService'
import WalletStorageService from './services/WalletStorageService'
import { FetchCredentialsPaginationOptions } from '@affinidi/wallet-core-sdk/dist/dto/shared.dto'

type SdkOptions = __dangerous.SdkOptions & {
  issueSignupCredential?: boolean
}

const COMPONENT = EventComponent.AffinidiBrowserSDK

export class AffinityWallet extends CoreNetwork {
  keysService: KeysService
  walletStorageService: WalletStorageService

  constructor(
    password: string,
    encryptedSeed: string,
    options: __dangerous.SdkOptions = {},
    component: EventComponent = COMPONENT,
  ) {
    super(password, encryptedSeed, options, component)

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
    options = Object.assign({}, CoreNetwork.setEnvironmentVarialbles(options), options)

    let affinityWallet
    // NOTE: loginToken = '{"ChallengeName":"CUSTOM_CHALLENGE","Session":"...","ChallengeParameters":{"USERNAME":"...","email":"..."}}'
    //       signUpToken = 'username::password'
    const isSignUpToken = token.split('::')[1] !== undefined

    if (isSignUpToken) {
      affinityWallet = await this.confirmSignUp(token, confirmationCode, options)

      return { isNew: true, commonNetworkMember: affinityWallet }
    }

    const parentWallet = await this.completeLoginChallenge(token, confirmationCode, options)

    // affinityWallet = await AffinityWallet.init(options)
    const { password, encryptedSeed } = parentWallet
    const cognitoUserTokens = parentWallet.cognitoUserTokens
    options.cognitoUserTokens = cognitoUserTokens
    affinityWallet = new AffinityWallet(password, encryptedSeed, options)

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
    options = Object.assign({}, CoreNetwork.setEnvironmentVarialbles(options), options)
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
   * @description Retrieve only the credential at given index
   * @param credentialIndex - index for the VC in vault
   * @returns a single VC
   */
  async getCredentialByIndex(credentialIndex: number): Promise<any> {
    const paginationOptions: FetchCredentialsPaginationOptions = { skip: credentialIndex, limit: 1 }
    const blobs = await this.walletStorageService.fetchEncryptedCredentials(paginationOptions)

    if (blobs.length < 1) {
      throw new __dangerous.SdkError('COR-14')
    }

    const decryptedCredentials = await this.walletStorageService.decryptCredentials(blobs)
    return decryptedCredentials[0]
  }

  /**
   * @description Finds the given credentialShareRequestToken by searching all of your credentials
   * If a token is not given, only returns the given subset of the credentials
   * 1. pull encrypted VCs (all if token given, otherwise with the given pagination)
   * 2. decrypt encrypted VCs
   * 3. filter VCs by type
   * @param credentialShareRequestToken - JWT received from verifier
   * @param paginationOptions - optional range for credentials to be pulled (default is skip: 0, limit: 100)
   * @returns array of VCs
   */
  async getCredentials(
    credentialShareRequestToken: string = null,
    paginationOptions?: FetchCredentialsPaginationOptions,
  ): Promise<any> {
    if (credentialShareRequestToken) {
      return this._getCredentialsWithCredentialShareRequestToken(credentialShareRequestToken)
    }

    let blobs

    try {
      blobs = await this.walletStorageService.fetchEncryptedCredentials(paginationOptions)
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

    return this.walletStorageService.decryptCredentials(blobs)
  }

  private async _getCredentialsWithCredentialShareRequestToken(credentialShareRequestToken: string): Promise<any> {
    let result: any[] = []

    for await (const blobs of this.walletStorageService.fetchAllEncryptedCredentialsInBatches()) {
      const credentials = await this.walletStorageService.decryptCredentials(blobs)

      const matchedCredentials = this.walletStorageService.filterCredentials(credentialShareRequestToken, credentials)

      result = result.concat(matchedCredentials)
    }

    return result
  }

  /**
   * @description Delete credential by id if found in given range
   * @param id - id of the credential
   * @param credentialIndex - credential to remove
   */
  async deleteCredential(id?: string, credentialIndex?: number): Promise<void> {
    if ((credentialIndex !== undefined && id) || (!id && credentialIndex === undefined)) {
      throw new __dangerous.SdkError('COR-1', {
        errors: [{ message: 'should pass either id or credentialIndex and not both at the same time' }],
      })
    }

    if (credentialIndex) {
      return this.deleteCredentialByIndex(credentialIndex.toString())
    }

    let allBlobs: any[] = []

    for await (const blobs of this.walletStorageService.fetchAllEncryptedCredentialsInBatches()) {
      allBlobs = allBlobs.concat(blobs)
    }

    await this.walletStorageService.decryptCredentials(allBlobs)

    const credentialIndexToDelete = this.walletStorageService.findCredentialIndexById(id)

    return this.deleteCredentialByIndex(credentialIndexToDelete)
  }
}
