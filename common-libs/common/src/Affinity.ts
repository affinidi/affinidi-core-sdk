import { EventComponent, EventName, VerificationInvalidReason } from '@affinidi/affinity-metrics-lib'
import { Secp256k1Signature, Secp256k1Key } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'
import { JwtService } from '@affinidi/tools-common'
import { buildVCV1, buildVPV1, removeIfExists, SimpleThing, VCV1Subject, VCV1SubjectBaseMA } from '@affinidi/vc-common'
import { VCV1Unsigned, VCV1, VPV1, VPV1Unsigned, validateVCV1, validateVPV1 } from '@affinidi/vc-common'
import { resolveUrl, Service } from '@affinidi/url-resolver'
import { parse } from 'did-resolver'

import { AffinityOptions, EventOptions } from './dto/shared.dto'
import { DidDocumentService, KeysService, DigestService, MetricsService } from './services'
import { baseDocumentLoader } from './_baseDocumentLoader'
import { IPlatformCryptographyTools, ProofType } from './shared/interfaces'
import { DidResolver } from './shared/DidResolver'
import { buildObjectSkeletonFromPaths, injectFieldForAllParentRoots, validateObjectHasPaths } from './utils/objectUtil'

const revocationList = require('vc-revocation-list') // eslint-disable-line

type KeySuiteType = 'ecdsa' | 'rsa' | 'bbs'
const BBS_CONTEXT = 'https://w3id.org/security/bbs/v1'

export class Affinity {
  private readonly _didResolver
  private readonly _metricsService
  private readonly _digestService
  private readonly _platformCryptographyTools

