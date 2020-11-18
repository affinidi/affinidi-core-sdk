import { legacySignedCredential } from '../factory/legacySignedCredential'
import { expect } from 'chai'
import { signedCredential, signedCredentialWithLongFormVerificationMethod } from '../factory/signedCredential'
import { signedPresentation } from '../factory/signedPresentation'
import { Affinity } from '../../src'

const { TEST_SECRETS } = process.env
const { STAGING_API_KEY_HASH } = JSON.parse(TEST_SECRETS)

const options = {
  registryUrl: 'https://affinity-registry.staging.affinity-project.org',
  apiKey: STAGING_API_KEY_HASH,
}

const affinity = new Affinity(options)

describe('Validation Snapshots', () => {
  // TODO: to resolve: expected false to be true
  it.skip('#validateCredential (already created/legacy creds)', async () => {
    const result = await affinity.validateCredential(legacySignedCredential)

    expect(result.result).to.be.true
  })

  it('#validateCredential (already created creds with longform DID)', async () => {
    const result = await affinity.validateCredential(signedCredentialWithLongFormVerificationMethod)

    expect(result.result).to.be.false
  })

  it('#validateCredential (already created/new creds)', async () => {
    const result = await affinity.validateCredential(signedCredential)

    expect(result.result).to.be.true
  })

  it('#validatePresentation (existing presentations)', async () => {
    const result = await affinity.validatePresentation(signedPresentation)

    if (result.result === false) {
      console.log(result.error)
    }

    expect(result.result).to.be.true
  })
})
