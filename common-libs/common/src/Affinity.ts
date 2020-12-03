import { buildVCV1, buildVPV1 } from '@affinidi/vc-common'
import { VCV1Unsigned, VCV1, VPV1, VPV1Unsigned, validateVCV1, validateVPV1 } from '@affinidi/vc-common'
import { parse } from 'did-resolver'
import { Secp256k1Signature, Secp256k1Key } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'
import { EventComponent, EventCategory, EventName, EventMetadata, EventInput } from '@affinidi/affinity-metrics-lib'

import { AffinityOptions } from './dto/shared.dto'
import { DEFAULT_REGISTRY_URL, DEFAULT_METRICS_URL } from './_defaultConfig'
import { DidDocumentService, KeysService, DigestService, JwtService, MetricsService } from './services'
import { baseDocumentLoader } from './_baseDocumentLoader'

const revocationList = require('vc-revocation-list') // eslint-disable-line
let fetch: any

if (!fetch) {
  fetch = require('node-fetch')
}

export class Affinity {
  private readonly _apiKey: string // TODO: this should be _accessApiKey
  private readonly _registryUrl: string
  private readonly _metricsUrl: string
  private readonly _metricsService: any
  private readonly _digestService: any
  protected _component: EventComponent

  constructor(options: AffinityOptions = {}) {
    this._apiKey = options.apiKey
    this._registryUrl = options.registryUrl || DEFAULT_REGISTRY_URL
    this._metricsUrl = options.metricsUrl || DEFAULT_METRICS_URL
    this._component = options.component || EventComponent.AffinidiCommon
    this._digestService = new DigestService()
    this._metricsService = new MetricsService({
      metricsUrl: this._metricsUrl,
      accessApiKey: this._apiKey,
      component: this._component,
    })
  }

  private _sendVCVerifiedMetric(credential: any, holderDid: string) {
    const metadata: EventMetadata = this._metricsService.parseVcMetadata(credential)
    const event: EventInput = {
      link: holderDid,
      name: EventName.VC_VERIFIED,
      category: EventCategory.VC,
      subCategory: 'verify',
      component: this._component,
      metadata: metadata,
    }

    this._metricsService.send(event)
  }

  private _sendVCSignedMetric(credential: any, holderDid: string, vcId: string) {
    const metadata: EventMetadata = this._metricsService.parseCommonVcMetadata(credential)
    const event: EventInput = {
      link: holderDid,
      secondaryLink: vcId,
      name: EventName.VC_SIGNED,
      category: EventCategory.VC,
      subCategory: 'sign',
      component: this._component,
      metadata: metadata,
    }

    this._metricsService.send(event)
  }

  private async _resolveDidIfNoDidDocument(did: string, didDocument?: any): Promise<any> {
    const isDidResolveNotRequired = !!didDocument && parse(did).did === parse(didDocument.id).did

    if (isDidResolveNotRequired) {
      return didDocument
    }

    return this.resolveDid(did)
  }

  async resolveDid(did: string): Promise<any> {
    const url = `${this._registryUrl}/api/v1/did/resolve-did`
    const body = JSON.stringify({ did }, null, 2)

    const headers = { Accept: 'application/json', 'Api-Key': this._apiKey, 'Content-Type': 'application/json' }

    const response = await fetch(url, { method: 'POST', headers, body })
    const result = await response.json()

    if (response.status.toString().startsWith('2')) {
      return result.didDocument
    } else {
      let error = new Error(result)

      if (result.message) {
        error = new Error(result.message)
      }

      throw error
    }
  }

