import { IPlatformCryptographyTools } from '../shared/interfaces'
import { DidMethod, KeyOptions } from '../dto/shared.dto'
import { ELEM_ANCHORED_DID_METHOD, ELEM_DID_METHOD } from '../_defaultConfig'
import {
  DidDocumentService,
  generateFullSeed,
  KeysService,
  joinSeedWithMethodAndBase64EncodedData,
  generateSeedHexWithMethod,
} from '@affinidi/common'
import { AnchoringService } from './AnchoringService'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { buildBase64EncodedAdditionalData } from '@affinidi/common/dist/shared/seedTools'

export class RegisteringService {
  constructor(
    private readonly api: RegistryApiService,
    private readonly didMethod: DidMethod,
    private readonly platformCryptographyTools: IPlatformCryptographyTools,
    private readonly password: string,
    private readonly keyOptions?: KeyOptions,
  ) {}

  private get didGenerationMethod() {
    return this.didMethod !== ELEM_ANCHORED_DID_METHOD ? this.didMethod : ELEM_DID_METHOD
  }

  private get passwordBuffer() {
    return KeysService.normalizePassword(this.password)
  }

  private createAnchoringService(encryptedSeed: string, didDocument: any) {
    return new AnchoringService(this.api, encryptedSeed, this.password, didDocument, 0)
  }

  private async registerJoloOrElem() {
    const fullSeed = await generateFullSeed(this.platformCryptographyTools, this.didGenerationMethod, this.keyOptions)
    const encryptedSeed = await KeysService.encryptSeed(fullSeed, this.passwordBuffer)
    const keysService = new KeysService(encryptedSeed, this.password)

    const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
    const didDocument = await didDocumentService.buildDidDocument()
    const didDocumentKeyId = didDocumentService.getKeyId()
    const did = didDocument.id
    const anchoringService = this.createAnchoringService(encryptedSeed, didDocument)

    await anchoringService.anchorDid()

    return { did, encryptedSeed, didDocumentKeyId }
  }

  private async registerElemAnchored() {
    const fullSeed = await generateSeedHexWithMethod(this.didGenerationMethod)
    const encryptedSeed = await KeysService.encryptSeed(fullSeed, this.passwordBuffer)
    const keysService = new KeysService(encryptedSeed, this.password)

    const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
    const didDocument = await didDocumentService.buildDidDocument()
    const anchoringService = this.createAnchoringService(encryptedSeed, didDocument)

    const { did } = await anchoringService.anchorDid()

    return this.buildElemAnchoredSeed(did, fullSeed)
  }

  private async buildElemAnchoredSeed(did: string, originalSeedWithMethod: string) {
    const base64EncodedAdditionalData = await buildBase64EncodedAdditionalData(
      this.platformCryptographyTools,
      this.keyOptions,
      {
        anchoredDid: did,
      },
    )
    const seedWithMethod = originalSeedWithMethod.replace('++elem', '++elem-anchored')
    const elemAnchoredSeed = joinSeedWithMethodAndBase64EncodedData(seedWithMethod, base64EncodedAdditionalData)
    const elemAnchoredEncryptedSeed = await KeysService.encryptSeed(elemAnchoredSeed, this.passwordBuffer)
    const keysService = new KeysService(elemAnchoredEncryptedSeed, this.password)
    const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
    const didDocumentKeyId = didDocumentService.getKeyId()

    return { did, encryptedSeed: elemAnchoredEncryptedSeed, didDocumentKeyId }
  }

  async register() {
    if (this.didMethod === ELEM_ANCHORED_DID_METHOD) {
      return this.registerElemAnchored()
    }

    return this.registerJoloOrElem()
  }
}
