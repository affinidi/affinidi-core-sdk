import { parse } from 'did-resolver'

import { DocumentLoader, absoluteURIRegex } from '../../shared'
import { VCV1, VCV1Holder, VCV1Revocation, VCV1Proof, VCV1Subject } from '../../vc'
import { PresentationSubmissionV1, PresentationSubmissionDescriptorV1, VPV1, VPV1Proof } from '../../vp'
import {
  genValidateFn,
  ValidateFn,
  Validator,
  createValidatorResponse,
  isArrayOfNonEmptyStrings,
  isValid,
  isNonEmptyString,
  isArrayIncluding,
  isUndefinedOr,
  isArrayOf,
  isEnum,
  ErrorConfig,
} from '../util'

const jsigs = require('jsonld-signatures')
const { AssertionProofPurpose, AuthenticationProofPurpose } = jsigs.purposes

const isValidDID: Validator<string> = (value) => {
  return createValidatorResponse(value.startsWith('did:'), 'Expected to start with "did:"')
}

const isAbsoluteURI: Validator<string> = (value) => {
  return createValidatorResponse(absoluteURIRegex.test(value), 'Expected to start with "did:"')
}

const isValidContext: Validator = (value) => {
  const normalizedValue = Array.isArray(value) ? value : [value]

  return createValidatorResponse(
    normalizedValue.every((context) => {
      if (typeof context === 'string') {
        if (context.trim().length === 0) return false
        return true
      }

      if (typeof context === 'object') return true

      return false
    }),
    'Expected to be string or object OR an array of strings and/or objects',
  )
}

const validateHolder = genValidateFn<VCV1Holder>({
  id: [isNonEmptyString, isValidDID],
})

const validatePresentationSubmissionDescriptor: ValidateFn<PresentationSubmissionDescriptorV1> = async (data) => {
  const idIsValid = await isNonEmptyString(data['id'], data)
  const pathIsValid = await isNonEmptyString(data['path'], data)
  const pathNestedIsValid = await isUndefinedOr(isValid(validatePresentationSubmissionDescriptor))(
    data['path_nested'],
    data,
  )
  const formatIsValid = await isEnum(['jwt', 'jwt_vc', 'jwt_vp', 'ldp', 'ldp_vc', 'ldp_vp'])(data['format'], data)

  const errors: ErrorConfig[] = []

  if (idIsValid !== true) {
    errors.push({
      kind: 'invalid_param',
      message: `Invalid value for field "id": ${idIsValid.message}`,
    })
  }

  if (pathIsValid !== true) {
    errors.push({
      kind: 'invalid_param',
      message: `Invalid value for field "path": ${pathIsValid.message}`,
    })
  }

  if (pathNestedIsValid !== true) {
    errors.push({
      kind: 'invalid_param',
      message: `Invalid value for field "path_nested": ${pathNestedIsValid.message}`,
    })
  }

  if (formatIsValid !== true) {
    errors.push({
      kind: 'invalid_param',
      message: `Invalid value for field "format": ${formatIsValid.message}`,
    })
  }

  if (errors.length > 0) {
    return {
      kind: 'invalid',
      errors,
    }
  }

  return {
    kind: 'valid',
    data: data as PresentationSubmissionDescriptorV1,
  }
}

const validatePresentationSubmission = genValidateFn<PresentationSubmissionV1>({
  locale: isUndefinedOr(isNonEmptyString),
  descriptor_map: isArrayOf(isValid(validatePresentationSubmissionDescriptor)),
})

const validateVPProofStructure = genValidateFn<VPV1Proof>({
  type: isNonEmptyString,
  created: isNonEmptyString,
  proofPurpose: [
    isNonEmptyString,
    (value: any) => createValidatorResponse(value === 'authentication', 'Expected to be "authentication"'),
  ],
  verificationMethod: [isNonEmptyString, isValidDID],
  challenge: isNonEmptyString,
  domain: isNonEmptyString,
  jws: isNonEmptyString,
})

const validateRevocation = genValidateFn<VCV1Revocation>({
  id: isNonEmptyString,
})

const validateVCProofStructure = genValidateFn<VCV1Proof>({
  type: isNonEmptyString,
  created: isNonEmptyString,
  proofPurpose: [
    isNonEmptyString,
    (value: any) => createValidatorResponse(value === 'assertionMethod', 'Expected to be "assertionMethod"'),
  ],
  verificationMethod: [isNonEmptyString, isValidDID],
  jws: async (value, data) => data.proofValue !== undefined || isNonEmptyString(value, data),
  proofValue: async (value, data) => data.jws !== undefined || isNonEmptyString(value, data),
})

type IsValidVCProof = (options: {
  documentLoader: DocumentLoader
  getVerifySuite: GetVerifySuiteFn
  getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn
  compactProof?: boolean
}) => Validator

const isValidVCProof: IsValidVCProof =
  ({ documentLoader, getVerifySuite, getProofPurposeOptions, compactProof }): Validator =>
  async (value, data) => {
    try {
      let suite
      try {
        suite = await getVerifySuite({
          verificationMethod: value.verificationMethod,
          controller: data.issuer,
          proofType: value.type,
        })
      } catch (err) {
        throw new Error(`Error while getting verify suite ${err}`)
      }

      let purposeOptions
      if (typeof getProofPurposeOptions !== 'undefined') {
        try {
          purposeOptions = await getProofPurposeOptions({
            verificationMethod: value.verificationMethod,
            controller: data.issuer,
            proofPurpose: value.proofPurpose,
          })
        } catch (err) {
          throw new Error(`Error while getting verify proof purpose options ${err}`)
        }
      }

      const res = await jsigs.verify(data, {
        suite: suite,
        documentLoader,
        purpose: new AssertionProofPurpose(purposeOptions || {}),
        compactProof,
      })

      if (res.verified) {
        return true
      } else {
        return { message: `Invalid credential proof:\n${res.error.errors.join('\n')}` }
      }
    } catch (err) {
      return { message: `Error while validating proof: ${err}` }
    }
  }

