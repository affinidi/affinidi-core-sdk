import { profile } from '@affinidi/tools-common'
import {
  createClientMethods,
  createDidAuthClient,
  createDidAuthSession,
  DidAuthConstructorOptions,
  GetDidAuthParams,
  wrapWithDidAuth,
} from '@affinidi/tools-openapi'

import vaultMigrationSpec from '../spec/_vaultMigration'

type ConstructorOptions = DidAuthConstructorOptions & { migrationUrl: string }

export type BlobType = {
  cyphertext: string
  id: number
}

const { CreateDidAuthRequest, ...otherMethods } = createClientMethods(vaultMigrationSpec)
const clientMethods = wrapWithDidAuth(CreateDidAuthRequest, otherMethods)

@profile()
export default class VaultMigrationApiService {
  private readonly client

  constructor(options: ConstructorOptions) {
    const didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this.client = createDidAuthClient(clientMethods, didAuthSession, options.migrationUrl, options)
  }

  async isMigrationDone(bloomDid: string) {
    return this.client.MigrationDone({ pathParams: { bloomDid } })
  }

  async isMigrationStarted() {
    return this.client.MigrationStarted({})
  }

  async migrateCredentials(params: GetDidAuthParams<typeof clientMethods.MigrateCredentials>) {
    return this.client.MigrateCredentials({ params })
  }
}
