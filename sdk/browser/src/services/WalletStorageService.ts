import { __dangerous } from '@affinidi/wallet-core-sdk'
import randomBytes from 'randombytes'

import KeysService from './KeysService'

export default class WalletStorageService extends __dangerous.WalletStorageService {
  _keysService: KeysService
  _credentialsIdsAndIndexesMap: any

  constructor(encryptedSeed: string, password: string, options: any = {}) {
    super(encryptedSeed, password, options)

    this._keysService = new KeysService(encryptedSeed, password)
    this._credentialsIdsAndIndexesMap = {}
  }

  async createEncryptedMessageByMyKey(object: any) {
    const { seed, didMethod } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    const publicKeyHex = KeysService.getPublicKey(seedHex, didMethod)

    const encryptedMessage = await this._keysService.encryptByPublicKey(publicKeyHex, object)

    return encryptedMessage
  }

  async encryptCredentials(data: any) {
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

  async decryptCredentials(blobs: any) {
    const decryptedCredentials = []

    /* istanbul ignore else: code simplicity */
    if (blobs && blobs.length) {
      for (const blob of blobs) {
        const credential = await this._keysService.decryptByPrivateKey(blob.cyphertext)
        const isW3cCredential = __dangerous.isW3cCredential(credential)

        let key = credential.id

        if (!isW3cCredential && credential.data) {
          key = credential.data.id
        }

        if (!key) {
          key = await randomBytes(8).toString('hex')
        }

        this._credentialsIdsAndIndexesMap[key] = blob.id

        decryptedCredentials.push(credential)
      }
    }

    return decryptedCredentials
  }

  findCredentialIndexById(id: string) {
    const credentialIndexToDelete = this._credentialsIdsAndIndexesMap[id]

    if (!credentialIndexToDelete && credentialIndexToDelete !== 0) {
      throw new __dangerous.SdkError('COR-23', { id })
    }

    return credentialIndexToDelete
  }
}
