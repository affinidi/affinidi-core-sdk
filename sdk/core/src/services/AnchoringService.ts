import { ELEM_ANCHORED_DID_METHOD, ELEM_DID_METHOD, JOLO_DID_METHOD } from '../_defaultConfig'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { KeysService } from '@affinidi/common'

export class AnchoringService {
  constructor(
    private readonly api: RegistryApiService,
    private readonly encryptedSeed: string,
    private readonly password: string,
    private readonly didDocument: any,
    private readonly nonce: number,
  ) {}

  private async anchorDidWithJoloMethod(keysService: KeysService, seedHex: string) {
    const did = this.didDocument.id
    const signedDidDocument = await keysService.signDidDocument(this.didDocument)

    const { body: bodyDidDocument } = await this.api.putDocumentInIpfs({ document: signedDidDocument })
    const didDocumentAddress = bodyDidDocument.hash

    const {
      body: { digestHex },
    } = await this.api.createAnchorTransaction({ nonce: this.nonce, did, didDocumentAddress })

    const transactionSignatureJson =
      digestHex && digestHex !== '' ? await keysService.createTransactionSignature(digestHex, seedHex) : ''

    const transactionPublicKey = KeysService.getAnchorTransactionPublicKey(seedHex, JOLO_DID_METHOD)
    const ethereumPublicKeyHex = transactionPublicKey.toString('hex')

    const response = await this.api.anchorDid({
      did,
      didDocumentAddress,
      ethereumPublicKeyHex,
      transactionSignatureJson,
      nonce: this.nonce,
    })

    return { did: response?.body?.did }
  }

  private async anchorDidWithElemMethod(anchoredDidElem: boolean) {
    const did = this.didDocument.id
    try {
      const response = await this.api.anchorDid({
        did,
        didDocumentAddress: '',
        ethereumPublicKeyHex: '',
        transactionSignatureJson: '',
        anchoredDidElem: anchoredDidElem,
      })

      return { did: response?.body?.did }
    } catch (error) {
      console.log('to check logs at the backend', error)
    }
  }

  public async anchorDid(): Promise<{ did: string }> {
    const keysService = new KeysService(this.encryptedSeed, this.password)
    const { seed, didMethod: originalDidMethod } = keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    const didMethod = originalDidMethod !== ELEM_ANCHORED_DID_METHOD ? originalDidMethod : ELEM_DID_METHOD

    if (didMethod === JOLO_DID_METHOD) {
      return this.anchorDidWithJoloMethod(keysService, seedHex)
    }

    if (didMethod === ELEM_DID_METHOD) {
      return this.anchorDidWithElemMethod(originalDidMethod === ELEM_ANCHORED_DID_METHOD)
    }
  }
}
