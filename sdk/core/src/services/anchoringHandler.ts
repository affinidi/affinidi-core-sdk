import { ELEM_DID_METHOD, JOLO_DID_METHOD } from '../_defaultConfig'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { DidDocumentService, KeysService } from '@affinidi/common'

const getAnchoringParams = async (
  api: RegistryApiService,
  encryptedSeed: string,
  password: string,
  didDocument: any,
  nonce: number,
) => {
  const keysService = new KeysService(encryptedSeed, password)
  const { seed, didMethod } = keysService.decryptSeed()
  if (didMethod === JOLO_DID_METHOD) {
    const did = didDocument.id
    const seedHex = seed.toString('hex')
    const signedDidDocument = await keysService.signDidDocument(didDocument)

    const { body: bodyDidDocument } = await api.putDocumentInIpfs({ document: signedDidDocument })
    const didDocumentAddress = bodyDidDocument.hash

    const {
      body: { digestHex },
    } = await api.createAnchorTransaction({ nonce, did, didDocumentAddress })

    const transactionSignatureJson =
      digestHex && digestHex !== '' ? await keysService.createTransactionSignature(digestHex, seedHex) : ''

    const transactionPublicKey = KeysService.getAnchorTransactionPublicKey(seedHex, JOLO_DID_METHOD)
    const ethereumPublicKeyHex = transactionPublicKey.toString('hex')

    return { did, didDocumentAddress, ethereumPublicKeyHex, transactionSignatureJson, nonce }
  }

  if (didMethod === ELEM_DID_METHOD) {
    const didService = DidDocumentService.createDidDocumentService(keysService)
    const did = didService.getMyDid()

    return { did, didDocumentAddress: '', ethereumPublicKeyHex: '', transactionSignatureJson: '' }
  }

  throw new Error(`did method: "${didMethod}" is not supported`)
}

export const anchorDid = async (
  api: RegistryApiService,
  encryptedSeed: string,
  password: string,
  didDocument: any,
  anchoredDidElem: boolean = false,
  nonce: number = 0,
): Promise<{ did: string }> => {
  const response = await api.anchorDid({
    ...(await getAnchoringParams(api, encryptedSeed, password, didDocument, nonce)),
    nonce,
    anchoredDidElem,
  })

  return { did: response.body.did }
}
