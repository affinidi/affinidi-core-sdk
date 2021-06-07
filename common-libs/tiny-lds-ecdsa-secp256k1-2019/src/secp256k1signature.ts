import { KEY_TYPE, VERIFICATION_KEY_TYPE, BufferLike, Signer, Verifier, BufferDataLike } from './common'
import Secp256k1Key from './secp256k1key'

const jsonld = require('jsonld')
const jsigs = require('jsonld-signatures')

const PROOF_SIGNATURE_KEY = 'jws'

const stipParamsFromDidUrl = (did: string): string =>
  did
    // Strip out matrix params
    .replace(/;[a-zA-Z0-9_.:%-]+=[a-zA-Z0-9_.:%-]*/g, '')
    // Strip out query params
    .replace(/([?][^#]*)?/g, '')

type Secp256k1SignatureOptions = {
  key: Secp256k1Key
  date?: string
  useNativeCanonize?: boolean
}

type ProofType = {
  [PROOF_SIGNATURE_KEY]?: string
  verificationMethod: string | { id: string }
}
type SignParams = { verifyData: BufferLike; proof: ProofType }
type VerifyParams = { verifyData: BufferDataLike; proof: ProofType }

export default class Secp256k1Signature extends jsigs.suites.LinkedDataSignature {
  private readonly key: Secp256k1Key
  private readonly verificationKeyType: string

  private readonly signer: Signer
  private readonly verifier: Verifier

  verificationMethod: string

  constructor(options: Secp256k1SignatureOptions) {
    super({
      type: KEY_TYPE,
      LDKeyClass: Secp256k1Key,
      date: options.date,
      useNativeCanonize: options.useNativeCanonize,
      contextUrl: null,
    })

    this.verificationKeyType = VERIFICATION_KEY_TYPE

    const publicKey = options.key.publicNode()
    this.verificationMethod = publicKey.id
    this.key = options.key
    this.verifier = this.key.verifier()
    this.signer = this.key.signer()
  }

  async sign({ verifyData, proof }: SignParams): Promise<ProofType> {
    proof[PROOF_SIGNATURE_KEY] = await this.signer.sign({
      data: verifyData,
    })

    return proof
  }

  async verifySignature({ verifyData, proof }: VerifyParams): Promise<boolean> {
    const signature = proof[PROOF_SIGNATURE_KEY]
    if (typeof signature !== 'string') {
      throw new Error(`Expected proof[${PROOF_SIGNATURE_KEY}] to be string, got ${typeof signature}`)
    }

    return this.verifier.verify({ data: Buffer.from(verifyData), signature })
  }

  /** ensure there is a way to verify */
  async assertVerificationMethod({ verificationMethod }: { verificationMethod: { type: unknown } }): Promise<void> {
    if (!jsonld.hasValue(verificationMethod, 'type', this.verificationKeyType)) {
      throw new Error(`Invalid key type. Key type must be "${this.verificationKeyType}"`)
    }
  }

  /** used by linked data signatures and vc libraries */
  getVerificationMethod(): {
    id: string
    type: string
    controller: string
    publicKeyHex: string | undefined
  } {
    return this.key.publicNode()
  }

  /** used by linked data signatures and vc libraries */
  async matchProof(options: {
    proof: ProofType
    document: unknown
    purpose: unknown
    documentLoader: unknown
    expansionMap: unknown
  }): Promise<boolean> {
    if (!(await super.matchProof(options))) {
      return false
    }

    const {
      proof: { verificationMethod },
    } = options

    const strippedVerificationMethod = stipParamsFromDidUrl(
      typeof verificationMethod === 'object' ? verificationMethod.id : verificationMethod,
    )
    const strippedKeyId = stipParamsFromDidUrl(this.key.id)

    // only match if the key specified matches the one in the proof
    return strippedVerificationMethod === strippedKeyId
  }
}
