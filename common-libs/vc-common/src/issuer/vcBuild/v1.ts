import warning from 'tiny-warning'

import {
  VCV1SubjectBaseMA,
  VCV1Revocation,
  VCV1,
  TContext,
  VCV1Holder,
  VCV1Unsigned,
  VCV1Skeleton,
  DocumentLoader,
} from '../../'
import { Signer, GetSignSuiteFn, GetProofPurposeOptionsFn, removeIfExists, validateId } from '../common'

const jsigs = require('jsonld-signatures')
const { AssertionProofPurpose } = jsigs.purposes

export const getVCV1JSONContext = () => {
  warning(
    false,
    'getVCV1JSONContext should be treated as a temporary solution and not a final solution for VC contexts.',
  )

  return {
    '@version': 1.1,
    data: {
      '@id': 'https://docs.affinity-project.org/vc-common/vc/context/index.html#data',
      '@type': '@json',
    },
  }
}

type BuildVCV1Skeleton = <S extends VCV1SubjectBaseMA>(opts: {
  id: string
  credentialSubject: S
  holder: VCV1Holder
  type: string | string[]
  context?: TContext
}) => VCV1Skeleton<S>

export const buildVCV1Skeleton: BuildVCV1Skeleton = ({ id, credentialSubject, holder, type, context }) => {
  validateId(id)

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      ...removeIfExists(context, 'https://www.w3.org/2018/credentials/v1'),
    ],
    id,
    type: ['VerifiableCredential', ...removeIfExists(type, 'VerifiableCredential')],
    holder,
    credentialSubject,
  }
}

type BuildVCV1Unsigned = <S extends VCV1SubjectBaseMA, R extends VCV1Revocation>(opts: {
  skeleton: VCV1Skeleton<S>
  issuanceDate: string
  expirationDate?: string
  revocation?: R
}) => VCV1Unsigned<S>

export const buildVCV1Unsigned: BuildVCV1Unsigned = ({ skeleton, issuanceDate, expirationDate, revocation }) => {
  validateId(skeleton.id)

  return {
    ...skeleton,
    issuanceDate,
    ...(expirationDate ? { expirationDate } : undefined),
    ...(revocation ? { revocation } : undefined),
  }
}

export type GetAssertionProofPurposeOptionsFn = GetProofPurposeOptionsFn<Record<string, any>>

type BuildVCV1 = <S extends VCV1SubjectBaseMA>(opts: {
  unsigned: VCV1Unsigned<S>
  issuer: Signer
  getSignSuite: GetSignSuiteFn
  documentLoader: DocumentLoader
  getProofPurposeOptions?: GetAssertionProofPurposeOptionsFn
}) => Promise<VCV1<S>>

export const buildVCV1: BuildVCV1 = async ({
  unsigned,
  issuer,
  getSignSuite,
  documentLoader,
  getProofPurposeOptions,
}) => {
  validateId(unsigned.id, true)

  try {
    console.log('<><><><> buildVCV1 <><><><>')
    let before

    before = Date.now()

    const result = await jsigs.sign(
      {
        ...unsigned,
        issuer: issuer.did,
      },
      {
        suite: await getSignSuite({
          controller: issuer.did,
          keyId: issuer.keyId,
          privateKey: issuer.privateKey,
        }),
        documentLoader: documentLoader,
        purpose: new AssertionProofPurpose(
          getProofPurposeOptions
            ? await getProofPurposeOptions({
                controller: issuer.did,
                keyId: issuer.keyId,
              })
            : {},
        ),
        compactProof: false,
      },
    )

    console.log('  <><><><> jsigs.sign', { diff: Date.now() - before })

    return result
  } catch (error) {
    if (
      typeof error.message === 'string' &&
      /The property ".+" in the input was not defined in the context./g.test(error.message)
    ) {
      throw new Error(
        error.message +
          ' Make sure all properties are defined in the context' +
          'or if there is not a completed context for this VC type use the provided "getVCV1JSONContext" function.',
      )
    } else {
      throw error
    }
  }
}
