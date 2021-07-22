import { JwtService, KeysService, profile } from '@affinidi/common'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import { DidAuthService } from '@affinidi/affinidi-did-auth-lib'

import { Env } from '../dto/shared.dto'

import { IPlatformEncryptionTools } from '../shared/interfaces'
import { STAGING_KEY_STORAGE_URL } from '../_defaultConfig'

import { SignedCredential } from '../dto/shared.dto'
import SdkErrorFromCode from '../shared/SdkErrorFromCode'
import AffinidiVaultStorageService from './AffinidiVaultStorageService'
import BloomVaultStorageService from './BloomVaultStorageService'

const createHash = require('create-hash')

const sha256 = (data: unknown) => {
  return createHash('sha256').update(data).digest()
}

type ConstructorOptions = {
  bloomVaultUrl: string
  affinidiVaultUrl: string
  storageRegion: string
  accessApiKey: string
  audienceDid: string
}

@profile()
export default class WalletStorageService {
  private _storageRegion: string
  private _bloomVaultStorageService: BloomVaultStorageService
  private _affinidiVaultStorageService: AffinidiVaultStorageService

  constructor(
    didAuthService: DidAuthService,
    keysService: KeysService,
    platformEncryptionTools: IPlatformEncryptionTools,
    options: ConstructorOptions,
  ) {
    this._storageRegion = options.storageRegion

    this._affinidiVaultStorageService = new AffinidiVaultStorageService(
      didAuthService,
      keysService,
      platformEncryptionTools,
      {
        accessApiKey: options.accessApiKey,
        audienceDid: options.audienceDid,
        vaultUrl: options.affinidiVaultUrl,
      },
    )

    this._bloomVaultStorageService = new BloomVaultStorageService(keysService, platformEncryptionTools, {
      accessApiKey: options.accessApiKey,
      vaultUrl: options.bloomVaultUrl,
    })
  }

  static hashFromString(data: string): string {
    const buffer = sha256(Buffer.from(data))

    return buffer.toString('hex')
  }

  static async getCredentialOffer(
    accessToken: string,
    keyStorageUrl: string,
    options: { env: Env; accessApiKey: string },
  ): Promise<string> {
    keyStorageUrl = keyStorageUrl || STAGING_KEY_STORAGE_URL
    const { accessApiKey, env } = options
    const service = new KeyStorageApiService({ keyStorageUrl, accessApiKey })
    const { body } = await service.getCredentialOffer({ accessToken, env })
    const { offerToken } = body
    return offerToken
  }

  static async getSignedCredentials(
    accessToken: string,
    credentialOfferResponseToken: string,
    options: { keyStorageUrl?: string; issuerUrl?: string; accessApiKey?: string; apiKey?: string } = {},
  ): Promise<SignedCredential[]> {
    const keyStorageUrl = options.keyStorageUrl || STAGING_KEY_STORAGE_URL
    const { issuerUrl, accessApiKey, apiKey } = options
    const service = new KeyStorageApiService({ keyStorageUrl, accessApiKey })
    const { body } = await service.getSignedCredential(accessToken, {
      credentialOfferResponseToken,
      options: { issuerUrl, accessApiKey, apiKey },
    })

    const { signedCredentials } = body

    return signedCredentials as SignedCredential[]
  }

  private async _getCredentialsByTypes(storageRegion?: string, types?: string[][]) {
    storageRegion = storageRegion || this._storageRegion

    const credentials = await this._affinidiVaultStorageService.searchCredentials(storageRegion, types)

    // should be deleted during migration to affinidi-vault Phase #2
    const bloomCredentials = await this._bloomVaultStorageService.searchCredentials(storageRegion, types)

    return [...credentials, ...bloomCredentials]
  }

  public async saveCredentials(credentials: any[], storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    const responses = await this._affinidiVaultStorageService.saveCredentials(credentials, storageRegion)

    return responses
  }

  public async getAllCredentials(storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    const credentials = await this._affinidiVaultStorageService.searchCredentials(storageRegion)

    // should be deleted during migration to affinidi-vault Phase #2
    const bloomCredentials = await this._bloomVaultStorageService.searchCredentials(storageRegion)

    const uniqueList = new Set([...credentials, ...bloomCredentials])
    return uniqueList.values()
  }

  public async getCredentialsByShareToken(token: string, storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    if (!token) {
      return this.getAllCredentials()
    }

    const request = JwtService.fromJWT(token)
    const {
      payload: {
        interactionToken: { credentialRequirements },
      },
    } = request

    if (!credentialRequirements) {
      return this.getAllCredentials()
    }

    const requirementTypes = credentialRequirements.map(
      (credentialRequirement: { type: string[] }) => credentialRequirement.type,
    )

    return this._getCredentialsByTypes(storageRegion, requirementTypes)
  }

  public async getCredentialById(credentialId: string, storageRegion?: string): Promise<any> {
    storageRegion = storageRegion || this._storageRegion

    try {
      return await this._affinidiVaultStorageService.getCredentialById(credentialId, storageRegion)
    } catch (error) {
      if (error.code !== 'AVT-2') {
        throw error
      }

      // should be deleted during migration to affinidi-vault Phase #2
      return await this._bloomVaultStorageService.getCredentialById(credentialId, storageRegion)
    }
  }

  public async deleteCredentialById(credentialId: string, storageRegion?: string) {
    storageRegion = storageRegion || this._storageRegion

    try {
      await this._affinidiVaultStorageService.deleteCredentialById(credentialId, storageRegion)
    } catch (error) {
      if (error.code !== 'AVT-2') {
        throw error
      }

      // should be deleted during migration to affinidi-vault Phase #2
      await this._bloomVaultStorageService.deleteCredentialById(credentialId, storageRegion)
    }
  }

  public async deleteAllCredentials(storageRegion?: string): Promise<void> {
    storageRegion = storageRegion || this._storageRegion

    try {
      await this._affinidiVaultStorageService.deleteAllCredentials(storageRegion)
    } catch (error) {
      throw new SdkErrorFromCode('COR-0', {}, error)
    }

    try {
      await this._bloomVaultStorageService.deleteAllCredentials(storageRegion)
    } catch (error) {
      throw new SdkErrorFromCode('COR-0', {}, error)
    }
  }
}

type PaginationOptions = {
  skip: number
  limit: number
}
