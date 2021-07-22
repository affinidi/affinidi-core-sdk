import { profile, KeysService } from '@affinidi/common'
import { AffinidiVaultApiService } from '@affinidi/internal-api-clients'
import { DidAuthService } from '@affinidi/affinidi-did-auth-lib'

import { IPlatformEncryptionTools } from '../shared/interfaces'
import { VaultCredential } from '../dto/vault.dto'
import { isW3cCredential } from '../_helpers'

type AffinidiVaultStorageOptions = {
  accessApiKey: string
  audienceDid: string
  vaultUrl: string
}

@profile()
export default class AffinidiVaultStorageService {
  private _audienceDid: string
  private _didAuthService: DidAuthService
  private _keysService: KeysService
  private _platformEncryptionTools: IPlatformEncryptionTools
  private _vaultApiService: AffinidiVaultApiService

  constructor(
    didAuthService: DidAuthService,
    keysService: KeysService,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: AffinidiVaultStorageOptions,
  ) {
    this._audienceDid = options.audienceDid
    this._didAuthService = didAuthService
    this._keysService = keysService
    this._platformEncryptionTools = platformEncryptionTools
    this._vaultApiService = new AffinidiVaultApiService(options)
  }

  private async _authorizeVcVault(): Promise<string> {
    const { body } = await this._vaultApiService.createDidAuthRequest({ audienceDid: this._audienceDid })
    const responseToken = await this._didAuthService.createDidAuthResponseToken(body)
    return responseToken
  }

  private async _encryptCredentials(credentials: any[]): Promise<VaultCredential[]> {
    const publicKeyBuffer = this._keysService.getOwnPublicKey()
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const encryptedCredentials: VaultCredential[] = []

    for (const credential of credentials) {
      let credentialId = credential?.id
      if (!isW3cCredential(credential)) {
        credentialId = credential?.data?.id
      }

      const credentialIdHash = await this._platformEncryptionTools.computePersonalHash(privateKeyBuffer, credentialId)

      const typeHashes = []
      if (isW3cCredential(credential)) {
        for (const credentialType of credential.type) {
          const typeHash = await this._platformEncryptionTools.computePersonalHash(privateKeyBuffer, credentialType)
          typeHashes.push(typeHash)
        }
      }

      const cyphertext = await this._platformEncryptionTools.encryptByPublicKey(publicKeyBuffer, credential)

      encryptedCredentials.push({
        credentialId: credentialIdHash,
        credentialTypes: typeHashes,
        payload: cyphertext,
      })
    }

    return encryptedCredentials
  }

  private async _computeTypesHashes(types: string[][]): Promise<string[][]> {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    const hashedTypes: string[][] = []
    for (const subset of types) {
      const hashedSubset: string[] = []
      for (const type of subset) {
        const hashedType = await this._platformEncryptionTools.computePersonalHash(privateKeyBuffer, type)
        hashedSubset.push(hashedType)
      }

      hashedTypes.push(hashedSubset)
    }

    return hashedTypes
  }

  private async _decryptCredentials(encryptedCredentials: VaultCredential[]): Promise<any[]> {
    const credentials: any[] = []

    for (const encryptedCredential of encryptedCredentials) {
      const credential = await this._decryptCredential(encryptedCredential)
      credentials.push(credential)
    }

    return credentials
  }

  private async _decryptCredential(encryptedCredential: VaultCredential): Promise<any> {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    const credential = await this._platformEncryptionTools.decryptByPrivateKey(
      privateKeyBuffer,
      encryptedCredential.payload,
    )

    return credential
  }

  public async saveCredentials(credentials: any[], storageRegion: string): Promise<VaultCredential[]> {
    const token = await this._authorizeVcVault()

    const responses = []

    const encryptedCredentials = await this._encryptCredentials(credentials)

    for (const credential of encryptedCredentials) {
      const { body } = await this._vaultApiService.storeCredential(token, storageRegion, credential.credentialId, {
        credentialTypes: credential.credentialTypes,
        payload: credential.payload,
      })

      responses.push(body)
    }

    return responses
  }

  public async searchCredentials(storageRegion: string, types?: string[][]): Promise<any[]> {
    const token = await this._authorizeVcVault()

    const hashedTypes = types ? await this._computeTypesHashes(types) : undefined

    const { body } = await this._vaultApiService.searchCredentials(token, storageRegion, hashedTypes)
    const credentials = await this._decryptCredentials(body.credentials)

    return credentials
  }

  public async getCredentialById(credentialId: string, storageRegion: string): Promise<any> {
    const token = await this._authorizeVcVault()
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    const hashedId = await this._platformEncryptionTools.computePersonalHash(privateKeyBuffer, credentialId)
    const { body } = await this._vaultApiService.getCredential(token, storageRegion, hashedId)

    const credential = await this._decryptCredential(body)

    return credential
  }

  public async deleteCredentialById(credentialId: string, storageRegion: string): Promise<void> {
    const token = await this._authorizeVcVault()

    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const hashedId = await this._platformEncryptionTools.computePersonalHash(privateKeyBuffer, credentialId)

    await this._vaultApiService.deleteCredential(token, storageRegion, hashedId)
  }

  public async deleteAllCredentials(storageRegion: string): Promise<void> {
    const token = await this._authorizeVcVault()
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    const credentials = await this.searchCredentials(storageRegion)

    // this could have perfomance problems when need delete big amount of credentials
    // probably can use some kind of concurrency, but it is unknown what behavior will be at each platform
    for (const credential of credentials) {
      let credentialId = credential?.id
      if (!isW3cCredential(credential)) {
        credentialId = credential?.data?.id
      }

      const hashedId = await this._platformEncryptionTools.computePersonalHash(privateKeyBuffer, credentialId)

      await this._vaultApiService.deleteCredential(token, storageRegion, hashedId)
    }
  }
}
