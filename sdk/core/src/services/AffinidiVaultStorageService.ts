import { AffinidiVaultApiService } from '@affinidi/internal-api-clients'
import { profile } from '@affinidi/tools-common'

import { extractSDKVersion } from '../_helpers'
import { CredentialLike } from '../dto/internal'
import { VaultCredential } from '../dto/vault.dto'
import { DidAuthAdapter } from '../shared/DidAuthAdapter'
import AffinidiVaultEncryptionService from './AffinidiVaultEncryptionService'

type AffinidiVaultStorageOptions = {
  didAuthAdapter: DidAuthAdapter
  accessApiKey: string
  vaultUrl: string
}

@profile()
export default class AffinidiVaultStorageService {
  private _encryptionService
  private _vaultApiService

  constructor(encryptionService: AffinidiVaultEncryptionService, options: AffinidiVaultStorageOptions) {
    this._encryptionService = encryptionService
    this._vaultApiService = new AffinidiVaultApiService({
      vaultUrl: options.vaultUrl,
      accessApiKey: options.accessApiKey,
      sdkVersion: extractSDKVersion(),
      didAuthAdapter: options.didAuthAdapter,
    })
  }

  public async saveCredentials(credentials: CredentialLike[], storageRegion: string): Promise<VaultCredential[]> {
    const responses: VaultCredential[] = []

    const encryptedCredentials = await this._encryptionService.encryptCredentials(
      credentials.map((credential) => ({ credential })),
    )

    for (const credential of encryptedCredentials) {
      const { body } = await this._vaultApiService.storeCredential(storageRegion, credential.idHash, {
        credentialTypes: credential.typeHashes,
        payload: credential.cyphertext,
      })

      responses.push(body)
    }

    return responses
  }

  public async searchCredentials(storageRegion: string, types?: string[][]): Promise<CredentialLike[]> {
    const hashedTypes = types ? await this._encryptionService.computeTypesHashes(types) : undefined

    const { body } = await this._vaultApiService.searchCredentials(storageRegion, hashedTypes)
    const credentials = await this._encryptionService.decryptCredentials(body.credentials)

    return credentials
  }

  public async getCredentialById(credentialId: string, storageRegion: string): Promise<CredentialLike> {
    const hashedId = await this._encryptionService.computeHashedId(credentialId)
    const { body } = await this._vaultApiService.getCredential(storageRegion, hashedId)

    const credential = await this._encryptionService.decryptCredential(body)

    return credential
  }

  public async deleteCredentialById(credentialId: string, storageRegion: string): Promise<void> {
    const hashedId = await this._encryptionService.computeHashedId(credentialId)

    await this._vaultApiService.deleteCredential(storageRegion, hashedId)
  }

  public async deleteAllCredentials(storageRegion: string): Promise<void> {
    const { body } = await this._vaultApiService.searchCredentials(storageRegion)

    // this could have perfomance problems when need delete big amount of credentials
    // probably can use some kind of concurrency, but it is unknown what behavior will be at each platform
    for (const credential of body.credentials) {
      await this._vaultApiService.deleteCredential(storageRegion, credential.credentialId)
    }
  }
}
