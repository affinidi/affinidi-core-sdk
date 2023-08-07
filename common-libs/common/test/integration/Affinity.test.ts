import { legacySignedCredential } from '../factory/legacySignedCredential'
import { expect } from 'chai'
import { signedCredential, signedCredentialWithLongFormVerificationMethod } from '../factory/signedCredential'
import { signedPresentation, signedPresentationWithPolygon } from '../factory/signedPresentation'
import { Affinity } from '../../src'
import { ecdsaCryptographyTools } from '../../src/shared/EcdsaCryptographyTools'
import { signedCredentialWithPolygon, signedCredentialWithWeb } from '../factory/credential'
import { webDidDocument } from '../factory/didDocument'

const { TEST_SECRETS } = process.env
const { DEV_API_KEY_HASH } = JSON.parse(TEST_SECRETS)

const options = {
  registryUrl: 'https://affinity-registry.apse1.dev.affinidi.io',
  apiKey: DEV_API_KEY_HASH,
  keysService: {} as any,
}

const affinity = new Affinity(options, ecdsaCryptographyTools)

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

  it('#validateCredential (existing cred) (polygon)', async () => {
    const result = await affinity.validateCredential(signedCredentialWithPolygon)

    expect(result.result).to.be.true
  })

  it('#validateCredential (existing cred) (web)', async () => {
    const result = await affinity.validateCredential(signedCredentialWithWeb, null, webDidDocument)

    expect(result.result).to.be.true
  })

  it('#validatePresentation (existing presentations)', async () => {
    const result = await affinity.validatePresentation(signedPresentation)

    if (result.result === false) {
      console.log(result.error)
    }

    expect(result.result).to.be.true
  })

  it('#validatePresentation with provided didDocuments (existing presentations)', async () => {
    const didDocument = {
      "@context": "https://w3id.org/security/v2",
      "publicKey": [
        {
          "id": "did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw#primary",
          "usage": "signing",
          "type": "Secp256k1VerificationKey2018",
          "publicKeyHex": "021abb4bbaaec970d0c25dd46ad36e44b4ab3650458d23a06be0e7128bfd3013b9"
        },
        {
          "id": "did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw#recovery",
          "usage": "recovery",
          "type": "Secp256k1VerificationKey2018",
          "publicKeyHex": "033fd458daebf4f35a12f535ed634d9c84e971931627117bf93610c400e6855c25"
        }
      ],
      "authentication": [
        "did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw#primary"
      ],
      "assertionMethod": [
        "did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw#primary"
      ],
      "id": "did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw"
    }
    const didDocuments = {
      'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw': didDocument
    }

    const result = await affinity.validatePresentation(signedPresentation, null, null, didDocuments)

    if (result.result === false) {
      console.log(result.error)
    }

    expect(result.result).to.be.true
  })

  it('#validatePresentation (existing presentations) (polygon)', async () => {
    const result = await affinity.validatePresentation(signedPresentationWithPolygon)

    expect(result.result).to.be.true
  })
})
