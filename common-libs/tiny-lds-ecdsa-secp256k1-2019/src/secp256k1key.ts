import base64url from 'base64url'
import tinySecp256k1 from 'tiny-secp256k1'
import createHash from 'create-hash'

import { VERIFICATION_KEY_TYPE, Signer, Verifier } from './common'

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest()

type Secp256k1KeyOptions = {
  publicKeyHex?: string
  privateKeyHex?: string
  id: string
  controller: string
}

export default class Secp256k1Key {
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
    this.type = VERIFICATION_KEY_TYPE
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
