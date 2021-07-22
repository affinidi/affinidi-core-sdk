import { profile, KeysService } from '@affinidi/common'
import { BloomVaultApiService } from '@affinidi/internal-api-clients'

import { toRpcSig, ecsign } from 'ethereumjs-util'

import { IPlatformEncryptionTools } from '../shared/interfaces'
import SdkErrorFromCode from '../shared/SdkErrorFromCode'
import { FetchCredentialsPaginationOptions } from '../dto/shared.dto'
import { isW3cCredential } from '../_helpers'

const keccak256 = require('keccak256')
const secp256k1 = require('secp256k1')
const bip32 = require('bip32')

const jolocomIdentityKey = "m/73'/0'/0'/0" // eslint-disable-line

type BloomVaultStorageOptions = {
  accessApiKey: string
  vaultUrl: string
}

type PaginationOptions = {
  skip: number
  limit: number
}

/* istanbul ignore next */
const privateToPublic = (privateKey: Buffer): Buffer => {
  privateKey = Buffer.from(privateKey)
  return secp256k1.publicKeyCreate(privateKey, false).slice(1)
}

/* istanbul ignore next */
const publicToAddress = (publicKey: Buffer): Buffer => {
  publicKey = Buffer.from(publicKey)
  return keccak256(publicKey).slice(-20)
}

