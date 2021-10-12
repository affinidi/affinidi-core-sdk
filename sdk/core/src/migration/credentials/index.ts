import { DidAuthAdapter } from '@affinidi/internal-api-clients'
import { DidAuthService } from './DidAuthService'
import ApiService from './ApiService'
import { isW3cCredential } from '../../_helpers'
import { KeysService } from '@affinidi/common'
import { IPlatformCryptographyTools } from '../../shared/interfaces'
const packageInfo = require('../../../package.json')

const environment = process.env.ENVIRONMENT || 'dev'
const version = packageInfo.version
const VAULT_MIGRATION_SERVICE_URL = `https://vault-migration-service.${environment}.affinity-project.org`

interface vcMigrationList {
  bloomVaultIndex: number
  id: string
  types: string[]
  payload: string
}

/**
 * Provides bunch of methods that helps to achieve smooth and
 * silent client's VCs migration from `bloom-vault` into `affinidi-vault`.
 * All migration code concentrate in one place(or in `bloom-vault` part) for easy deprecation process.
 */
export class MigrationHelper {
  private didAuthService: DidAuthService
  private readonly baseUrl: string
  private auth: string
  private keysService: KeysService
  private platformCryptographyTools: IPlatformCryptographyTools
  private readonly apiKey: string
  private readonly api: ApiService
  private readonly bloomDid: string

  constructor(
    didAuthAdapter: DidAuthAdapter,
    apiKey: string,
    keysService: KeysService,
    platformCryptographyTools: IPlatformCryptographyTools,
    bloomDid: string,
  ) {
    this.baseUrl = VAULT_MIGRATION_SERVICE_URL
    this.didAuthService = new DidAuthService(didAuthAdapter, this.apiKey, this.baseUrl)
    this.keysService = keysService
    this.platformCryptographyTools = platformCryptographyTools
    this.apiKey = apiKey
    this.api = new ApiService(this.baseUrl, {
      'Api-Key': apiKey,
      'X-SDK-Version': version,
    })
    this.bloomDid = bloomDid
  }

  /**
   * Fetches authorization token to `vault-migration-service`
   */
  private async getAuth(): Promise<string> {
    if (this.auth && !this.didAuthService.isTokenExpired(this.auth, Date.now())) {
      return this.auth
    }

    const requestToken = await this.didAuthService.pullDidAuthRequestToken()
    this.auth = await this.didAuthService.createDidAuthResponseToken(requestToken)

    return this.auth
  }

  /**
   * Copy of the private method of `AffinidiVaultStorageService`
   * @param credentials
   * @private
   */
  private async encryptCredentials(credentials: any[]): Promise<vcMigrationList[]> {
    const publicKeyBuffer = this.keysService.getOwnPublicKey()
    const privateKeyBuffer = this.keysService.getOwnPrivateKey()
    const encryptedCredentials: vcMigrationList[] = []

    for (const credential of credentials) {
      let credentialId = credential?.id
      if (!isW3cCredential(credential)) {
        credentialId = credential?.data?.id
      }

      const credentialIdHash = await this.platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialId)

      const typeHashes = []
      if (isW3cCredential(credential)) {
        for (const credentialType of credential.type) {
          const typeHash = await this.platformCryptographyTools.computePersonalHash(privateKeyBuffer, credentialType)
          typeHashes.push(typeHash)
        }
      }

      const cyphertext = await this.platformCryptographyTools.encryptByPublicKey(publicKeyBuffer, credential)

      encryptedCredentials.push({
        id: credentialIdHash,
        types: typeHashes,
        payload: cyphertext,
        bloomVaultIndex: credential.bloomId,
      })
    }

    return encryptedCredentials
  }

  /**
   * Initiate VCs migration on bloom-vault VC READ event.
   * @param credentials
   */
  async runMigration(credentials: any[]): Promise<void> {
    const encryptedVCs = await this.encryptCredentials(credentials)
    await this.runMigrationByChunk(encryptedVCs, 100)
  }

  /**
   * Divides given encrypted VCs list into chunks and run migration
   * @param encryptedVCs
   * @param chunk
   */
  async runMigrationByChunk(encryptedVCs: any[], chunk: number): Promise<void> {
    for (let i = 0, L = encryptedVCs.length; i < L; i += chunk) {
      const chunkedVCList = encryptedVCs.slice(i, i + chunk)
      await this.migrateCredentials(chunkedVCList)
    }
  }

  /**
   * Gets migration status for user with given token
   */
  async getMigrationStatus(): Promise<{ status: string }> {
    const token = await this.getAuth()
    const url = `${this.baseUrl}/api/v1/migrationStatus`
    return this.api.execute(
      'GET',
      url,
      {},
      {
        Authorization: `Bearer ${token}`,
      },
    )
  }

  /**
   * Send list of users encrypted VCs stored on `bloom-vault` to the `vault-migration-service` to start migration process to the `affinidi-vault`
   * @param {Array<vcMigrationList>} vcList
   */
  private async migrateCredentials(vcList: vcMigrationList[]): Promise<void> {
    const token = await this.getAuth()
    const url = `${this.baseUrl}/api/v1/migrateCredentials`
    return this.api.execute(
      'POST',
      url,
      {
        bloomDid: this.bloomDid,
        verifiableCredentials: vcList,
      },
      {
        Authorization: `Bearer ${token}`,
      },
    )
  }
}
