import { ParsedDID, PublicKey, Resolver } from 'did-resolver'
import { getDidUniqueSuffix } from './elem-lib/func'
import base64url from 'base64url'
import secp256k1 from 'tiny-secp256k1'
import createHash from 'create-hash'
import { DidDocument } from '../../shared/interfaces'

const sha256 = (data: any) => {
  return createHash('sha256').update(data).digest()
}

export const verifyOperationSignature = (
  encodedHeader: string,
  encodedPayload: string,
  signature: string,
  publicKey: string,
) => {
  const toBeVerified = `${encodedHeader}.${encodedPayload}`
  const toBeVerifiedBuffer = Buffer.from(toBeVerified)
  const hash = sha256(toBeVerifiedBuffer)

  const publicKeyBuffer = Buffer.from(publicKey, 'hex')
  return secp256k1.verify(hash, base64url.toBuffer(signature), publicKeyBuffer)
}

export const encodeJson = (payload: any) => base64url.encode(Buffer.from(JSON.stringify(payload)))

export const decodeJson = (encodedPayload: any) => JSON.parse(base64url.decode(encodedPayload))

const resolveElemDID = async (_: string, parsed: ParsedDID) => { // eslint-disable-line
  if (!parsed.params) {
    throw new Error('Element DID must have the elem:intial-state matrix param')
  }

  const initialState = parsed.params['elem:initial-state']
  if (!initialState) {
    throw new Error('Element DID must have the elem:intial-state matrix param')
  }

  const { protected: encodedHeader, payload: encodedPayload, signature } = decodeJson(initialState)
  const realUniqSuffix = getDidUniqueSuffix({ protected: encodedHeader, payload: encodedPayload })

  if (parsed.id !== realUniqSuffix) {
    throw new Error('Element DID has different did suffix that calculated from state')
  }

  const decodedHeader = JSON.parse(base64url.decode(encodedHeader))
  const decodedPayload = JSON.parse(base64url.decode(encodedPayload))
  const publicKey = decodedPayload.publicKey.find(({ id }: PublicKey) => id === decodedHeader.kid)

  if (!publicKey) {
    throw new Error(`Cannot find public key with id: ${decodedHeader.kid}`)
  }

  const isSigValid = verifyOperationSignature(encodedHeader, encodedPayload, signature, publicKey.publicKeyHex)

  if (!isSigValid) {
    throw new Error('Cannot validate create operation')
  }

  const prependBaseDID = (field: any) => {
    if (typeof field === 'string') {
      if (field.startsWith('#')) {
        return `${parsed.did}${field}`
      } else {
        return field
      }
    } else if (typeof field === 'object' && 'id' in field && typeof field.id === 'string') {
      if (field.id.startsWith('#')) {
        return { ...field, id: `${parsed.did}${field.id}` }
      } else {
        return field
      }
    } else {
      throw new Error('Unsupported method format')
    }
  }

  return Object.assign({}, decodedPayload, {
    publicKey: (decodedPayload.publicKey || []).map(prependBaseDID),
    assertionMethod: (decodedPayload.assertionMethod || []).map(prependBaseDID),
    authentication: (decodedPayload.authentication || []).map(prependBaseDID),
    id: parsed.did,
  })
}

export const resolveLegacyDidElemLocal = (did: string) => {
  const resolver = new Resolver({ elem: resolveElemDID })
  return resolver.resolve(did) as Promise<DidDocument>
}