const validateCredentialSubject = genValidateFn<VCV1Subject<any>>({
  id: [isUndefinedOr(isNonEmptyString), isUndefinedOr(isValidDID)],
})

const isValidVPProof =
  (
    documentLoader: DocumentLoader,
    getVerifySuite: GetVerifySuiteFn,
    getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn,
  ): Validator =>
  async (value, data, { challenge }) => {
    try {
      let suite
      try {
        suite = await getVerifySuite({
          verificationMethod: value.verificationMethod,
          controller: data.holder.id,
          proofType: value.type,
        })
      } catch (err) {
        throw new Error(`Error while getting verify suite ${err}`)
      }

      let purposeOptions
      if (typeof getProofPurposeOptions !== 'undefined') {
        try {
          purposeOptions = await getProofPurposeOptions({
            verificationMethod: value.verificationMethod,
            controller: data.holder.id,
            proofPurpose: value.proofPurpose,
          })
        } catch (err) {
          throw new Error(`Error while getting verify proof purpose options ${err}`)
        }
      }

      const res = await jsigs.verify(data, {
        suite,
        documentLoader,
        purpose: new AuthenticationProofPurpose({
          challenge: challenge || data.proof.challenge,
          domain: data.proof.domain,
          ...(purposeOptions || {}),
        }),
        compactProof: false,
      })

      if (res.verified) {
        return true
      } else {
        return { message: `Invalid presentation proof:\n${res.error.errors.join('\n')}` }
      }
    } catch (err) {
      return { message: `Error while validating proof: ${err}` }
    }
  }

export type GetVerifySuiteOptions = {
  verificationMethod: string
  controller: string
  proofType: string
}

export type VerifySuite = Partial<{
  matchProof(params: Record<'proof' | 'document' | 'documentLoader' | 'expansionMap', any>): boolean | Promise<boolean>
  verifyProof(
    params: Record<'proof' | 'document' | 'purpose' | 'documentLoader' | 'expansionMap' | 'compactProof', any>,
  ): Promise<any>
}>

export type GetVerifySuiteFn = (options: GetVerifySuiteOptions) => VerifySuite | Promise<VerifySuite>

export type GetVerifierProofPurposeOptionsOptions = {
  proofPurpose: string
  verificationMethod: string
  controller: string
}

export type GetVerifierProofPurposeOptionsFn = (
  options: GetVerifierProofPurposeOptionsOptions,
) => Record<string, any> | Promise<Record<string, any>>

export const validateVCV1 = ({
  documentLoader,
  getVerifySuite,
  getProofPurposeOptions,
  compactProof = false,
}: {
  documentLoader: DocumentLoader
  getVerifySuite: GetVerifySuiteFn
  getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn
  compactProof?: boolean
}) =>
  genValidateFn<VCV1>({
    '@context': isValidContext,
    id: [isNonEmptyString, isAbsoluteURI],
    type: [isArrayOfNonEmptyStrings, isArrayIncluding('VerifiableCredential')],
    holder: isValid(validateHolder),
    issuer: [isNonEmptyString, isValidDID],
    issuanceDate: isNonEmptyString,
    expirationDate: [
      isUndefinedOr(isNonEmptyString),
      (value, data) => {
        if (typeof value === 'undefined') return true
        const now = new Date()
        const expires = new Date(value)

        return createValidatorResponse(expires.getTime() >= now.getTime(), `Credential "${data.id}" is expired.`)
      },
    ],
    credentialSubject: isValid(validateCredentialSubject),
    revocation: isUndefinedOr(isValid(validateRevocation)),
    proof: [
      isValid(validateVCProofStructure),
      isValidVCProof({ documentLoader, getVerifySuite, getProofPurposeOptions, compactProof }),
    ],
  })

export const validateVPV1 = ({
  documentLoader,
  getVerifySuite,
  getProofPurposeOptions,
}: {
  documentLoader: DocumentLoader
  getVerifySuite: GetVerifySuiteFn
  getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn
}) =>
  genValidateFn<VPV1<VCV1>>({
    '@context': isValidContext,
    id: [isUndefinedOr(isNonEmptyString), isUndefinedOr(isAbsoluteURI)],
    type: [isArrayOfNonEmptyStrings, isArrayIncluding('VerifiablePresentation')],
    presentation_submission: isUndefinedOr(isValid(validatePresentationSubmission)),
    verifiableCredential: [
      isArrayOf(isValid(validateVCV1({ documentLoader, getVerifySuite, getProofPurposeOptions }))),
      isArrayOf((value, data: Record<string, any>) => {
        const dataHolderId = parse(data?.holder?.id)
        const valueHolderId = parse(value?.holder?.id)
        return createValidatorResponse(
          // Parse the DID URLs to compare just the DID part
          dataHolderId !== null && valueHolderId !== null && dataHolderId.did === valueHolderId.did,
          `Credential ${value.id} has a different holder than the VP`,
        )
      }),
    ],
    holder: isValid(validateHolder),
    proof: [isValid(validateVPProofStructure), isValidVPProof(documentLoader, getVerifySuite, getProofPurposeOptions)],
  })
