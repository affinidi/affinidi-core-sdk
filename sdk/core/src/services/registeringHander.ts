import { IPlatformCryptographyTools } from '../shared/interfaces'
import { DidMethod, KeyOptions } from '../dto/shared.dto'
import { ELEM_ANCHORED_DID_METHOD, ELEM_DID_METHOD, JOLO_DID_METHOD } from '../_defaultConfig'
import {
  DidDocumentService,
  generateFullSeed,
  KeysService,
  joinSeedWithMethodAndBase64EncodedData,
  generateSeedHexWithMethod,
} from '@affinidi/common'
import { anchorDid } from './anchoringHandler'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { buildBase64EncodedAdditionalData } from '@affinidi/common/dist/shared/seedTools'

const registerJoloOrElem = async (
  api: RegistryApiService,
  didMethod: string,
  password: string,
  platformCryptographyTools: IPlatformCryptographyTools,
  keyOptions?: KeyOptions,
) => {
  const passwordBuffer = KeysService.normalizePassword(password)
  const seedWithMethod = await generateFullSeed(platformCryptographyTools, didMethod, keyOptions)
  const encryptedSeed = await KeysService.encryptSeed(seedWithMethod, passwordBuffer)
  const keysService = new KeysService(encryptedSeed, password)

  const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const didDocument = await didDocumentService.buildDidDocument()
  const did = didDocument.id
  const didDocumentKeyId = didDocumentService.getKeyId()

  await anchorDid(api, encryptedSeed, password, didDocument, false)

  return { did, didDocumentKeyId, encryptedSeed }
}

const registerElemAnchored = async (
  api: RegistryApiService,
  password: string,
  platformCryptographyTools: IPlatformCryptographyTools,
  keyOptions?: KeyOptions,
) => {
  const passwordBuffer = KeysService.normalizePassword(password)
  const seedWithHexMethod = await generateSeedHexWithMethod(ELEM_DID_METHOD)
  const encryptedSeed = await KeysService.encryptSeed(seedWithHexMethod, passwordBuffer)

  const didElemKeysService = new KeysService(encryptedSeed, password)

  const didElemDocumentService = DidDocumentService.createDidDocumentService(didElemKeysService)
  const didDocument = await didElemDocumentService.buildDidDocument()

  const { did } = await anchorDid(api, encryptedSeed, password, didDocument, true)

  const elemAnchoredSeed = await buildElemAnchoredSeed(did, seedWithHexMethod, platformCryptographyTools, keyOptions)

  const elemAnchoredEncryptedSeed = await KeysService.encryptSeed(elemAnchoredSeed, passwordBuffer)
  const keysService = new KeysService(elemAnchoredEncryptedSeed, password)
  const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const didDocumentKeyId = didDocumentService.getKeyId()

  return { did, encryptedSeed: elemAnchoredEncryptedSeed, didDocumentKeyId }
}

const buildElemAnchoredSeed = async (
  did: string,
  originalSeedWithMethod: string,
  platformCryptographyTools: IPlatformCryptographyTools,
  keyOptions?: KeyOptions,
) => {
  const base64EncodedAdditionalData = await buildBase64EncodedAdditionalData(platformCryptographyTools, keyOptions, {
    anchoredDid: did,
  })
  const seedWithMethod = originalSeedWithMethod.replace('++elem', '++elem-anchored')
  return joinSeedWithMethodAndBase64EncodedData(seedWithMethod, base64EncodedAdditionalData)
}

export const register = (
  api: RegistryApiService,
  didMethod: DidMethod,
  platformCryptographyTools: IPlatformCryptographyTools,
  password: string,
  keyOptions?: KeyOptions,
) => {
  if ([ELEM_DID_METHOD, JOLO_DID_METHOD].includes(didMethod)) {
    return registerJoloOrElem(api, didMethod, password, platformCryptographyTools, keyOptions)
  }

  if (ELEM_ANCHORED_DID_METHOD === didMethod) {
    return registerElemAnchored(api, password, platformCryptographyTools, keyOptions)
  }

  throw new Error(`did method: "${didMethod}" is not supported`)
}
