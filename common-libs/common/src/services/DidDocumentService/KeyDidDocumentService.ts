import { KeyVault } from './KeyVault'
import { encodeBase58 } from '../../utils/ethUtils'

const SECP256K1_MULTICODEC_IDENTIFIER = 0xe7 // 0xe7 indicates a Secp256k1 public key
const VARIABLE_INTEGER_TRAILING_BYTE = 0x01 // 0x01 indicates the end of the leading bytes according to variable integer spec, https://github.com/multiformats/multibase/blob/master/multibase.csv#L18
const MULTIBASE_ENCODED_BASE58_IDENTIFIER = 'z' // z represents the multibase encoding scheme of base58 encoding, https://github.com/multiformats/multibase/blob/master/multibase.csv#L18

export default class KeyDidDocumentService {
  private _keyProvider

  constructor(keyProvider: KeyVault) {
    this._keyProvider = keyProvider
  }

  _fingerprintFromPubKey(publicKey): string {
    // import * as u8a from 'uint8arrays'
    const buffer = new Uint8Array(2 + publicKey.length)
    buffer[0] = SECP256K1_MULTICODEC_IDENTIFIER
    buffer[1] = VARIABLE_INTEGER_TRAILING_BYTE
    buffer.set(publicKey, 2)

    return `${MULTIBASE_ENCODED_BASE58_IDENTIFIER}${encodeBase58(buffer)}`
  }

  getMyDid(): string {
    const publicKey = this._keyProvider.primaryPublicKey
    const fingerprint = this._fingerprintFromPubKey(publicKey)
    return `did:key:${fingerprint}`
  }

  _getFingerPrintFromDid(did: string): string {
    const fingerprint = did.split(':')[2]

    return fingerprint
  }

  getKeyId() {
    const did = this.getMyDid()
    const fingerprint = this._getFingerPrintFromDid(did)

    return `${did}#${fingerprint}`
  }

  static buildDidDocumentFromPubKey(pubKeyBytes: Buffer, fingerprint: string) {
    // import * as u8a from 'uint8arrays'
    const did = `did:key:${fingerprint}`
    const keyId = `${did}#${fingerprint}`
    return {
      id: did,
      verificationMethod: [
        {
          id: keyId,
          type: 'Secp256k1VerificationKey2018',
          controller: did,
          publicKeyBase58: Uint8Array.toString(pubKeyBytes, 'base58btc'),
        },
      ],
      authentication: [keyId],
      assertionMethod: [keyId],
      capabilityDelegation: [keyId],
      capabilityInvocation: [keyId],
    }
  }

  async _buildDidDocumentInformation() {
    const did = this.getMyDid()
    const fingerprint = this._getFingerPrintFromDid(did)
    const publicKey = this._keyProvider.primaryPublicKey

    const didDocument = KeyDidDocumentService.buildDidDocumentFromPubKey(publicKey, fingerprint)

    return { did, didDocument, fingerprint }
  }

  async buildDidDocumentForRegister() {
    const { did, didDocument, fingerprint } = await this._buildDidDocumentInformation()

    return {
      did,
      didDocument,
      keyId: `${did}#${fingerprint}`,
    }
  }

  async getDidDocument() {
    const { didDocument } = await this._buildDidDocumentInformation()
    return didDocument
  }
}
