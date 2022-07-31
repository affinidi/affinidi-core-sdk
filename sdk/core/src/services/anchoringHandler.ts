import {
  ELEM_ANCHORED_DID_METHOD,
  ELEM_DID_METHOD,
  JOLO_DID_METHOD,
  POLYGON_DID_METHOD,
  POLYGON_TESTNET_DID_METHOD,
  SOL_DEVNET_DID_METHOD,
  SOL_DID_METHOD,
  SOL_TESTNET_DID_METHOD,
} from '../_defaultConfig'
import nacl from 'tweetnacl'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { KeysService, LocalKeyVault, PolygonDidDocumentService, SolDidDocumentService } from '@affinidi/common'
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

const computePreparedJoloParams = async ({ registry, keysService, nonce, additionalJoloParams }: AnchoringParams) => {
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

const computePreparedElemParams = async ({ did }: AnchoringParams) => {
  return { did, didDocumentAddress: '', ethereumPublicKeyHex: '', transactionSignatureJson: '' }
}

const computePreparedPolygonParams = async ({ did, keysService, didMethod, registry }: AnchoringParams) => {
  const didService = new PolygonDidDocumentService(new LocalKeyVault(keysService), {
    isTestnet: didMethod === 'polygon:testnet',
  })
  const publicKeyBase58 = didService.getMyPubKeyBase58()
  const {
    body: { digestHex },
  } = await registry.createAnchorTransaction({ did, publicKeyBase58 })

  const transactionSignatureJson = await keysService.createTransactionSignature(digestHex)

  return { did, publicKeyBase58, transactionSignatureJson }
}

const computePreparedSolParams = async ({ did, keysService, didMethod, registry }: AnchoringParams) => {
  const network = didMethod.replace('sol', '') as 'testnet' | 'devnet' // and ''
  keysService.getOwnPrivateKey()
  const didService = new SolDidDocumentService(new LocalKeyVault(keysService), {
    network: network ?? 'mainnet',
  })
  const publicKeyBase58 = didService.getMyPubKeyBase58()
  const didDocument = didService.buildDidDocumentForRegister()
  const {
    body: { digestHex, serializedTransaction },
  } = await registry.createAnchorTransaction({ did, publicKeyBase58, didDocument })

  const signature = nacl.sign.detached(Buffer.from(digestHex, 'hex'), keysService.getOwnPrivateKey())

  return {
    did,
    publicKeyBase58,
    didDocument,
    serializedTransaction,
    transactionSignatureJson: Buffer.from(signature).toString('hex'),
  }
}

const computePreparedAnchoringParams = async (params: AnchoringParams) => {
  const { didMethod } = params
  // TODO: think about simplifying
  switch (didMethod) {
    case JOLO_DID_METHOD:
      return computePreparedJoloParams(params)
    case ELEM_DID_METHOD:
    case ELEM_ANCHORED_DID_METHOD:
      return computePreparedElemParams(params)
    case POLYGON_DID_METHOD:
    case POLYGON_TESTNET_DID_METHOD:
      return computePreparedPolygonParams(params)
    case SOL_DID_METHOD:
    case SOL_TESTNET_DID_METHOD:
    case SOL_DEVNET_DID_METHOD:
      return computePreparedSolParams(params)
    default:
      throw new Error(`did method: "${didMethod}" is not supported`)
  }
}

export const anchorDid = async (params: AnchoringParams): Promise<{ did: string }> => {
  const { registry, anchoredDidElem, nonce } = params
  const preparedParams = await computePreparedAnchoringParams(params)
  const response = await registry.anchorDid({
    ...preparedParams,
    nonce,
    anchoredDidElem,
  })

  return { did: response.body.did }
}
