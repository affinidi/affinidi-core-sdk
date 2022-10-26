import { IPlatformCryptographyTools } from '../shared/interfaces'
import { DidMethod, KeyOptions } from '../dto/shared.dto'
import { ELEM_ANCHORED_DID_METHOD, ELEM_DID_METHOD } from '../_defaultConfig'
import { DidDocumentService, extendSeedWithDid, generateFullSeed, KeysService } from '@affinidi/common'
import { anchorDid } from './anchoringHandler'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { parseDecryptedSeed } from '@affinidi/common/dist/shared/seedTools'

export const register = async (
  registry: RegistryApiService,
  didMethod: DidMethod,
  platformCryptographyTools: IPlatformCryptographyTools,
  password: string,
  keyOptions?: KeyOptions,
  origin?: string,
  skipAnchoringForElemMethod?: boolean,
) => {
  const isAnchoredSeed = didMethod === ELEM_ANCHORED_DID_METHOD

  const seedWithMethod = await generateFullSeed(platformCryptographyTools, didMethod, keyOptions)
  const { keysService, encryptedSeed } = await KeysService.fromSeedAndPassword(seedWithMethod, password)

  const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const { did: builtDid, didDocument, keyId } = await didDocumentService.buildDidDocumentForRegister()

  let anchoredInBlockchainDid

  if (didMethod != ELEM_DID_METHOD || !(skipAnchoringForElemMethod ?? false)) {
    const response = await anchorDid({
      registry,
      keysService,
      didMethod,
      did: builtDid,
      anchoredDidElem: isAnchoredSeed,
      nonce: 0,
      additionalJoloParams: {
        didDocument,
        seedHex: parseDecryptedSeed(seedWithMethod).seed.toString('hex'),
      },
      origin,
    })
    anchoredInBlockchainDid = response.did
  }

  if (isAnchoredSeed) {
    const anchoredSeed = extendSeedWithDid(seedWithMethod, anchoredInBlockchainDid)

    const { encryptedSeed: anchoredEncryptedSeed, keysService } = await KeysService.fromSeedAndPassword(
      anchoredSeed,
      password,
    )
    const anchoredDocumentService = DidDocumentService.createDidDocumentService(keysService)
    const didDocumentKeyId = anchoredDocumentService.getKeyId()

    return { did: anchoredInBlockchainDid, encryptedSeed: anchoredEncryptedSeed, didDocumentKeyId }
  }

  const didDocumentKeyId = keyId
  return { did: didDocumentService.getMyDid(), didDocumentKeyId, encryptedSeed }
}
