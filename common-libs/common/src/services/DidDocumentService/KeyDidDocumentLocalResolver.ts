import { Resolver } from 'did-resolver'
import { DidDocument } from '../../shared/interfaces'
import KeyDidDocumentService from './KeyDidDocumentService'
import { decodeBase58 } from '../../utils/ethUtils'

const MULTIBASE_ENCODED_BASE58_IDENTIFIER = 'z' // z represents the multibase encoding scheme of base58 encoding, https://github.com/multiformats/multibase/blob/master/multibase.csv#L18

const pubKeyFromDid = (did: string): {publicKey: Buffer, fingerprint: string} => {
  const fingerprint = did.split(':')[2]
  const encoded = fingerprint.replace(MULTIBASE_ENCODED_BASE58_IDENTIFIER, '')
  const decoded = decodeBase58(encoded)

  const publicKey = decoded.slice(2, decoded.length)

  return { publicKey, fingerprint }
}

const resolveKeyDID = async (did: string) => {
  const { publicKey, fingerprint } = pubKeyFromDid(did)
  const didDocument = KeyDidDocumentService.buildDidDocumentFromPubKey(publicKey, fingerprint)

  return didDocument
}

export const resolveKeyDIDWithParams = async (did: string, isDidJson: boolean = false) => {
  const { publicKey, fingerprint } = pubKeyFromDid(did)
  const didDocument = KeyDidDocumentService.buildDidDocumentFromPubKey(publicKey, fingerprint, isDidJson)

  return didDocument
}

export const resolveDidKeyLocal = (did: string) => {
  const resolver = new Resolver({ key: resolveKeyDID })
  return resolver.resolve(did) as Promise<DidDocument>
}
