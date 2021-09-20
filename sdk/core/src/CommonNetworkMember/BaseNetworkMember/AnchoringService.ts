import { ParsedOptions } from '../../shared/getOptionsFromEnvironment'
import { extractSDKVersion } from '../../_helpers'
import { ELEM_DID_METHOD, JOLO_DID_METHOD } from '../../_defaultConfig'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { KeysService } from '@affinidi/common'

export class AnchoringService {
  constructor(
    private readonly encryptedSeed: string,
    private readonly password: string,
    private readonly didDocument: any,
    private readonly nonce: number,
    private readonly options: ParsedOptions,
    private readonly anchoredDidElem?: boolean,
  ) {}

  private get api() {
    return new RegistryApiService({
      registryUrl: this.options.basicOptions.registryUrl,
      accessApiKey: this.options.accessApiKey,
      sdkVersion: extractSDKVersion(),
    })
  }

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

    await this.api.anchorDid({
      did,
      didDocumentAddress,
      ethereumPublicKeyHex,
      transactionSignatureJson,
      nonce: this.nonce,
    })
  }

  private async anchorDidWithElemMethod() {
    const did = this.didDocument.id
    try {
      await this.api.anchorDid({
        did,
        didDocumentAddress: '',
        ethereumPublicKeyHex: '',
        transactionSignatureJson: '',
        anchoredDidElem: this.anchoredDidElem,
      })
    } catch (error) {
      console.log('to check logs at the backend', error)
    }
  }

  public async anchorDid() {
    const keysService = new KeysService(this.encryptedSeed, this.password)
    const { seed, didMethod } = keysService.decryptSeed()
    const seedHex = seed.toString('hex')

    if (didMethod === JOLO_DID_METHOD) {
      return this.anchorDidWithJoloMethod(keysService, seedHex)
    }

    // NOTE: if anchoredDidElem = false - for metrics purpose only
    if (didMethod === ELEM_DID_METHOD) {
      return this.anchorDidWithElemMethod()
    }
  }
}