  constructor(options: AffinityOptions, platformCryptographyTools: IPlatformCryptographyTools) {
    this._didResolver = new DidResolver({
      registryUrl: options.registryUrl ?? resolveUrl(Service.REGISTRY, 'staging'),
      accessApiKey: options.apiKey,
    })
    this._digestService = new DigestService()
    this._metricsService = new MetricsService({
      metricsUrl: options.metricsUrl ?? resolveUrl(Service.METRICS, 'staging'),
      accessApiKey: options.apiKey,
      component: options.component || EventComponent.AffinidiCommon,
    })
    this._platformCryptographyTools = platformCryptographyTools
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
    const did = DidDocumentService.keyIdToDid(payload.iss)

    didDocument = await this._resolveDidIfNoDidDocument(did, didDocument)

    const publicKey = DidDocumentService.getPublicKey(payload.iss, didDocument, payload.kid)

    const { digest: tokenDigest, signature } = this._digestService.getTokenDigest(token)
    const isSignatureVerified = KeysService.verify(tokenDigest, publicKey, signature)

    const eventOptions: EventOptions = { link: did, name: EventName.VP_VERIFIED_JWT }

    if (!isSignatureVerified) {
      if (payload.typ === 'credentialResponse') {
        // send failed VP_VERIFIED_JWT event due to invalid signature
        eventOptions.verificationMetadata = {
          isValid: false,
          invalidReason: VerificationInvalidReason.JWT_INVALID_SIGNATURE,
        }
        this._metricsService.sendVpEvent(eventOptions)
      }

      throw new Error('Signature on token is invalid')
    }

    if (payload.exp < Date.now()) {
      if (payload.typ === 'credentialResponse') {
        // send failed VP_VERIFIED_JWT event due to token expired
        eventOptions.verificationMetadata = {
          isValid: false,
          invalidReason: VerificationInvalidReason.JWT_EXPIRED,
        }
        this._metricsService.sendVpEvent(eventOptions)
      }

      throw new Error('Token expired')
    }

    if (initialEncryptedtoken) {
      const sendToken = Affinity.fromJwt(initialEncryptedtoken)

      if (sendToken.payload.jti !== payload.jti) {
        if (payload.typ === 'credentialResponse') {
          // send failed VP_VERIFIED_JWT event due to token nonce mismatch
          eventOptions.verificationMetadata = {
            isValid: false,
            invalidReason: VerificationInvalidReason.JWT_NONCE_MISMATCHED,
          }
          this._metricsService.sendVpEvent(eventOptions)
        }

        throw new Error('The token nonce does not match the request')
      }

      if (payload.aud && sendToken.payload.iss) {
        const responseAudienceDid = parse(payload.aud).did // the one who received and verified the VP
        const requestIssuerDid = parse(sendToken.payload.iss).did // the one who requested the VP to verify
        if (requestIssuerDid !== responseAudienceDid) {
          if (payload.typ === 'credentialResponse') {
            // send failed VP_VERIFIED_JWT event due to audience mismatch:
            // the verifier who verified the VP is not the one who requested for it
            eventOptions.verificationMetadata = {
              isValid: false,
              invalidReason: VerificationInvalidReason.JWT_VERIFIER_MISMATCHED,
            }
            this._metricsService.sendVpEvent(eventOptions)
          }

          throw new Error('The request token issuer does not match audience of the response token')
        }
      }

      if (sendToken.payload.aud) {
        const requestAudienceDid = parse(sendToken.payload.aud).did // the intended holder requested by the verifier
        const responseIssuerDid = parse(did).did // the holder who sent the VP in response to the verifier
        if (requestAudienceDid !== responseIssuerDid) {
          if (payload.typ === 'credentialResponse') {
            // send failed VP_VERIFIED_JWT event due to audience mismatch:
            // the holder who sent the VP is not the one specified by verifier in the original request
            eventOptions.verificationMetadata = {
              isValid: false,
              invalidReason: VerificationInvalidReason.JWT_HOLDER_MISMATCHED,
            }
            this._metricsService.sendVpEvent(eventOptions)
          }

          throw new Error('The token issuer does not match audience of the request token')
        }
      }
    }

    // send successful VP_VERIFIED_JWT event
    if (payload.typ === 'credentialResponse') {
      eventOptions.verificationMetadata = { isValid: true }
      this._metricsService.sendVpEvent(eventOptions)
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

          return {
            controller: resolvedDidDoc,
          }
        }

        throw new Error(`Unsupported proofPurpose: ${proofPurpose}`)
      },
    })(credential)

    let eventOptions: EventOptions

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

      // send failed VC_VERIFIED event due to generic error
      if (credential.holder) {
        // TODO: also send the event when holder is not available, maybe add a metadata property to indicate that
        const eventOptions: EventOptions = {
          link: credential.holder.id, // no access to result.data in case of error
          name: EventName.VC_VERIFIED,
        }
        eventOptions.verificationMetadata = {
          isValid: false,
          invalidReason: VerificationInvalidReason.ERROR,
          errorMessage: errors,
        }
        this._metricsService.sendVcEvent(credential, eventOptions)
      }

      return {
        result: false,
        error: `${credential.id}: The following errors have occurred:\n${errors}`,
      }
    } else if (holderKey) {
      const holderDid = DidDocumentService.keyIdToDid(holderKey)
      if (parse(result.data.holder.id).did !== parse(holderDid).did) {
        // send failed VC_VERIFIED event due to holder mismatch
        eventOptions = {
          link: parse(result.data.holder.id).did,
          name: EventName.VC_VERIFIED,
          verificationMetadata: {
            isValid: false,
            invalidReason: VerificationInvalidReason.HOLDER_MISMATCHED,
          },
        }
        this._metricsService.sendVcEvent(credential, eventOptions)
        return { result: false, error: `${credential.id}: The provided holder is not holder of this credential.` }
      }
    }

    // check revocation status
    const { verified, error } = await this._checkCredentialStatus(credential)
    if (!verified) {
      // send failed VC_VERIFIED event due to revocation
      eventOptions = {
        link: parse(result.data.holder.id).did,
        name: EventName.VC_VERIFIED,
        verificationMetadata: { isValid: false, invalidReason: VerificationInvalidReason.REVOKED },
      }
      this._metricsService.sendVcEvent(credential, eventOptions)
      return {
        result: false,
        error: error || `${credential.id}: Credential revocation status check result is negative.`,
      }
    }

    // send VC_VERIFIED event when verification is successful
    if (result.data.holder) {
      // TODO: also send the event when holder is not available, maybe add a metadata property to indicate that
      const eventOptions = {
        link: parse(result.data.holder.id).did,
        name: EventName.VC_VERIFIED,
      }
      this._metricsService.sendVcEvent(credential, eventOptions)
    }

    return { result: true, error: '' }
  }

  private getIssuerForSigning(keySuiteType: KeySuiteType, keyService: KeysService, did: string, mainKeyId: string) {
    const shortDid = mainKeyId.split('#')[0]

    switch (keySuiteType) {
      case 'ecdsa':
        return {
          did,
          keyId: mainKeyId,
          privateKey: keyService.getOwnPrivateKey().toString('hex'),
        }
      case 'rsa':
        return {
          did,
          keyId: `${shortDid}#secondary`,
          privateKey: keyService.getExternalPrivateKey('rsa'),
        }
      case 'bbs':
        return {
          did,
          keyId: `${shortDid}#bbs`,
          privateKey: keyService.getExternalPrivateKey('bbs'),
          publicKey: keyService.getExternalPublicKey('bbs'),
        }
      default:
        throw new Error(`Unsupported key type '${keySuiteType}`)
    }
  }

  postprocessCredentialToSign<TVC extends VCV1Unsigned>(unsignedCredential: TVC, keySuiteType: KeySuiteType) {
    if (keySuiteType === 'bbs') {
      return {
        ...unsignedCredential,
        '@context': [...removeIfExists(unsignedCredential['@context'], BBS_CONTEXT), BBS_CONTEXT],
      }
    }

    return unsignedCredential
  }

  async signCredential<TSubject extends VCV1SubjectBaseMA>(
    unsignedCredentialInput: VCV1Unsigned<TSubject>,
    encryptedSeed: string,
    encryptionKey: string,
    keySuiteType: KeySuiteType = 'ecdsa',
  ): Promise<VCV1<TSubject>> {
    const keyService = new KeysService(encryptedSeed, encryptionKey)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()
    const mainKeyId = didDocumentService.getKeyId()
    const issuer = this.getIssuerForSigning(keySuiteType, keyService, did, mainKeyId)
    const unsignedCredential = this.postprocessCredentialToSign(unsignedCredentialInput, keySuiteType)

    const signedVc = buildVCV1<TSubject>({
      unsigned: unsignedCredential,
      issuer,
      compactProof: keySuiteType === 'bbs',
      getSignSuite: this._platformCryptographyTools.signSuites[keySuiteType],
      documentLoader: this._createDocumentLoader(),
      getProofPurposeOptions: async () => ({
        controller: await didDocumentService.getDidDocument(this._didResolver),
      }),
    })

    // send VC_SIGNED event
    if (unsignedCredential.holder) {
      // TODO: also send the event when holder is not available, maybe add a metadata property to indicate that
      const eventOptions = {
        link: parse(unsignedCredential.holder.id).did,
        secondaryLink: unsignedCredential.id,
        name: EventName.VC_SIGNED,
      }
      this._metricsService.sendVcEvent(unsignedCredential, eventOptions)
    }

    return signedVc
  }

  async validatePresentation(
    vp: any,
    didDocument?: any,
  ): Promise<{ result: true; data: VPV1 } | { result: false; error: string }> {
    const result = await validateVPV1({
      documentLoader: this._createDocumentLoader(),
      getVerifySuite: async ({ proofType, verificationMethod, controller }) => {
        if (proofType !== 'EcdsaSecp256k1Signature2019') {
          throw new Error(`Unsupported proofType: ${proofType}`)
        }

        const resolvedDidDocument = await this._resolveDidIfNoDidDocument(controller, didDocument)
        const publicKey = DidDocumentService.getPublicKey(verificationMethod, resolvedDidDocument)
        const factory = this._platformCryptographyTools.verifySuiteFactories[proofType]

        return factory(publicKey, verificationMethod, controller)
      },
      getProofPurposeOptions: async ({ proofPurpose, controller }) => {
        switch (proofPurpose) {
          case 'authentication':
          case 'assertionMethod': {
            const resolvedDidDoc = await this._resolveDidIfNoDidDocument(controller, didDocument)

            return {
              controller: resolvedDidDoc,
            }
          }

          default:
            throw new Error(`Unsupported proofPurpose: ${proofPurpose}`)
        }
      },
    })(vp)

    let eventOptions: EventOptions

    if (result.kind === 'invalid') {
      const errors = result.errors.map((error) => `${error.kind}: ${error.message}`).join('\n')
      // send failed VP_VERIFIED event due to generic error
      eventOptions = {
        link: vp.holder.id, // no access to result.data in case of error
        name: EventName.VP_VERIFIED,
        verificationMetadata: {
          isValid: false,
          invalidReason: VerificationInvalidReason.ERROR,
          errorMessage: errors,
        },
      }
      this._metricsService.sendVpEvent(eventOptions)

      return {
        result: false,
        error: `${vp.id}: The following errors have occurred:\n${errors}`,
      }
    }

    // send successful VP_VERIFIED event
    eventOptions = {
      link: parse(result.data.holder.id).did,
      name: EventName.VP_VERIFIED,
      verificationMetadata: { isValid: true },
    }
    this._metricsService.sendVpEvent(eventOptions)

    return { result: true, data: result.data }
  }

  async signPresentation(opts: {
    vp: VPV1Unsigned
    encryption: { seed: string; key: string }
    purpose: { challenge: string; domain: string }
  }): Promise<VPV1> {
    const keyService = new KeysService(opts.encryption.seed, opts.encryption.key)
    const { seed, didMethod } = keyService.decryptSeed()

    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    const signedVp = buildVPV1({
      unsigned: opts.vp,
      holder: {
        did,
        keyId: didDocumentService.getKeyId(),
        privateKey: KeysService.getPrivateKey(seed.toString('hex'), didMethod).toString('hex'),
      },
      getSignSuite: ({ keyId, privateKey, controller }) => {
        return new Secp256k1Signature({
          key: new Secp256k1Key({
            id: keyId,
            controller,
            privateKeyHex: privateKey,
          }),
        })
      },
      documentLoader: this._createDocumentLoader(),
      getProofPurposeOptions: () => ({
        challenge: opts.purpose.challenge,
        domain: opts.purpose.domain,
      }),
    })

    // send VP_SIGNED event
    const eventOptions = {
      link: did,
      secondaryLink: opts.vp.id,
      name: EventName.VP_SIGNED,
    }
    this._metricsService.sendVpEvent(eventOptions)

    return signedVp
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

  async signJWTObject(jwtObject: any, encryptedSeed: string, encryptionKey: string) {
    const signedJwtObject = Affinity.signJWTObject(jwtObject, encryptedSeed, encryptionKey)

    // send VP_SIGNED_JWT event
    if (jwtObject.payload.typ === 'credentialResponse') {
      const eventOptions = {
        link: jwtObject.payload.iss,
        secondaryLink: jwtObject.payload.jti,
        name: EventName.VP_SIGNED_JWT,
      }
      this._metricsService.sendVpEvent(eventOptions)
    }

    return signedJwtObject
  }

  // to be deprecated and replaced with instance method
  static signJWTObject(jwtObject: any, encryptedSeed: string, encryptionKey: string) {
    const keyService = new KeysService(encryptedSeed, encryptionKey)
    return keyService.signJWT(jwtObject)
  }

  static encodeObjectToJWT(jwtObject: any) {
    return JwtService.encodeObjectToJWT(jwtObject)
  }

  static encryptSeed(seedHexWithMethod: string, encryptionKey: string) {
    const encryptionKeyBuffer = KeysService.normalizePassword(encryptionKey)

    return KeysService.encryptSeed(seedHexWithMethod, encryptionKeyBuffer)
  }

  async deriveSegmentProof<TKeys extends string, TData extends SimpleThing & Record<TKeys, unknown>>(
    credential: VCV1<VCV1Subject<TData>>,
    fields: TKeys[],
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

    const revealDocument = this._buildFragment(credential, fields)

    return this._platformCryptographyTools.deriveBbsSegmentProof({
      credential,
      revealDocument,
      documentLoader,
    })
  }

  private _buildFragment<TKeys extends string, TData extends SimpleThing & Record<TKeys, unknown>>(
    credential: VCV1<VCV1Subject<TData>>,
    fields: string[],
  ) {
    if (Array.isArray(credential.credentialSubject)) {
      throw new Error()
    }

    const validationErrors = validateObjectHasPaths(credential.credentialSubject.data, fields)
    if (validationErrors) {
      const firstError = validationErrors[0]
      throw new Error(`Field "${firstError.field}" not a part of credential`)
    }

    const dataFields = buildObjectSkeletonFromPaths(fields)
    injectFieldForAllParentRoots(dataFields, '@explicit', true)

    const fragment = {
      '@context': credential['@context'],
      type: credential.type,
      credentialSubject: {
        data: {
          '@type': credential.credentialSubject.data['@type'],
          '@explicit': true,
          ...dataFields,
        },
      },
    }

    return fragment
  }
}
