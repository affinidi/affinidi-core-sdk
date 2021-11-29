import { KeysService } from '@affinidi/common'
import { profile } from '@affinidi/tools-common'

import { isW3cCredential } from '../_helpers'
import { VaultCredential } from '../dto/vault.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'

@profile()
export default class AffinidiVaultEncryptionService {
  private _keysService
  private _platformCryptographyTools

  constructor(keysService: KeysService, platformCryptographyTools: IPlatformCryptographyTools) {
    this._keysService = keysService
    this._platformCryptographyTools = platformCryptographyTools
  }

  // TODO: Make this private; it is only used by migration service
  async encryptCredentials(credentials: any[]): Promise<VaultCredential[]> {
    const publicKeyBuffer = this._keysService.getOwnPublicKey()
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const encryptedCredentials: VaultCredential[] = []

    for (const credential of credentials) {
      let credentialId = credential?.id
      if (!isW3cCredential(credential)) {
        credentialId = credential?.data?.id
      }

      const credentialIdHash = await this._platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialId)

      const typeHashes = []
      if (isW3cCredential(credential)) {
        for (const credentialType of credential.type) {
          const typeHash = await this._platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialType)
          typeHashes.push(typeHash)
        }
      }

      const cyphertext = await this._platformCryptographyTools.encryptByPublicKey(publicKeyBuffer, credential)

      encryptedCredentials.push({
        credentialId: credentialIdHash,
        credentialTypes: typeHashes,
        payload: cyphertext,
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

  async decryptCredentials(encryptedCredentials: VaultCredential[]): Promise<any[]> {
    const credentials: any[] = []

    for (const encryptedCredential of encryptedCredentials) {
      const credential = await this.decryptCredential(encryptedCredential)
      credentials.push(credential)
    }

    return credentials
  }

  async decryptCredential(encryptedCredential: VaultCredential): Promise<any> {
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