  async validateJWT(encryptedtoken: string, initialEncryptedtoken?: string, didDocument?: any) {
    const token = Affinity.fromJwt(encryptedtoken)

    const { payload } = token
    const did = DidDocumentService.keyIdToDid(payload.iss)

    didDocument = await this._resolveDidIfNoDidDocument(did, didDocument)

    const publicKey = DidDocumentService.getPublicKey(payload.iss, didDocument, payload.kid)

    const { digest: tokenDigest, signature } = this._digestService.getTokenDigest(token)
    const isSignatureVerified = KeysService.verify(tokenDigest, publicKey, signature)

    if (!isSignatureVerified) {
      throw new Error('Signature on token is invalid')
    }

    if (payload.exp < Date.now()) {
      throw new Error('Token expired')
    }

    if (initialEncryptedtoken) {
      const sendToken = Affinity.fromJwt(initialEncryptedtoken)

      if (sendToken.payload.jti !== payload.jti) {
        throw new Error('The token nonce does not match the request')
      }

      const responseAudienceDid = parse(payload.aud).did
      const requestIssuerDid = parse(sendToken.payload.iss)
      if (requestIssuerDid !== responseAudienceDid) {
        throw new Error('The request token issuer does not match audience of the response token')
      }

      if (sendToken.payload.aud) {
        const requestAudienceDid = parse(sendToken.payload.aud).did
        const responseIssuerDid = parse(did).did
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

  private readonly _documentLoader = async (url: string) => {
    if (url.startsWith('did:')) {
      const did = url.indexOf('#') >= 0 ? DidDocumentService.keyIdToDid(url) : url
      const didDocument = await this.resolveDid(did)

      return {
        contextUrl: null,
        document: didDocument,
        documentUrl: url,
      }
    }

    return baseDocumentLoader(url)
  }

  async _checkCredentialStatus(credential: any): Promise<{ verified: boolean; error?: string }> {
    if (credential.credentialStatus) {
      // We don't need to have `revocationList.checkStatus` verify the VC because we already do that
      const verifyRevocationListCredential = false
      const documentLoader = this._documentLoader
      const { verified, error } = await revocationList.checkStatus({
        credential,
        documentLoader,
        verifyRevocationListCredential,
      })

      return { verified, error }
    }

    return { verified: true }
  }

  async validateCredential(
    credential: any,
    holderKey?: string,
    didDocument?: any,
  ): Promise<{ result: boolean; error: string }> {
    if (credential.claim) {
      return this._validateLegacyCredential(credential, holderKey, didDocument)
    } else {
      const result = await validateVCV1({
        documentLoader: this._documentLoader,
        getVerifySuite: async ({ proofType, verificationMethod, controller }) => {
          if (proofType !== 'EcdsaSecp256k1Signature2019') {
            throw new Error(`Unsupported proofType: ${proofType}`)
          }

          const resolvedDidDocument = await this._resolveDidIfNoDidDocument(controller, didDocument)
          const publicKeyHex = DidDocumentService.getPublicKey(verificationMethod, resolvedDidDocument).toString('hex')

          return new Secp256k1Signature({
            key: new Secp256k1Key({
              publicKeyHex: publicKeyHex,
              id: verificationMethod,
              controller,
            }),
          })
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

      if (result.kind === 'invalid') {
        let legacyValidated

        try {
          // Cover the case where a credential was signed the old way but used "credentialSubject" instead of "claim"
          legacyValidated = await this._validateLegacyCredential(credential, holderKey, didDocument)
        } catch {
          // We don't need to handle caught errors
        }

        if (legacyValidated && legacyValidated.result) {
          return legacyValidated
        } else {
          const errors = result.errors.map((error) => `${error.kind}: ${error.message}`).join('\n')

          return {
            result: false,
            error: `${credential.id}: The following errors have occurred:\n${errors}`,
          }
        }
      } else if (holderKey) {
        const holderDid = DidDocumentService.keyIdToDid(holderKey)
        if (parse(result.data.holder.id).did !== parse(holderDid).did) {
          return { result: false, error: `${credential.id}: The provided holder is not holder of this credential.` }
        }
      }

      const { verified, error } = await this._checkCredentialStatus(credential)
      if (!verified) {
        return { result: false, error }
      }

      // send VC_VERIFIED metrics when verification is successful
      // TODO: also record failed verification?
      let isTestEnvironment = false

      if (process && process.env) {
        isTestEnvironment = process.env.NODE_ENV === 'test'
      }

      if (!isTestEnvironment) {
        this._sendVCVerifiedMetric(credential, parse(result.data.holder.id).did)
      }

      return { result: true, error: '' }
    }
  }

  async signCredential<VC extends VCV1Unsigned>(
    unsignedCredential: VC,
    encryptedSeed: string,
    encryptionKey: string,
  ): Promise<VCV1> {
    const keyService = new KeysService(encryptedSeed, encryptionKey)
    const { seed, didMethod } = keyService.decryptSeed()

    const didDocumentService = new DidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    const vc = buildVCV1({
      unsigned: unsignedCredential,
      issuer: {
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
      documentLoader: this._documentLoader,
      getProofPurposeOptions: async () => ({
        controller: await didDocumentService.buildDidDocument(),
      }),
    })

    // send VC_SIGNED event
    let isTestEnvironment = false

    if (process && process.env) {
      isTestEnvironment = process.env.NODE_ENV === 'test'
    }

    if (!isTestEnvironment) {
      const holderDid = parse(unsignedCredential.holder.id).did
      const vcId = unsignedCredential.id
      this._sendVCSignedMetric(unsignedCredential, holderDid, vcId)
    }

    return vc
  }

  async validatePresentation(
    vp: any,
    didDocument?: any,
  ): Promise<{ result: true; data: VPV1 } | { result: false; error: string }> {
    const result = await validateVPV1({
      documentLoader: this._documentLoader,
      getVerifySuite: async ({ proofType, verificationMethod, controller }) => {
        if (proofType !== 'EcdsaSecp256k1Signature2019') {
          throw new Error(`Unsupported proofType: ${proofType}`)
        }

        const resolvedDidDocument = await this._resolveDidIfNoDidDocument(controller, didDocument)

        const publicKeyHex = DidDocumentService.getPublicKey(verificationMethod, resolvedDidDocument).toString('hex')

        return new Secp256k1Signature({
          key: new Secp256k1Key({
            publicKeyHex: publicKeyHex,
            id: verificationMethod,
            controller,
          }),
        })
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

    if (result.kind === 'invalid') {
      const errors = result.errors.map((error) => `${error.kind}: ${error.message}`).join('\n')

      return {
        result: false,
        error: `${vp.id}: The following errors have occurred:\n${errors}`,
      }
    }

    return { result: true, data: result.data }
  }

  async signPresentation(opts: {
    vp: VPV1Unsigned
    encryption: { seed: string; key: string }
    purpose: { challenge: string; domain: string }
  }): Promise<VPV1> {
    const keyService = new KeysService(opts.encryption.seed, opts.encryption.key)
    const { seed, didMethod } = keyService.decryptSeed()

    const didDocumentService = new DidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    return buildVPV1({
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
      documentLoader: this._documentLoader,
      getProofPurposeOptions: () => ({
        challenge: opts.purpose.challenge,
        domain: opts.purpose.domain,
      }),
    })
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

  static signJWTObject(jwtObject: any, encryptedSeed: string, encryptionKey: string) {
    const keyService = new KeysService(encryptedSeed, encryptionKey)

    return keyService.signJWT(jwtObject)
  }

  static encodeObjectToJWT(jwtObject: any) {
    const jwtService = new JwtService()

    return jwtService.encodeObjectToJWT(jwtObject)
  }

  static encryptSeed(seedHexWithMethod: string, encryptionKey: string) {
    const encryptionKeyBuffer = KeysService.normalizePassword(encryptionKey)

    return KeysService.encryptSeed(seedHexWithMethod, encryptionKeyBuffer)
  }
}
