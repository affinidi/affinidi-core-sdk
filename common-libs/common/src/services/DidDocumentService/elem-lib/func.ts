/* eslint-disable arrow-body-style */
import createHash from 'create-hash'

const base64url = require('base64url')
const multihashes = require('multihashes')

const sha256 = (data: any) => {
  return createHash('sha256').update(data).digest()
}

export const encodeJson = (payload: any) => base64url.encode(Buffer.from(JSON.stringify(payload)))

const decodeJson = (encodedPayload: any) => JSON.parse(base64url.decode(encodedPayload))

const payloadToHash = (payload: any) => {
  const encodedPayload = encodeJson(payload)
  const encodedOperationPayloadBuffer = Buffer.from(encodedPayload)
  const hash = sha256(encodedOperationPayloadBuffer)

  const hashAlgorithmName = multihashes.codes[18] // 18 is code for sha256
  const multihash = multihashes.encode(hash, hashAlgorithmName)

  return base64url.encode(multihash)
}

export const getDidUniqueSuffix = (operation: any) => {
  const header = decodeJson(operation.protected)
  switch (header.operation) {
    case 'create':
      return payloadToHash(operation.payload)
    case 'update':
    case 'recover':
    case 'delete':
      return decodeJson(operation.payload).didUniqueSuffix
    default:
      throw Error(`Cannot extract didUniqueSuffixe from: ${operation}`)
  }
}

// NOTE check is signatures are the same as sidetree's (see NEP-334)
export const computePayloadHash = (encodedHeader: string, encodedPayload: string): Buffer => {
  const toBeSigned = `${encodedHeader}.${encodedPayload}`
  return sha256(toBeSigned)
}
