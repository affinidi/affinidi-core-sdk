import { ELEM_ANCHORED_DID_METHOD, ELEM_DID_METHOD, JOLO_DID_METHOD } from '../_defaultConfig'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { KeysService } from '@affinidi/common'
import { DidMethod } from '../dto/shared.dto'

type AnchoringParams = {
  registry: RegistryApiService
  keysService: KeysService
  didMethod: DidMethod
  did: string
  nonce: number
  anchoredDidElem: boolean
  additionalJoloParams?: {
    didDocument: any
    seedHex: string
  }
}

const getPreparedJoloParams = async ({ registry, keysService, nonce, additionalJoloParams }: AnchoringParams) => {
  if (!additionalJoloParams) {
    throw new Error('missing jolo params')
  }

  const { didDocument, seedHex } = additionalJoloParams

  const did = didDocument.id
  const signedDidDocument = await keysService.signDidDocument(didDocument)

  const { body: bodyDidDocument } = await registry.putDocumentInIpfs({ document: signedDidDocument })
  const didDocumentAddress = bodyDidDocument.hash

  const {
    body: { digestHex },
  } = await registry.createAnchorTransaction({ nonce, did, didDocumentAddress })

  const transactionSignatureJson = digestHex ? await keysService.createTransactionSignature(digestHex, seedHex) : ''

  const transactionPublicKey = KeysService.getAnchorTransactionPublicKey(seedHex, JOLO_DID_METHOD)
  const ethereumPublicKeyHex = transactionPublicKey.toString('hex')

  return { did, didDocumentAddress, ethereumPublicKeyHex, transactionSignatureJson, nonce }
}

const getPreparedElemParams = async ({ did }: AnchoringParams) => {
  return { did, didDocumentAddress: '', ethereumPublicKeyHex: '', transactionSignatureJson: '' }
}

const getPreparedAnchoringParams = async (params: AnchoringParams) => {
  const { didMethod } = params
  switch (didMethod) {
    case JOLO_DID_METHOD:
      return getPreparedJoloParams(params)
    case ELEM_DID_METHOD:
    case ELEM_ANCHORED_DID_METHOD:
      return getPreparedElemParams(params)
    default:
      throw new Error(`did method: "${didMethod}" is not supported`)
  }
}

export const anchorDid = async (params: AnchoringParams): Promise<{ did: string }> => {
  const { registry, anchoredDidElem, nonce } = params
  const preparedParams = await getPreparedAnchoringParams(params)
  const response = await registry.anchorDid({
    ...preparedParams,
    nonce,
    anchoredDidElem,
  })

  return { did: response.body.did }
}
