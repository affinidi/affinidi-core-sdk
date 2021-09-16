import { DidDocumentService, KeysService } from '@affinidi/common'

export const getDidDataFromKeysService = (keysService: KeysService) => {
  const didDocumentService = new DidDocumentService(keysService)
  const did = didDocumentService.getMyDid()
  const didDocumentKeyId = didDocumentService.getKeyId(did)

  return { did, didDocumentKeyId }
}

export const withDidData = (userData: { encryptedSeed: string; password: string }) => {
  const { encryptedSeed, password } = userData
  const keysService = new KeysService(encryptedSeed, password)
  const { did, didDocumentKeyId } = getDidDataFromKeysService(keysService)
  return { did, didDocumentKeyId, encryptedSeed, password }
}
