import { JwtService } from '@affinidi/tools-common'
import KeysService from '../KeysService'
import JoloDidDocumentService from './JoloDidDocumentService'
import ElemDidDocumentService from './ElemDidDocumentService'
import WebDidDocumentService from './WebDidDocumentService'
import ElemAnchoredDidDocumentService from './ElemAnchoredDidDocumentService'
import { parse } from 'did-resolver'
import { LocalKeyVault } from './LocalKeyVault'
import PolygonDidDocumentService from './PolygonDidDocumentService'
import { DidDocument } from '../../shared/interfaces'
import { decodeBase58 } from '../../utils/ethUtils'

export { KeyVault } from './KeyVault'
export { LocalKeyVault } from './LocalKeyVault'

export default class DidDocumentService {
  /**
   * @deprecated use DidDocumentService.createDidDocumentService instead
   */
  constructor(keysService: KeysService) {
    return DidDocumentService.createDidDocumentService(keysService)
  }

  static createDidDocumentService(keysService: KeysService) {
    const { didMethod } = keysService.decryptSeed()

    return {
      jolo: new JoloDidDocumentService(keysService),
      elem: new ElemDidDocumentService(new LocalKeyVault(keysService)),
      'elem-anchored': new ElemAnchoredDidDocumentService(new LocalKeyVault(keysService)),
      polygon: new PolygonDidDocumentService(new LocalKeyVault(keysService), { isTestnet: false }),
      'polygon:testnet': new PolygonDidDocumentService(new LocalKeyVault(keysService), { isTestnet: true }),
      web: new WebDidDocumentService(new LocalKeyVault(keysService)),
    }[didMethod]
  }

  static getPublicKey(fulleKeyId: string, didDocument: DidDocument, keyId?: string): Buffer {
    // Support finding the publicKey with the short form DID + fragment or full keyId
    if (!keyId) {
      const { did, fragment } = parse(fulleKeyId)
      keyId = `${did}#${fragment}`
    }

    const keySection = didDocument.publicKey?.find((section) => section.id === keyId || section.id === fulleKeyId)

    if (keySection?.publicKeyPem) return Buffer.from(keySection.publicKeyPem)
    if (keySection?.publicKeyBase58) return Buffer.from(keySection.publicKeyBase58)
    if (keySection?.publicKeyHex) return Buffer.from(keySection.publicKeyHex, 'hex')

    const methodSection = didDocument.verificationMethod?.find(
      (section) => section.id === keyId || section.id === fulleKeyId,
    )

    if (methodSection?.publicKeyBase58) return decodeBase58(methodSection?.publicKeyBase58)

    throw new Error('Key not found.')
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

    if (methodId === 'testnet') return [method + ':' + methodId, parameters]
    return [method, methodId, parameters]
  }

  static keyIdToDid(keyId: string): string {
    return JwtService.keyIdToDid(keyId)
  }
}
