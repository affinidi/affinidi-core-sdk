import { parse } from 'did-resolver'

import {
  VPV1,
  VCV1,
  VCV1Holder,
  VPV1Proof,
  VCV1Revocation,
  VCV1Proof,
  VCV1Subject,
  DocumentLoader,
  absoluteURIRegex,
} from '../../'
import {
  genValidateFn,
  Validator,
  createValidatorResponse,
  isArrayOfNonEmptyStrings,
  isValid,
  isNonEmptyString,
  isArrayIncluding,
  isUndefinedOr,
  isArrayOf,
  isOneOf,
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
  jws: isNonEmptyString,
})

const isValidVCProof = (
  documentLoader: DocumentLoader,
  getVerifySuite: GetVerifySuiteFn,
  getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn,
): Validator => async (value, data) => {
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
      compactProof: false,
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

const validateCredentialSubjectData = genValidateFn<VCV1Subject<any>['data']>({
  '@type': isOneOf(isNonEmptyString, isArrayOfNonEmptyStrings),
})

const validateCredentialSubject = genValidateFn<VCV1Subject<any>>({
  id: [isUndefinedOr(isNonEmptyString), isUndefinedOr(isValidDID)],
  data: isValid(validateCredentialSubjectData),
})

const isValidVPProof = (
  documentLoader: DocumentLoader,
  getVerifySuite: GetVerifySuiteFn,
  getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn,
): Validator => async (value, data) => {
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
        challenge: data.proof.challenge,
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

export type GetVerifySuiteFn = (options: GetVerifySuiteOptions) => any | Promise<any>

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
}: {
  documentLoader: DocumentLoader
  getVerifySuite: GetVerifySuiteFn
  getProofPurposeOptions?: GetVerifierProofPurposeOptionsFn
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
    proof: [isValid(validateVCProofStructure), isValidVCProof(documentLoader, getVerifySuite, getProofPurposeOptions)],
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
    verifiableCredential: [
      isArrayOf(isValid(validateVCV1({ documentLoader, getVerifySuite, getProofPurposeOptions }))),
      isArrayOf((value, data) =>
        createValidatorResponse(
          // Parse the DID URLs to compare just the DID part
          parse(data.holder.id).did === parse(value.holder.id).did,
          `Credential ${value.id} has a different holder than the VP`,
        ),
      ),
    ],
    holder: isValid(validateHolder),
    proof: [isValid(validateVPProofStructure), isValidVPProof(documentLoader, getVerifySuite, getProofPurposeOptions)],
  })
