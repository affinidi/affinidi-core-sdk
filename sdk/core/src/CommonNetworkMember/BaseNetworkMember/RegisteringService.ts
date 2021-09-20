import { ParsedOptions } from '../../shared/getOptionsFromEnvironment'
import { IPlatformCryptographyTools } from '../../shared/interfaces'
import { KeyOptions } from '../../dto/shared.dto'
import { DEFAULT_DID_METHOD, ELEM_ANCHORED_DID_METHOD, ELEM_DID_METHOD } from '../../_defaultConfig'
import { DidDocumentService, generateFullSeed, KeysService } from '@affinidi/common'
import { AnchoringService } from './AnchoringService'

export class RegisteringService {
  constructor(
    private readonly options: ParsedOptions,
    private readonly platformCryptographyTools: IPlatformCryptographyTools,
    private readonly password: string,
    private readonly keyOptions?: KeyOptions,
  ) {}

  private get didMethod() {
    return this.options.otherOptions.didMethod || DEFAULT_DID_METHOD
  }

  private get didGenerationMethod() {
    return this.didMethod !== ELEM_ANCHORED_DID_METHOD ? this.didMethod : ELEM_DID_METHOD
  }

  private get isDidElemAnchored() {
    return this.didMethod === ELEM_ANCHORED_DID_METHOD || undefined
  }

  private get passwordBuffer() {
    return KeysService.normalizePassword(this.password)
  }

  private async buildNewDid() {
    const fullSeed = await generateFullSeed(this.platformCryptographyTools, this.didGenerationMethod, this.keyOptions)
    const encryptedSeed = await KeysService.encryptSeed(fullSeed, this.passwordBuffer)
    const keysService = new KeysService(encryptedSeed, this.password)

    const didDocumentService = DidDocumentService.createDidDocumentService(keysService)
    const didDocument = await didDocumentService.buildDidDocument()
    const did = didDocument.id
    return { did, encryptedSeed, didDocument, fullSeed }
  }

  private async buildElemAnchoredSeed(did: string, originalFullSeed: string) {
    const elemAnchoredSeedDraft = await generateFullSeed(
      this.platformCryptographyTools,
      this.didMethod,
      this.keyOptions,
      {
        anchoredDid: did,
      },
    )
    const originalSeed = originalFullSeed.split('++')[0]
    const draftSeed = elemAnchoredSeedDraft.split('++')[0]
    const elemAnchoredSeed = elemAnchoredSeedDraft.replace(draftSeed, originalSeed)
    const elemAnchoredEncryptedSeed = await KeysService.encryptSeed(elemAnchoredSeed, this.passwordBuffer)

    return { did, encryptedSeed: elemAnchoredEncryptedSeed }
  }

  async register() {
    const { did, encryptedSeed, didDocument, fullSeed } = await this.buildNewDid()
    const anchoringService = new AnchoringService(
      encryptedSeed,
      this.password,
      didDocument,
      0,
      this.options,
      this.isDidElemAnchored,
    )

    await anchoringService.anchorDid()

    if (this.didMethod === ELEM_ANCHORED_DID_METHOD) {
      return this.buildElemAnchoredSeed(did, fullSeed)
    }

    return { did, encryptedSeed }
  }
}
