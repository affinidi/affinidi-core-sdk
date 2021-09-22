import { ELEM_DID_METHOD, JOLO_DID_METHOD } from '../_defaultConfig'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { KeysService } from '@affinidi/common'

export const anchorDid = async (
  api: RegistryApiService,
  encryptedSeed: string,
  password: string,
  didDocument: any,
  anchoredDidElem: boolean = false,
  nonce: number = 0,
): Promise<{ did: string } | undefined> => {
  const did = didDocument.id

  const keysService = new KeysService(encryptedSeed, password)
  const { seed, didMethod } = keysService.decryptSeed()
  const seedHex = seed.toString('hex')

  if (didMethod === JOLO_DID_METHOD) {
    const signedDidDocument = await keysService.signDidDocument(didDocument)

    const { body: bodyDidDocument } = await api.putDocumentInIpfs({ document: signedDidDocument })
    const didDocumentAddress = bodyDidDocument.hash

    const {
      body: { digestHex },
    } = await api.createAnchorTransaction({ nonce, did, didDocumentAddress })

    let transactionSignatureJson = ''
    if (digestHex && digestHex !== '') {
      transactionSignatureJson = await keysService.createTransactionSignature(digestHex, seedHex)
    }

    const transactionPublicKey = KeysService.getAnchorTransactionPublicKey(seedHex, didMethod)
    const ethereumPublicKeyHex = transactionPublicKey.toString('hex')

    await api.anchorDid({ did, didDocumentAddress, ethereumPublicKeyHex, transactionSignatureJson, nonce })
  }

  if (didMethod === ELEM_DID_METHOD && anchoredDidElem) {
    const response = await api.anchorDid({
      did,
      didDocumentAddress: '',
      ethereumPublicKeyHex: '',
      transactionSignatureJson: '',
      anchoredDidElem,
    })

    return { did: response.body.did }
  }

  if (didMethod === ELEM_DID_METHOD) {
    try {
      await api.anchorDid({
        did,
        didDocumentAddress: '',
        ethereumPublicKeyHex: '',
        transactionSignatureJson: '',
        anchoredDidElem,
      })
    } catch (error) {
      console.log('to check logs at the backend', error)
    }
  }
}
