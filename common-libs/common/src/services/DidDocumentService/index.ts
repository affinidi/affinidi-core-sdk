import KeysService from '../KeysService'
import JoloDidDocument from './JoloDidDocument'
import ElemDidDocument from './ElemDidDocument'
import { parse } from 'did-resolver'

export default class DidDocumentService {
  constructor(keysService: KeysService) {
    const { didMethod } = keysService.decryptSeed()

    let didDocumentService
    switch (didMethod) {
      case 'jolo':
        didDocumentService = new JoloDidDocument(keysService)
        break
      case 'elem':
        didDocumentService = new ElemDidDocument(keysService)
        break
    }

    return didDocumentService
  }

  getMyDid() {
    return 'did:...'
  }

  getKeyId(did: string = null) {
    if (!did) {
      did = this.getMyDid()
    }

    const signingKey = 'primary'

    return `${did}#${signingKey}`
  }

  async buildDidDocument() {
    return { id: 'did:...' }
  }

  static getPublicKey(fulleKeyId: string, didDocument: any, keyId?: string): Buffer {
    // Support finding the publicKey with the short form DID + fragment or full keyId
    if (!keyId) {
      const { did, fragment } = parse(fulleKeyId)
      keyId = `${did}#${fragment}`
    }

    const keySection = didDocument.publicKey.find((section: any) => section.id === keyId || section.id === fulleKeyId)

    if (!keySection) {
      throw new Error('Key not found.')
    }

    return Buffer.from(keySection.publicKeyHex, 'hex')
  }

  /** NOTE: https://www.w3.org/TR/2019/WD-did-core-20191209/#generic-did-syntax
    This should support (see NEP-335):
      1. fragmet: "did:example:123456#oidc"
      2. query: "did:example:123456?query=true"
      3. path: "did:example:123456/path"
      4. parameters: "did:example:21tDAKCERh95uGgKbJNHYp;service=agent;foo:bar=high"
  */
  static parseDid(did: string): string[] {
    const [, method, methodId, parameters] = did.split(':')

    return [method, methodId, parameters]
  }

  static keyIdToDid(keyId: string): string {
    if (keyId.indexOf('#') === -1) {
      return keyId
    }

    return keyId.substring(0, keyId.indexOf('#'))
  }
}
