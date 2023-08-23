import { JwtService } from '@affinidi/tools-common'
import { SimpleThing, VCV1Subject, VCV1SubjectBaseMA } from '@affinidi/vc-common'
import { VCV1Unsigned, VCV1, VPV1, VPV1Unsigned, validateVCV1, validateVPV1 } from '@affinidi/vc-common'
import { resolveUrl, Service } from '@affinidi/url-resolver'
import { parse } from 'did-resolver'

import { AffinityOptions, DocumentLoader } from './dto/shared.dto'
import { DidDocumentService, KeysService, DigestService } from './services'
import { baseDocumentLoader } from './_baseDocumentLoader'
import { IPlatformCryptographyTools, ProofType } from './shared/interfaces'
import { LocalDidResolver } from './shared/DidResolver'
import { buildObjectSkeletonFromPaths, injectFieldForAllParentRoots } from './utils/objectUtil'
import { KeyManager, KeySuiteType, UnsignedJwtObject } from './services/KeyManager/KeyManager'
import { LocalKeyManager } from './services/KeyManager/LocalKeyManager'

const revocationList = require('vc-revocation-list')

const NO_KEY_MANAGER_ERROR =
  '"keyManager" or "keysService" has to be provided as constructor argument for Affinity class' +
  ' to perform operations with Private Key'

// TODO: further refactoring to decouple functionality that can work without Private Key
export class Affinity {
  private readonly _didResolver
  private readonly _digestService
  private readonly _platformCryptographyTools
  private readonly _keyManager: KeyManager
  private readonly _beforeDocumentLoader?: DocumentLoader

  constructor(options: AffinityOptions, platformCryptographyTools: IPlatformCryptographyTools) {
    this._didResolver =
      options.didResolver ??
      new LocalDidResolver({
        registryUrl: options.registryUrl ?? resolveUrl(Service.REGISTRY, 'dev'),
        accessApiKey: options.apiKey,
        useCache: options.useCache ?? true,
        cacheMaxSize: options.cacheMaxSize,
        cacheTtlInMin: options.cacheTtlInMin,
        resolveLegacyElemLocally: options.resolveLegacyElemLocally,
        resolveKeyLocally: options.resolveKeyLocally,
      })
    this._digestService = new DigestService()
    this._platformCryptographyTools = platformCryptographyTools
    if (options.keyManager) {
      this._keyManager = options.keyManager
    } else if (options.keysService) {
      this._keyManager = new LocalKeyManager(
        options.keysService,
        platformCryptographyTools,
        this._createDocumentLoader(),
        this._didResolver,
      )
    }

    this._beforeDocumentLoader = options.beforeDocumentLoader
  }

  private async _resolveDidIfNoDidDocument(did: string, didDocument?: any): Promise<any> {
    const isDidResolveNotRequired = !!didDocument && parse(did).did === parse(didDocument.id).did

    if (isDidResolveNotRequired) {
      return didDocument
    }

    return this.resolveDid(did)
  }

  async resolveDid(did: string): Promise<any> {
    return this._didResolver.resolveDid(did)
  }

  async validateJWT(encryptedtoken: string, initialEncryptedtoken?: string, didDocument?: any) {
    const token = Affinity.fromJwt(encryptedtoken)

    const { payload } = token
    const did = payload.iss

    didDocument = await this._resolveDidIfNoDidDocument(did, didDocument)

    const publicKey = DidDocumentService.getPublicKey(payload.iss, didDocument, payload.kid)

    const { digest: tokenDigest, signature } = this._digestService.getTokenDigest(token)
    const isSignatureVerified = KeysService.verify(tokenDigest, publicKey, signature)

    if (!isSignatureVerified) {
      throw new Error('Signature on token is invalid')
    }

    if (payload.expiresAt) {
      if (payload.expiresAt < Date.now()) {
        throw new Error('Token expired')
      }
    } else {
      if (payload.exp < Date.now()) {
        throw new Error('Token expired')
      }
    }

    if (initialEncryptedtoken) {
      const sendToken = Affinity.fromJwt(initialEncryptedtoken)

      if (sendToken.payload.jti !== payload.jti) {
        throw new Error('The token nonce does not match the request')
      }

      if (payload.aud && sendToken.payload.iss) {
        const responseAudienceDid = parse(payload.aud).did // the one who received and verified the VP
        const requestIssuerDid = parse(sendToken.payload.iss).did // the one who requested the VP to verify
        if (requestIssuerDid !== responseAudienceDid) {
          throw new Error('The request token issuer does not match audience of the response token')
        }
      }

      if (sendToken.payload.aud) {
        const requestAudienceDid = parse(sendToken.payload.aud).did // the intended holder requested by the verifier
        const responseIssuerDid = parse(did).did // the holder who sent the VP in response to the verifier
        if (requestAudienceDid !== responseIssuerDid) {
          throw new Error('The token issuer does not match audience of the request token')
        }
      }
    }
  }

