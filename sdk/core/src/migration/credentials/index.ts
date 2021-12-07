import { CredentialLike } from '../../dto/internal'
import { DidAuthAdapter } from '../../shared/DidAuthAdapter'
import { extractSDKVersion } from '../../_helpers'
import { VaultMigrationApiService } from '@affinidi/internal-api-clients'
import AffinidiVaultEncryptionService from '../../services/AffinidiVaultEncryptionService'

interface vcMigrationList {
  bloomVaultIndex: number
  id: string
  types: string[]
  payload: string
}

type ConstructorOptions = {
  accessApiKey: string
  bloomDid: string
  didAuthAdapter: DidAuthAdapter
  encryptionService: AffinidiVaultEncryptionService
  migrationUrl: string
}

type CredentialWithBloomId = {
  credential: CredentialLike
  bloomId: number
}

/**
 * Provides bunch of methods that helps to achieve smooth and
 * silent client's VCs migration from `bloom-vault` into `affinidi-vault`.
 * All migration code concentrate in one place(or in `bloom-vault` part) for easy deprecation process.
 */
export class MigrationHelper {
  private readonly migrationApiService
  private readonly encryptionService
  private readonly bloomDid

  constructor({ accessApiKey, bloomDid, didAuthAdapter, encryptionService, migrationUrl }: ConstructorOptions) {
    this.migrationApiService = new VaultMigrationApiService({
      accessApiKey,
      didAuthAdapter,
      migrationUrl,
      sdkVersion: extractSDKVersion(),
    })
    this.encryptionService = encryptionService
    this.bloomDid = bloomDid
  }

  /**
   * Initiate VCs migration on bloom-vault VC READ event.
   * @param credentials
   * @param {string} accessToken - bloom-vault access token
   * @param {string} signature - signature of bloom-vault access token
   */
  async runMigration(credentials: CredentialWithBloomId[], accessToken: string, signature: string): Promise<void> {
    try {
      const encryptedCredentials = await this.encryptionService.encryptCredentials(credentials)
      const credentialsForMigration = encryptedCredentials.map(
        ({ cyphertext, idHash, originalCredential, typeHashes }) => ({
          bloomVaultIndex: originalCredential.bloomId,
          id: idHash,
          payload: cyphertext,
          types: typeHashes,
        }),
      )
      const batchSize = Number(process.env.CREDENTIALS_BATCH_SIZE) || 10
      await this.runMigrationByChunk(credentialsForMigration, batchSize, accessToken, signature)
    } catch (err) {
      console.error('Vault-migration-service initiate migration for given user call ends with error: ', err)
    }
  }

  /**
   * Divides given encrypted VCs list into chunks and run migration
   * @param encryptedVCs
   * @param chunk
   * @param {string} accessToken - bloom-vault access token
   * @param {string} signature - signature of bloom-vault access token
   */
  async runMigrationByChunk(
    encryptedVCs: vcMigrationList[],
    chunk: number,
    accessToken: string,
    signature: string,
  ): Promise<void> {
    for (let i = 0, L = encryptedVCs.length; i < L; i += chunk) {
      const chunkedVCList = encryptedVCs.slice(i, i + chunk)
      await this.migrateCredentials(chunkedVCList, accessToken, signature)
    }
  }

  /**
   * Gets migration status for user with given token for specified ethereum DID
   */
  private async getMigrationStatus() {
    try {
      const response = await this.migrationApiService.isMigrationDone(this.bloomDid)
      return response.body ? 'yes' : 'no'
    } catch (err) {
      console.error('Vault-migration-service migration status check call ends with error: ', err)
      return 'error'
    }
  }

  async getMigrationActions() {
    const isMigrationStarted = await this.isMigrationStarted()
    if (isMigrationStarted) {
      const migrationDoneStatus = await this.getMigrationStatus()

      if (migrationDoneStatus === 'no') {
        return { shouldFetchCredentials: true, shouldRunMigration: true }
      }

      if (migrationDoneStatus === 'yes') {
        return { shouldFetchCredentials: false, shouldRunMigration: false }
      }
    }

    return { shouldFetchCredentials: true, shouldRunMigration: false }
  }

  /**
   * Checks if migration process has been started. Should work without authentication.
   */
  private async isMigrationStarted(): Promise<boolean> {
    try {
      return await Promise.race([
        (async () => {
          const response = await this.migrationApiService.isMigrationStarted()
          return response.body
        })(),
        // will skip request to the migration service if it is pending > 2 sec(suppose that migration server is down)
        new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 2000)
        }),
      ])
    } catch (err) {
      console.error('Vault-migration-service migration started check call ends with error: ', err)
      return false
    }
  }

  /**
   * Send list of users encrypted VCs stored on `bloom-vault` to the `vault-migration-service` to start migration process to the `affinidi-vault`
   * @param {Array<vcMigrationList>} vcList - list of VCs
   * @param {string} accessToken - bloom-vault access token
   * @param {string} signature - signature of bloom-vault access token
   */
  async migrateCredentials(vcList: vcMigrationList[], accessToken: string, signature: string): Promise<void> {
    await this.migrationApiService.migrateCredentials({
      bloomOptions: {
        did: this.bloomDid,
        accessToken: accessToken,
        tokenSignature: signature,
      },
      verifiableCredentials: vcList,
    })
  }
}
