import encode from 'base64url'
import createHash from 'create-hash'

const { canonize } = require('jsonld')
const sha256 = (data: any) => {
  return createHash('sha256').update(data).digest()
}

export default class DigestService {
  private async normalizeJsonLd(data: any, context: any) {
    const dataWtihoutContext = Object.assign({}, data)
    delete dataWtihoutContext['@context']

    return canonize(dataWtihoutContext, { expandContext: context })
  }

  private async normalizeLdProof(proof: any, context: any) {
    const toNormalize = Object.assign({}, proof)
    delete toNormalize.signatureValue // to support already created creds
    delete toNormalize.id // to support already created creds
    delete toNormalize.jws
    delete toNormalize.type

    return this.normalizeJsonLd(toNormalize, context)
  }

  async getJsonLdDigest(document: any): Promise<{ digest: Buffer; signature?: Buffer }> {
    let signature
    const { proof } = document
    const context = document['@context']

    const data = Object.assign({}, document)
    delete data.proof
    delete data['@context']

    const normalizedProof = await this.normalizeLdProof(proof, context)
    const normalizedData = await this.normalizeJsonLd(data, context)

    const digest = sha256(Buffer.concat([sha256(Buffer.from(normalizedProof)), sha256(Buffer.from(normalizedData))]))

    if (document.proof && document.proof.signatureValue) {
      signature = Buffer.from(document.proof.signatureValue, 'hex')
    }

    if (document.proof && document.proof.jws) {
      signature = Buffer.from(document.proof.jws, 'hex')
    }

    return { digest, signature }
  }

  getTokenDigest(token: any): { digest: Buffer; signature?: Buffer } {
    let signature

    // prettier-ignore
    const toSign = [
      encode(JSON.stringify(token.header)),
      encode(JSON.stringify(token.payload))
    ].join('.')

    const digest = sha256(Buffer.from(toSign))

    if (token.signature) {
      const isSignatureValidHex = /^[a-fA-F0-9]+$/.test(token.signature)

      signature = isSignatureValidHex ? Buffer.from(token.signature, 'hex') : null
    }

    return { digest, signature }
  }
}
