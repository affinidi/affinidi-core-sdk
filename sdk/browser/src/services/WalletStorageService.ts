import { __dangerous } from '@affinidi/wallet-core-sdk'
import { FetchCredentialsPaginationOptions } from '@affinidi/wallet-core-sdk/dist/dto/shared.dto'

import KeysService from './KeysService'

export default class WalletStorageService extends __dangerous.WalletStorageService {
  _keysService: KeysService

  constructor(encryptedSeed: string, password: string, options: any = {}) {
    super(encryptedSeed, password, options)

    this._keysService = new KeysService(encryptedSeed, password)
  }

  async createEncryptedMessageByMyKey(object: any) {
    const { seed, didMethod } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    const publicKeyHex = KeysService.getPublicKey(seedHex, didMethod)

    const encryptedMessage = await this._keysService.encryptByPublicKey(publicKeyHex, object)

    return encryptedMessage
  }

  private async encryptCredentials(data: any) {
    const encryptedCredentials = []

    /* istanbul ignore else: code simplicity */
    if (data.length && data.length > 0) {
      for (const item of data) {
        const cyphertext = await this.createEncryptedMessageByMyKey(item)

        encryptedCredentials.push(cyphertext)
      }
    }

    return encryptedCredentials
  }

  async saveUnencryptedCredentials(data: any, storageRegion?: string) {
    const encryptedCredentials = await this.encryptCredentials(data)
    return await this.saveCredentials(encryptedCredentials, storageRegion)
  }

  async fetchAllDecryptedCredentials() {
    const allBlobs = await this.fetchAllBlobs()
    const allCredentials = []
    for (const blob of allBlobs) {
      const credential = await this._keysService.decryptByPrivateKey(blob.cyphertext)
      allCredentials.push(credential)
    }

    return allCredentials
  }

  async fetchDecryptedCredentials(fetchCredentialsPaginationOptions: FetchCredentialsPaginationOptions) {
    const blobs = await this.fetchEncryptedCredentials(fetchCredentialsPaginationOptions)
    const credentials = []
    for (const blob of blobs) {
      const credential = await this._keysService.decryptByPrivateKey(blob.cyphertext)
      credentials.push(credential)
    }

    return credentials
  }

  async findCredentialIndexById(id: string) {
    const allBlobs = await this.fetchAllBlobs()

    for (const blob of allBlobs) {
      const credential = await this._keysService.decryptByPrivateKey(blob.cyphertext)
      const isW3cCredential = __dangerous.isW3cCredential(credential)

      let credentialId = credential.id

      if (!isW3cCredential && credential.data) {
        credentialId = credential.data.id
      }

      if (credentialId && credentialId === id) {
        return blob.id
      }
    }

    throw new __dangerous.SdkError('COR-23', { id })
  }
}
