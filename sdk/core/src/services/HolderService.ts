import uniq from 'lodash.uniq'

import { Affinity, JwtService, DidDocumentService, DigestService, KeysService } from '@affinidi/common'

import SdkError from '../shared/SdkError'
import { profile } from '@affinidi/common'
import { stripParamsFromDidUrl } from '../_helpers'

@profile()
export default class HolderService {
  private _didMap: any = {}
  private _apiKey: string
  private readonly _affinityService: Affinity
  private readonly _digestService: DigestService

  constructor(options: any) {
    const { registryUrl } = options

    const apiKey = options.apiKey || 'testApiKey'
    const apiKeyBuffer = KeysService.sha256(Buffer.from(apiKey))
    this._apiKey = apiKeyBuffer.toString('hex')

    this._affinityService = new Affinity({ registryUrl, apiKey: this._apiKey })
    this._digestService = new DigestService()
  }

  async buildCredentialOfferResponse(credentialOfferToken: string) {
    const credentialOffer = JwtService.fromJWT(credentialOfferToken)
    const { interactionToken: offerRequestInteractionToken } = credentialOffer.payload
    const { callbackURL, offeredCredentials } = offerRequestInteractionToken

    const selectedCredentials = offeredCredentials

    const interactionToken = {
      callbackURL,
      selectedCredentials,
    }

    const offerResponse = await JwtService.buildJWTInteractionToken(
      interactionToken,
      'credentialOfferResponse',
      credentialOffer,
    )

    return offerResponse
  }

  async buildCredentialResponse(credentialRequestToken: string, suppliedCredentials: any) {
    const credentialRequest = JwtService.fromJWT(credentialRequestToken)
    const { callbackURL } = credentialRequest.payload.interactionToken

    const interactionToken = {
      callbackURL,
      suppliedCredentials,
    }

    const credentialResponse = await JwtService.buildJWTInteractionToken(
      interactionToken,
      'credentialResponse',
      credentialRequest,
    )

    return credentialResponse
  }

  /* istanbul ignore next: private method */
  private _keyIdToDid(keyId: string): string {
    return DidDocumentService.keyIdToDid(keyId)
  }

  /* istanbul ignore next: private method */
  private async _resolveUniqDIDs(dids: string[]): Promise<void> {
    const promises = []
    const uniqDIDs = uniq(dids)

    for (const did of uniqDIDs) {
      promises.push(this._resolveDid(did))
    }

    await Promise.all(promises)
  }

  /* istanbul ignore next: private method */
  private async _resolveDid(did: string): Promise<any> {
    const didDocument = await this._affinityService.resolveDid(did)
    this._didMap[did] = didDocument

    return didDocument
  }

  /* istanbul ignore next: private method */
  private async _validateCredentials(
    credentials: any,
    holderKey?: string,
  ): Promise<{ result: boolean; error: string }[]> {
    const signatureValidationResults = []

    for (const credential of credentials) {
      const didDocument = this._didMap[this._keyIdToDid(credential.issuer)]

      const { result, error } = await this._affinityService.validateCredential(credential, holderKey, didDocument)

      signatureValidationResults.push({ result, error })
    }

    return signatureValidationResults
  }

  async verifyCredentialShareResponse(
    credentialShareResponseToken: string,
    credentialShareRequestToken?: string,
    /* istanbul ignore next: shouldOwn = true is covered ! */
    shouldOwn: boolean = true,
  ) {
    let isValid = true
    const errors = []

    const credentialShareResponse = JwtService.fromJWT(credentialShareResponseToken)

    const { iss: issuer, jti } = credentialShareResponse.payload
    const { suppliedCredentials } = credentialShareResponse.payload.interactionToken

    const didArray: string[] = []

    const holderDid = this._keyIdToDid(issuer)

    didArray.push(holderDid)

    for (const credential of suppliedCredentials) {
      const issuerDid = this._keyIdToDid(credential.issuer)

      didArray.push(issuerDid)
    }

    await this._resolveUniqDIDs(didArray)

    const didDocument = this._didMap[holderDid]

    try {
      await this._affinityService.validateJWT(credentialShareResponseToken, credentialShareRequestToken, didDocument)
    } catch (error) {
      if (error.message === 'Token expired') {
        throw new SdkError('COR-19')
      }

      throw error
    }

    let results

    if (shouldOwn) {
      results = await this._validateCredentials(suppliedCredentials, issuer)
    } else {
      results = await this._validateCredentials(suppliedCredentials)
    }

    for (const result of results) {
      if (result.result === false) {
        isValid = false
        errors.push(result.error)
      }
    }

    return { isValid, did: holderDid, jti, suppliedCredentials, errors }
  }

  /**
   * @description Slightly modified version of Affinity.validateJWT,
   * this validates that the given challenge was signed by the expected
   * issuer and that it isn't exipred.
   * @param vp - the presentation to be validated
   * when needed to verify if holder is a subject of VC
   * @returns { isValid, did, challenge, suppliedPresentations, errors }
   *
   * isValid - boolean, result of the verification
   *
   * did - DID of the VP issuer (holder of the shared VCs)
   *
   * challenge - unique identifier for the presentation.
   * You are responsible for checking this to protect against replay attacks
   *
   * suppliedPresentations - the validated presentation
   *
   * errors - array of validation errors
   */
  async verifyPresentationChallenge(challenge: string, expectedIssuer: string) {
    const token = Affinity.fromJwt(challenge)

    const { payload } = token

    const strippedExpectedIssuer = stripParamsFromDidUrl(expectedIssuer)
    const strippedPayloadIssuer = stripParamsFromDidUrl(payload.iss)
    if (strippedExpectedIssuer !== strippedPayloadIssuer) {
      throw new Error('Token not issued by expected issuer.')
    }

    const did = DidDocumentService.keyIdToDid(expectedIssuer)
    const didDocument = await this._affinityService.resolveDid(did)
    const publicKey = DidDocumentService.getPublicKey(strippedExpectedIssuer, didDocument)

    const { digest: tokenDigest, signature } = this._digestService.getTokenDigest(token)
    const isSignatureVerified = KeysService.verify(tokenDigest, publicKey, signature)

    if (!isSignatureVerified) {
      throw new Error('Signature on token is invalid')
    }

    if (payload.exp < Date.now()) {
      throw new Error('Token expired')
    }
  }
}
