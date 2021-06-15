import { KeysService, profile } from '@affinidi/common'
import { __dangerous } from '@affinidi/wallet-core-sdk'
import { FetchCredentialsPaginationOptions } from '@affinidi/wallet-core-sdk/dist/dto/shared.dto'
import platformEncryptionTools from '../PlatformEncryptionTools'

@profile()
export default class WalletStorageService extends __dangerous.WalletStorageService {
  _keysService: KeysService
  _credentialsIdsAndIndexesMap: any

  constructor(encryptedSeed: string, password: string, options: any = {}) {
    super(encryptedSeed, password, options)

    this._keysService = new KeysService(encryptedSeed, password)
    this._credentialsIdsAndIndexesMap = {}
  }

  async createEncryptedMessageByMyKey(object: any) {
    const publicKeyBuffer = this._keysService.getOwnPublicKey()
    const encryptedMessage = await platformEncryptionTools.encryptByPublicKey(publicKeyBuffer, object)
    return encryptedMessage
  }

  private async encryptCredentials(data: any[]) {
    const encryptedCredentials = []

    for (const item of data) {
      const cyphertext = await this.createEncryptedMessageByMyKey(item)

      encryptedCredentials.push(cyphertext)
    }

    return encryptedCredentials
  }

  async saveUnencryptedCredentials(data: any[], storageRegion?: string) {
    const encryptedCredentials = await this.encryptCredentials(data)
    return await this.saveCredentials(encryptedCredentials, storageRegion)
  }

  async fetchAllDecryptedCredentials() {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const allBlobs = await this.fetchAllBlobs()
    const allCredentials = []
    for (const blob of allBlobs) {
      const credential = await platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)
      allCredentials.push(credential)
    }

    return allCredentials
  }

  async fetchDecryptedCredentials(fetchCredentialsPaginationOptions: FetchCredentialsPaginationOptions) {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const blobs = await this.fetchEncryptedCredentials(fetchCredentialsPaginationOptions)
    const credentials = []
    for (const blob of blobs) {
      const credential = await platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)
      credentials.push(credential)
    }

    return credentials
  }

  async findCredentialIndexById(id: string) {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const allBlobs = await this.fetchAllBlobs()
    for (const blob of allBlobs) {
      const credential = await platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)
      const isW3cCredential = __dangerous.isW3cCredential(credential)

      let credentialId = credential.id

      if (!isW3cCredential && credential.data) {
        credentialId = credential.data.id
      }

      if (credentialId && credentialId == id) {
        return blob.id
      }
    }

    throw new __dangerous.SdkError('COR-23', { id })
  }
}
