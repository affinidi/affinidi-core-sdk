// because of migration implementation it is only one way to change service url - right before wallet initialization
import { useNodeFetch } from '@affinidi/platform-fetch-node'

process.env.VAULT_MIGRATION_SERVICE_URL = `https://vault-migration-service.is-down-at.affinity-project.org`
// affinidi wallet initialization:
import { AffinidiWallet } from '../../helpers/AffinidiWallet'
import { expect } from 'chai'
import { getBasicOptionsForEnvironment, testSecrets } from '../../helpers'

const { PASSWORD, ENCRYPTED_SEED_ELEM } = testSecrets

const password = PASSWORD
const encryptedSeedElem = ENCRYPTED_SEED_ELEM

const options = getBasicOptionsForEnvironment()

describe('BloomVault migration when server migration server is down', () => {
  it.skip('should getAllCredentials if migration not started and migration service is down', async () => {
    const commonNetworkMember = new AffinidiWallet(password, encryptedSeedElem, options)
    const result = await commonNetworkMember.getAllCredentials()

    expect(result).to.eql([])
  })
})
