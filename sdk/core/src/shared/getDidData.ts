import { DidDocumentService, KeysService } from '@affinidi/common'

export const getDidDataFromKeysService = (keysService: KeysService) => {
  const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const did = didDocumentService.getMyDid()
  const didDocumentKeyId = didDocumentService.getKeyId()

  return { did, didDocumentKeyId }
}

export const withDidData = (userData: { encryptedSeed: string; password: string; didDocument?: any }) => {
  const { encryptedSeed, password, didDocument } = userData
  const keysService = new KeysService(encryptedSeed, password)
  const { did, didDocumentKeyId } = getDidDataFromKeysService(keysService)
  return { did, didDocumentKeyId, encryptedSeed, password, didDocument }
}
