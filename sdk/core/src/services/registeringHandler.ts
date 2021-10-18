import { IPlatformCryptographyTools } from '../shared/interfaces'
import { DidMethod, KeyOptions } from '../dto/shared.dto'
import { ELEM_ANCHORED_DID_METHOD } from '../_defaultConfig'
import { DidDocumentService, extendSeedWithDid, generateFullSeed, KeysService } from '@affinidi/common'
import { anchorDid } from './anchoringHandler'
import { RegistryApiService } from '@affinidi/internal-api-clients'

export const register = async (
  api: RegistryApiService,
  didMethod: DidMethod,
  platformCryptographyTools: IPlatformCryptographyTools,
  password: string,
  keyOptions?: KeyOptions,
) => {
  const isAnchoredSeed = didMethod === ELEM_ANCHORED_DID_METHOD

  const seedWithMethod = await generateFullSeed(platformCryptographyTools, didMethod, keyOptions)
  const { keysService, encryptedSeed } = await KeysService.fromSeedAndPassword(seedWithMethod, password)

  const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const { didDocument, keyId } = await didDocumentService.buildDidDocumentForRegister()

  const { did: anchoredInBlockchainDid } = await anchorDid(api, encryptedSeed, password, didDocument, isAnchoredSeed)

  if (isAnchoredSeed) {
    const anchoredSeed = extendSeedWithDid(seedWithMethod, anchoredInBlockchainDid)

    const { encryptedSeed: anchoredEncryptedSeed } = await KeysService.fromSeedAndPassword(anchoredSeed, password)
    const didDocumentKeyId = didDocumentService.getKeyId(anchoredInBlockchainDid)

    return { did: anchoredInBlockchainDid, encryptedSeed: anchoredEncryptedSeed, didDocumentKeyId }
  }

  const didDocumentKeyId = keyId
  return { did: didDocumentService.getMyDid(), didDocumentKeyId, encryptedSeed }
}