  private async _validateLegacyCredential(
    credential: any,
    holderKey?: string,
    didDocument?: any,
  ): Promise<{ result: boolean; error: string }> {
    let result

    const now = new Date()
    const expires = new Date(credential.expires)

    const isExpired = expires.getTime() < now.getTime()

    if (isExpired) {
      return { result: false, error: `${credential.id}: VC is expired.` }
    }

    if (holderKey) {
      const holderDid = DidDocumentService.keyIdToDid(holderKey)

      let holderIsSubject
      if (credential.claim) {
        holderIsSubject = holderDid === DidDocumentService.keyIdToDid(credential.claim.id) // to support already created creds
      } else {
        holderIsSubject = holderDid === DidDocumentService.keyIdToDid(credential.credentialSubject.id)
      }

      if (!holderIsSubject) {
        return { result: false, error: `${credential.id}: Holder is not the subject of VC.` }
      }
    }

    try {
      const issuerPublicKey = await this._getCredentialIssuerPublicKey(credential, didDocument)
      const { digest, signature } = await this._digestService.getJsonLdDigest(credential)

      result = KeysService.verify(digest, issuerPublicKey, signature)

      if (result !== true) {
        return { result, error: `${credential.id}: Signature is not valid.` }
      }
    } catch (error) {
      return { result: false, error: `${credential.id}: ${error.message}` }
    }

    return { result, error: '' }
  }

  _createDocumentLoader(resolvedDids: Record<string, any> = {}) {
    return async (url: string) => {
      const beforeDocumentLoaderResult = await this._beforeDocumentLoader?.(url)
      if (beforeDocumentLoaderResult) return beforeDocumentLoaderResult
      if (url.startsWith('did:')) {
        const did = url.includes('#') ? DidDocumentService.keyIdToDid(url) : url

        const didDocument = resolvedDids[did] ?? (await this.resolveDid(did))

        return {
          contextUrl: null,
          document: didDocument,
          documentUrl: url,
        }
      }

      return baseDocumentLoader(url)
    }
  }

  async checkCredentialStatus(credential: any): Promise<{ verified: boolean; error?: string }> {
    return this._checkCredentialStatus(credential)
  }

  async _checkCredentialStatus(credential: any): Promise<{ verified: boolean; error?: string }> {
    if (credential.credentialStatus) {
      // We don't need to have `revocationList.checkStatus` verify the VC because we already do that
      const verifyRevocationListCredential = false
      const documentLoader = this._createDocumentLoader()
      const { verified, error } = await revocationList.checkStatus({
        credential,
        documentLoader,
        verifyRevocationListCredential,
        verifyMatchingIssuers: false,
      })

      return { verified, error }
    }

    return { verified: true }
  }

