import base64url from 'base64url'
import tinySecp256k1 from 'tiny-secp256k1'
import createHash from 'create-hash'

const jsonld = require('jsonld')
const jsigs = require('jsonld-signatures')

const keyType = 'EcdsaSecp256k1Signature2019'
const verificationKeyType = 'EcdsaSecp256k1VerificationKey2019'

const stipParamsFromDidUrl = (did: string): string =>
  did
    // Strip out matrix params
    .replace(/;[a-zA-Z0-9_.:%-]+=[a-zA-Z0-9_.:%-]*/g, '')
    // Strip out query params
    .replace(/([?][^#]*)?/g, '')

const sha256 = (data: any) => createHash('sha256').update(data).digest()

type Signer = { sign: ({ data }: { data: any }) => string | Promise<string> }
type Verifier = {
  verify: ({ data, signature }: { data: any; signature: string }) => boolean | Promise<boolean>
}

type Secp256k1KeyOptions = {
  publicKeyHex?: string
  privateKeyHex?: string
  id: string
  controller: string
}

export class Secp256k1Key {
  publicKeyHex: string | undefined
  privateKeyHex: string | undefined

  id: string
  controller: string
  type: string

  constructor(options: Secp256k1KeyOptions) {
    if (!options.publicKeyHex && !options.privateKeyHex) {
      throw new Error('Must provide at least the private or public hex key')
    }

    this.publicKeyHex = options.publicKeyHex
    this.privateKeyHex = options.privateKeyHex

    this.id = options.id
    this.controller = options.controller
    this.type = verificationKeyType
  }

  signer(): Signer {
    const privateKeyHex = this.privateKeyHex

    if (!privateKeyHex) {
      return {
        sign: () => {
          throw new Error('No private key to sign with')
        },
      }
    }

    return {
      sign: ({ data }) => {
        const payload = Buffer.from(data.buffer, data.byteOffset, data.length)
        const encodedHeader = base64url.encode(
          JSON.stringify({
            alg: 'ES256K',
            b64: false,
            crit: ['b64'],
          }),
        )

        const toSign = Buffer.concat([
          Buffer.from(`${encodedHeader}.`, 'utf8'),
          Buffer.from(payload.buffer, payload.byteOffset, payload.length),
        ])
        const digest = sha256(Buffer.from(toSign))

        const signature = tinySecp256k1.sign(digest, Buffer.from(privateKeyHex, 'hex'))
        const encodedSignature = base64url.encode(signature)

        return `${encodedHeader}..${encodedSignature}`
      },
    }
  }

  verifier(): Verifier {
    const publicKeyHex = this.publicKeyHex

    if (!publicKeyHex) {
      return {
        verify: () => {
          throw new Error('No public key to verify against')
        },
      }
    }

    return {
      verify: ({ data, signature }) => {
        const payload = Buffer.from(data.buffer, data.byteOffset, data.length)
        if (signature.indexOf('..') < 0) {
          return false
        }

        const [encodedHeader, encodedSignature] = signature.split('..')

        const header = JSON.parse(base64url.decode(encodedHeader))

        if (header.alg !== 'ES256K') {
          return false
        }

        const isHeaderInvalid = header.b64 !== false || !header.crit || !header.crit.length || header.crit[0] !== 'b64'

        if (isHeaderInvalid) {
          return false
        }

        const toSign = Buffer.concat([
          Buffer.from(`${encodedHeader}.`, 'utf8'),
          Buffer.from(payload.buffer, payload.byteOffset, payload.length),
        ])
        const digest = sha256(Buffer.from(toSign))

        let verified: boolean
        try {
          verified = tinySecp256k1.verify(
            digest,
            Buffer.from(publicKeyHex, 'hex'),
            base64url.toBuffer(encodedSignature),
          )
        } catch {
          verified = false
        }

        return verified
      },
    }
  }

  publicNode(): {
    id: string
    type: string
    controller: string
    publicKeyHex: string | undefined
  } {
    return {
      id: this.id,
      type: this.type,
      controller: this.controller,
      publicKeyHex: this.publicKeyHex,
    }
  }
}

type Secp256k1SignatureOptions = {
  key: Secp256k1Key
  date?: string
  useNativeCanonize?: boolean
}

export class Secp256k1Signature extends jsigs.suites.LinkedDataSignature {
  private readonly key: Secp256k1Key
  private readonly verificationKeyType: string

  private readonly signer: Signer
  private readonly verifier: Verifier

  private readonly proofSignatureKey = 'jws'

  verificationMethod: string

  constructor(options: Secp256k1SignatureOptions) {
    super({
      type: keyType,
      LDKeyClass: Secp256k1Key,
      date: options.date,
      useNativeCanonize: options.useNativeCanonize,
    })

    this.verificationKeyType = verificationKeyType

    const publicKey = options.key.publicNode()
    this.verificationMethod = publicKey.id
    this.key = options.key
    this.verifier = this.key.verifier()
    this.signer = this.key.signer()
  }

  async sign<T>({ verifyData, proof }: { verifyData: T; proof: Record<string, any> }): Promise<Record<string, any>> {
    proof[this.proofSignatureKey] = await this.signer.sign({
      data: verifyData,
    })

    return proof
  }

  async verifySignature<T>({ verifyData, proof }: { verifyData: T; proof: Record<string, any> }): Promise<boolean> {
    return this.verifier.verify({
      data: Buffer.from(verifyData),
      signature: proof[this.proofSignatureKey],
    })
  }

  /** ensure there is a way to verify */
  async assertVerificationMethod({ verificationMethod }: { verificationMethod: any }): Promise<void> {
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
    proof: Record<string, any>
    document: any
    purpose: any
    documentLoader: any
    expansionMap: any
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
