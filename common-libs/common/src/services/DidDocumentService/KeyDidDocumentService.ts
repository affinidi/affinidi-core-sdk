import { KeyVault } from './KeyVault'
import { encodeBase58 } from '../../utils/ethUtils'
import DidDocumentService from './index'

const SECP256K1_MULTICODEC_IDENTIFIER = 0xe7 // 0xe7 indicates a Secp256k1 public key
const VARIABLE_INTEGER_TRAILING_BYTE = 0x01 // 0x01 indicates the end of the leading bytes according to variable integer spec, https://github.com/multiformats/multibase/blob/master/multibase.csv#L18
const MULTIBASE_ENCODED_BASE58_IDENTIFIER = 'z' // z represents the multibase encoding scheme of base58 encoding, https://github.com/multiformats/multibase/blob/master/multibase.csv#L18

export default class KeyDidDocumentService {
  private _keyProvider

  constructor(keyProvider: KeyVault) {
    this._keyProvider = keyProvider
  }

  _fingerprintFromPubKey(publicKey: Buffer): string {
    const unitArray = new Uint8Array(2 + publicKey.length)
    unitArray[0] = SECP256K1_MULTICODEC_IDENTIFIER
    unitArray[1] = VARIABLE_INTEGER_TRAILING_BYTE
    unitArray.set(publicKey, 2)

    const buffer = Buffer.from(unitArray)

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

  static buildDidDocumentFromPubKey(pubKeyBytes: Buffer, fingerprint: string, isDidJson: boolean = false) {

    const did = `did:key:${fingerprint}`
    const keyId = `${did}#${fingerprint}`
    let publicKey: any = {
      id: keyId,
      type: 'Secp256k1VerificationKey2018',
      controller: did,
      publicKeyBase58: encodeBase58(pubKeyBytes),
    }

    if (isDidJson) {
      const publicKeyJwk = DidDocumentService.getPublicKeyJwkFromPublicKey(pubKeyBytes)
      publicKey = {
        id: keyId,
        type: 'JsonWebKey2020',
        controller: did,
        publicKeyJwk,
      }
    }

    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/jws-2020/v1'
      ],
      id: did,
      // verificationMethod: [publicKey],
      publicKey: [publicKey],
      authentication: [keyId],
      assertionMethod: [keyId],
      capabilityDelegation: [keyId],
      capabilityInvocation: [keyId],
      keyAgreement: [keyId],
    }
  }

  async _buildDidDocumentInformation(isDidJson: boolean = false) {
    const did = this.getMyDid()
    const fingerprint = this._getFingerPrintFromDid(did)
    const publicKey = this._keyProvider.primaryPublicKey

    const didDocument = KeyDidDocumentService.buildDidDocumentFromPubKey(publicKey, fingerprint, isDidJson)

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