  public async validateCredential(
    credential: any,
    holderKey?: string,
    didDocument?: any,
  ): Promise<{ result: boolean; error: string }> {
    if (credential.claim) {
      return this._validateLegacyCredential(credential, holderKey, didDocument)
    }

    const issuerDidDocument = await this._resolveDidIfNoDidDocument(credential.issuer, didDocument)
    const issuerDid = parse(credential.issuer).did
    const documentLoader = this._createDocumentLoader({
      [issuerDid]: issuerDidDocument,
    })

    // segment proof has slightly different structure and therefore it's easier to verify it separately
    if (credential.proof.type === 'BbsBlsSignatureProof2020') {
      return await this._platformCryptographyTools.validateBbsSegmentProof({
        credential,
        issuerDidDocument,
        documentLoader,
      })
    }

    const result = await validateVCV1({
      compactProof: credential.proof.type === 'BbsBlsSignature2020',
      documentLoader,
      getVerifySuite: async ({ proofType, verificationMethod, controller }) => {
        const publicKey = DidDocumentService.getPublicKey(verificationMethod, issuerDidDocument)
        const factories = this._platformCryptographyTools.verifySuiteFactories
        if (proofType in factories) {
          return factories[proofType as ProofType](publicKey, verificationMethod, controller)
        }

        throw new Error(`Unsupported proofType: ${proofType}`)
      },
      getProofPurposeOptions: async ({ proofPurpose, controller }) => {
        if (proofPurpose === 'assertionMethod') {
          const resolvedDidDoc = await this._resolveDidIfNoDidDocument(controller, didDocument)
          // TODO: workaround, for now polygon dids has only verificationMethod
          // it could be changed in future as polygon is under developing
          if (!resolvedDidDoc[proofPurpose] && resolvedDidDoc.verificationMethod) {
            resolvedDidDoc[proofPurpose] = resolvedDidDoc.verificationMethod
          }

          return {
            controller: resolvedDidDoc,
          }
        }

        throw new Error(`Unsupported proofPurpose: ${proofPurpose}`)
      },
    })(credential)

    if (result.kind === 'invalid') {
      try {
        // Cover the case where a credential was signed the old way but used "credentialSubject" instead of "claim"
        const legacyValidated = await this._validateLegacyCredential(credential, holderKey, didDocument)

        if (legacyValidated && legacyValidated.result) {
          return legacyValidated
        }
      } catch {
        // We don't need to handle caught errors
      }

      const errors = result.errors.map((error) => `${error.kind}: ${error.message}`).join('\n')

      return {
        result: false,
        error: `${credential.id}: The following errors have occurred:\n${errors}`,
      }
    } else if (holderKey) {
      const holderDid = DidDocumentService.keyIdToDid(holderKey)
      if (parse(result.data.holder.id).did !== parse(holderDid).did) {
        return { result: false, error: `${credential.id}: The provided holder is not holder of this credential.` }
      }
    }

    // check revocation status
    const { verified, error } = await this._checkCredentialStatus(credential)
    if (!verified) {
      return {
        result: false,
        error: error || `${credential.id}: Credential revocation status check result is negative.`,
      }
    }

    return { result: true, error: '' }
  }

  async signCredential<TSubject extends VCV1SubjectBaseMA>(
    unsignedCredentialInput: VCV1Unsigned<TSubject>,
    keySuiteType: KeySuiteType = 'ecdsa',
  ): Promise<VCV1<TSubject>> {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager.signCredential(unsignedCredentialInput, keySuiteType)
  }

  _getProvidedDidDocument(didDocuments: any, controller: string, didDocument: any) {
    const controllerDid = parse(controller).did
    const providedDidDocument = didDocuments[controllerDid] || didDocuments[controller] || didDocument

    return providedDidDocument
  }

