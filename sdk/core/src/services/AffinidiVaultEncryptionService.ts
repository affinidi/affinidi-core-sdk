import { KeysService } from '@affinidi/common'
import { profile } from '@affinidi/tools-common'

import { isW3cCredential } from '../_helpers'
import { CredentialLike } from '../dto/internal'
import { VaultCredential } from '../dto/vault.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'

type OriginalCredential = {
  credential: CredentialLike
}

type EncryptedCredential<TOriginal> = {
  idHash: string
  typeHashes: string[]
  cyphertext: string
  originalCredential: TOriginal
}

@profile()
export default class AffinidiVaultEncryptionService {
  private _keysService
  private _platformCryptographyTools

  constructor(keysService: KeysService, platformCryptographyTools: IPlatformCryptographyTools) {
    this._keysService = keysService
    this._platformCryptographyTools = platformCryptographyTools
  }

  async encryptCredentials<TOriginal extends OriginalCredential>(
    credentials: TOriginal[],
  ): Promise<EncryptedCredential<TOriginal>[]> {
    const publicKeyBuffer = this._keysService.getOwnPublicKey()
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const encryptedCredentials: EncryptedCredential<TOriginal>[] = []

    for (const originalCredential of credentials) {
      const { credential } = originalCredential
      const credentialId = isW3cCredential(credential) ? credential.id : credential.data.id

      const idHash = await this._platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialId)

      const typeHashes: string[] = []
      if (isW3cCredential(credential)) {
        for (const credentialType of credential.type) {
          const typeHash = await this._platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialType)
          typeHashes.push(typeHash)
        }
      }

      const cyphertext = await this._platformCryptographyTools.encryptByPublicKey(publicKeyBuffer, credential)

      encryptedCredentials.push({
        idHash,
        typeHashes,
        cyphertext,
        originalCredential,
      })
    }

    return encryptedCredentials
  }

  async computeTypesHashes(types: string[][]): Promise<string[][]> {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    const hashedTypes: string[][] = []
    for (const subset of types) {
      const hashedSubset: string[] = []
      for (const type of subset) {
        const hashedType = await this._platformCryptographyTools.computePersonalHash(privateKeyBuffer, type)
        hashedSubset.push(hashedType)
      }

      hashedTypes.push(hashedSubset)
    }

    return hashedTypes
  }

  async decryptCredentials(encryptedCredentials: VaultCredential[]): Promise<CredentialLike[]> {
    const credentials: CredentialLike[] = []

    for (const encryptedCredential of encryptedCredentials) {
      try {
        const credential = await this.decryptCredential(encryptedCredential)
        credentials.push(credential)
      } catch (error) {
        // ignore corrupted credentials and return valid credentials
      }
    }

    return credentials
  }

  async decryptCredential(encryptedCredential: VaultCredential): Promise<CredentialLike> {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()

    const credential = await this._platformCryptographyTools.decryptByPrivateKey(
      privateKeyBuffer,
      encryptedCredential.payload,
    )

    return credential
  }

  async computeHashedId(credentialId: string) {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const hashedId = await this._platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialId)

    return hashedId
  }
}
