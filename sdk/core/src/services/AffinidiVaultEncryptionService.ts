import { KeyManager } from '@affinidi/common'
import { profile } from '@affinidi/tools-common'

import { isW3cCredential } from '../_helpers'
import { CredentialLike } from '../dto/internal'
import { VaultCredential } from '../dto/vault.dto'

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
  private _keyManager: KeyManager

  constructor(keyManager: KeyManager) {
    this._keyManager = keyManager
  }

  async encryptCredentials<TOriginal extends OriginalCredential>(
    credentials: TOriginal[],
  ): Promise<EncryptedCredential<TOriginal>[]> {
    const encryptedCredentials: EncryptedCredential<TOriginal>[] = []

    for (const originalCredential of credentials) {
      const { credential } = originalCredential
      const credentialId = isW3cCredential(credential) ? credential.id : credential.data.id

      const idHash = await this._keyManager.computePersonalHash(credentialId)

      const typeHashes: string[] = []
      if (isW3cCredential(credential)) {
        for (const credentialType of credential.type) {
          const typeHash = await this._keyManager.computePersonalHash(credentialType)
          typeHashes.push(typeHash)
        }
      }

      const cyphertext = await this._keyManager.encryptByPublicKey(credential)

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
    const hashedTypes: string[][] = []
    for (const subset of types) {
      const hashedSubset: string[] = []
      for (const type of subset) {
        const hashedType = await this._keyManager.computePersonalHash(type)
        hashedSubset.push(hashedType)
      }

      hashedTypes.push(hashedSubset)
    }

    return hashedTypes
  }

  async decryptCredentials(encryptedCredentials: VaultCredential[]): Promise<CredentialLike[]> {
    let credentials: CredentialLike[] = []

    const decryptCredentialsPromises = encryptedCredentials.map(async (encryptedCredential) => {
      try {
        const result = await this.decryptCredential(encryptedCredential)
        return result
      } catch (error) {
        console.log('error decryptCredential', error)
      }
    })
    const data = await Promise.all(decryptCredentialsPromises)
    credentials = data.filter((credential) => !!credential)
    return credentials
  }

  async decryptCredential(encryptedCredential: VaultCredential): Promise<CredentialLike> {
    const credential = await this._keyManager.decryptByPrivateKey(encryptedCredential.payload)

    return credential
  }

  async computeHashedId(credentialId: string) {
    const hashedId = await this._keyManager.computePersonalHash(credentialId)

    return hashedId
  }
}