  async validatePresentation(
    vp: any,
    didDocument?: any,
    challenge?: string,
    didDocuments: any = {},
  ): Promise<{ result: true; data: VPV1 } | { result: false; error: string }> {
    const result = await validateVPV1({
      documentLoader: this._createDocumentLoader(),
      getVerifySuite: async ({ proofType, verificationMethod, controller }) => {
        if (proofType !== 'EcdsaSecp256k1Signature2019') {
          throw new Error(`Unsupported proofType: ${proofType}`)
        }

        const providedDidDocument = this._getProvidedDidDocument(didDocuments, controller, didDocument)
        const resolvedDidDocument = await this._resolveDidIfNoDidDocument(controller, providedDidDocument)
        const publicKey = DidDocumentService.getPublicKey(verificationMethod, resolvedDidDocument)
        const factory = this._platformCryptographyTools.verifySuiteFactories[proofType]

        return factory(publicKey, verificationMethod, controller)
      },
      getProofPurposeOptions: async ({ proofPurpose, controller }) => {
        const providedDidDocument = this._getProvidedDidDocument(didDocuments, controller, didDocument)
        switch (proofPurpose) {
          case 'authentication':
          case 'assertionMethod': {
            const resolvedDidDoc = await this._resolveDidIfNoDidDocument(controller, providedDidDocument)

            // TODO: workaround, for now polygon dids has only verificationMethod
            // it could be changed in future as polygon is under developing

            if (!resolvedDidDoc[proofPurpose] && resolvedDidDoc.verificationMethod) {
              resolvedDidDoc[proofPurpose] = resolvedDidDoc.verificationMethod
            }

            return {
              controller: resolvedDidDoc,
            }
          }

          default:
            throw new Error(`Unsupported proofPurpose: ${proofPurpose}`)
        }
      },
    })(vp, { challenge })

    if (result.kind === 'invalid') {
      const errors = result.errors.map((error) => `${error.kind}: ${error.message}`).join('\n')

      return {
        result: false,
        error: `${vp.id}: The following errors have occurred:\n${errors}`,
      }
    }

    return { result: true, data: result.data }
  }

  async signPresentation(opts: { vp: VPV1Unsigned; purpose: { challenge: string; domain: string } }): Promise<VPV1> {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager.signPresentation(opts.vp, opts.purpose)
  }

  private async _getCredentialIssuerPublicKey(credential: any, didDocument?: any): Promise<Buffer> {
    const keyId = credential.proof.creator || credential.proof.verificationMethod
    const did = DidDocumentService.keyIdToDid(keyId)
    didDocument = await this._resolveDidIfNoDidDocument(did, didDocument)

    return DidDocumentService.getPublicKey(keyId, didDocument)
  }

  static fromJwt(jwt: string) {
    return JwtService.fromJWT(jwt)
  }

  async signJWTObject(jwtObject: UnsignedJwtObject, keyId?: string) {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager.signJWTObject(jwtObject, keyId)
  }

  static encodeObjectToJWT(jwtObject: any) {
    return JwtService.encodeObjectToJWT(jwtObject)
  }

  static encryptSeed(seedHexWithMethod: string, encryptionKey: string) {
    const encryptionKeyBuffer = KeysService.normalizePassword(encryptionKey)

    return KeysService.encryptSeed(seedHexWithMethod, encryptionKeyBuffer)
  }

  async deriveSegmentProof(
    credential: VCV1<VCV1Subject<SimpleThing>>,
    paths: string[],
    didDocument?: any,
  ): Promise<any> {
    if ('id' in credential.credentialSubject) {
      throw new Error('Segment proof cannot be derived when "credentialSubject.id" is present')
    }

    const issuerDidDocument = await this._resolveDidIfNoDidDocument(credential.issuer, didDocument)
    const issuerDid = parse(credential.issuer).did
    const documentLoader = this._createDocumentLoader({
      [issuerDid]: issuerDidDocument,
    })

    const revealDocument = this._buildFragment(credential, paths)

    return this._platformCryptographyTools.deriveBbsSegmentProof({
      credential,
      revealDocument,
      documentLoader,
    })
  }

  private _buildFragment(credential: VCV1<VCV1Subject<SimpleThing>>, paths: string[]) {
    if (Array.isArray(credential.credentialSubject)) {
      throw new Error('credentialSubject can not be an array')
    }

    const skeleton = buildObjectSkeletonFromPaths(paths, credential.credentialSubject)
    const dataFields = injectFieldForAllParentRoots(skeleton, '@explicit', true)

    const fragment = {
      '@context': credential['@context'],
      type: credential.type,
      credentialSubject: {
        ...dataFields,
      },
    }

    return fragment
  }

  decryptByPrivateKey(encryptedMessage: string): Promise<any> {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager.decryptByPrivateKey(encryptedMessage)
  }

  signAsync(buffer: Buffer): Promise<Buffer> {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager.signAsync(buffer)
  }

  getAnchorTransactionPublicKey(): Promise<string> {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager.getAnchorTransactionPublicKey()
  }

  getKeyManager() {
    if (!this._keyManager) throw new Error(NO_KEY_MANAGER_ERROR)
    return this._keyManager
  }
}