/* istanbul ignore next */
const hashPersonalMessage = (message: Buffer): Buffer => {
  const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${message.length.toString()}`, 'utf-8')
  return keccak256(Buffer.concat([prefix, message]))
}

@profile()
export default class BloomVaultStorageService {
  private _keysService: KeysService
  private _platformEncryptionTools: IPlatformEncryptionTools
  private _vaultApiService: BloomVaultApiService

  constructor(
    keysService: KeysService,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: BloomVaultStorageOptions,
  ) {
    this._keysService = keysService
    this._platformEncryptionTools = platformEncryptionTools
    this._vaultApiService = new BloomVaultApiService(options)
  }

  /* istanbul ignore next: private function */
  private _getVaultKeys() {
    const { seed } = this._keysService.decryptSeed()

    const privateKey = bip32.fromSeed(seed).derivePath(jolocomIdentityKey).privateKey
    const privateKeyHex = privateKey.toString('hex')

    const publicKey = privateToPublic(privateKey)
    const addressHex = publicToAddress(publicKey).toString('hex')

    return { addressHex, privateKeyHex }
  }

  /* istanbul ignore next: ethereumjs-util */
  private _signByVaultKeys(message: string, privateKey: string) {
    const sig = ecsign(hashPersonalMessage(Buffer.from(message)), Buffer.from(privateKey, 'hex'))

    return toRpcSig(sig.v, sig.r, sig.s)
  }

  /* istanbul ignore next: private function */
  private async _authorizeVcVault(storageRegion: string) {
    const { addressHex, privateKeyHex } = this._getVaultKeys()
    const didEth = `did:ethr:0x${addressHex}`

    const {
      body: { token },
    } = await this._vaultApiService.requestAuthToken({
      storageRegion,
      did: didEth,
    })

    const signature = this._signByVaultKeys(token, privateKeyHex)

    await this._vaultApiService.validateAuthToken({
      storageRegion,
      accessToken: token,
      signature,
      did: didEth,
    })

    return token
  }

  /* istanbul ignore next: private function */
  private async _deleteCredentialByIndex(accessToken: string, index: number, storageRegion: string): Promise<void> {
    try {
      // NOTE: deletes the data objects associated with the included access token
      //       and the included IDs starting with :start and ending with :end inclusive
      //       https://github.com/hellobloom/bloom-vault#delete-datastartend
      await this._vaultApiService.deleteCredentials({ accessToken, storageRegion, start: index, end: index })
    } catch (error) {
      throw new SdkErrorFromCode('COR-0', {}, error)
    }
  }

  /* istanbul ignore next: private function */
  private async _fetchEncryptedCredentialsWithPagination(
    paginationOptions: PaginationOptions,
    accessToken: string,
    storageRegion: string,
  ) {
    try {
      const { body: blobs } = await this._vaultApiService.getCredentials({
        accessToken,
        storageRegion: storageRegion,
        start: paginationOptions.skip,
        end: paginationOptions.skip + paginationOptions.limit - 1,
      })

      if (blobs.length === 0) {
        return undefined
      }

      return blobs.filter((blob) => blob.cyphertext !== null)
    } catch (error) {
      if (error.httpStatusCode === 404) {
        throw new SdkErrorFromCode('COR-14', {}, error)
      } else {
        throw error
      }
    }
  }

  private async _fetchAllBlobs(accessToken: string, storageRegion: string) {
    const fetch = this._fetchEncryptedCredentialsWithPagination
    type FetchReturnType = ReturnType<typeof fetch>
    type BlobsType = FetchReturnType extends Promise<infer U> ? NonNullable<U> : never

    const blobChunks: BlobsType[] = []
    const paginationOptions = this._getPaginationOptionsWithDefault()

    for (;;) {
      try {
        const blobs = await this._fetchEncryptedCredentialsWithPagination(paginationOptions, accessToken, storageRegion)
        paginationOptions.skip += paginationOptions.limit

        if (!blobs) {
          break
        }

        blobChunks.push(blobs)
      } catch (err) {
        if (err.code === 'COR-14') {
          break
        }

        throw err
      }
    }

    return blobChunks.flatMap((blobs) => blobs)
  }

  /* istanbul ignore next: private function */
  private async _findCredentialById(accessToken: string, id: string, storageRegion: string) {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const allBlobs = await this._fetchAllBlobs(accessToken, storageRegion)
    for (const blob of allBlobs) {
      const credential = await this._platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)

      let credentialId = credential?.id
      if (!isW3cCredential(credential)) {
        credentialId = credential?.data?.id
      }

      if (credentialId && credentialId === id) {
        return blob
      }
    }

    throw new SdkErrorFromCode('COR-23', { id })
  }

  /* istanbul ignore next: private function */
  private _filterCredentialsByTypes(types: string[][], credentials: any[]): any[] {
    const filteredCredentials = credentials.filter((credential) => {
      if (!isW3cCredential(credential)) return false
      return types.some((subtypes) => subtypes.every((subtype) => (credential?.type || []).includes(subtype)))
    })

    return filteredCredentials
  }

  /* istanbul ignore next: private function */
  private async _fetchAllDecryptedCredentials(accessToken: string, storageRegion: string): Promise<any[]> {
    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const allBlobs = await this._fetchAllBlobs(accessToken, storageRegion)
    const allCredentials: any[] = []
    for (const blob of allBlobs) {
      const credential = await this._platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, blob.cyphertext)
      allCredentials.push(credential)
    }

    return allCredentials
  }

  /* istanbul ignore next: private function */
  private _getPaginationOptionsWithDefault(
    fetchCredentialsPaginationOptions?: FetchCredentialsPaginationOptions,
  ): PaginationOptions {
    const { skip, limit } = fetchCredentialsPaginationOptions || {}

    return {
      skip: skip || 0,
      limit: limit || 100,
    }
  }

  public async searchCredentials(types: string[][], storageRegion: string): Promise<any[]> {
    const accessToken = await this._authorizeVcVault(storageRegion)

    const credentials = await this._fetchAllDecryptedCredentials(accessToken, storageRegion)

    if (types.length === 0) {
      return credentials
    }

    return this._filterCredentialsByTypes(types, credentials)
  }

  public async getCredentialById(credentialId: string, storageRegion: string): Promise<any> {
    const accessToken = await this._authorizeVcVault(storageRegion)

    const credentialBlob = await this._findCredentialById(accessToken, credentialId, storageRegion)

    const privateKeyBuffer = this._keysService.getOwnPrivateKey()
    const credential = await this._platformEncryptionTools.decryptByPrivateKey(
      privateKeyBuffer,
      credentialBlob.cyphertext,
    )

    return credential
  }

  public async deleteCredentialById(id: string, storageRegion: string): Promise<void> {
    const accessToken = await this._authorizeVcVault(storageRegion)
    const credentialBlob = await this._findCredentialById(accessToken, id, storageRegion)
    return this._deleteCredentialByIndex(accessToken, credentialBlob.id, storageRegion)
  }

  public async deleteAllCredentials(storageRegion: string): Promise<void> {
    const accessToken = await this._authorizeVcVault(storageRegion)

    try {
      await this._vaultApiService.deleteCredentials({ accessToken, storageRegion, start: 0, end: 99 })
    } catch (error) {
      throw new SdkErrorFromCode('COR-0', {}, error)
    }
  }
}
