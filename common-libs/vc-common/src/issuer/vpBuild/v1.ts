import warning from 'tiny-warning'

import { VCV1, TContext, VPV1, VPV1Unsigned, VPV1Holder, DocumentLoader } from '../../'
import { Signer, GetSignSuiteFn, GetProofPurposeOptionsFn, removeIfExists, validateId } from '../common'
import { PresentationSubmissionV1 } from '../../vp'

const jsigs = require('jsonld-signatures')
const { AuthenticationProofPurpose } = jsigs.purposes

type BuildVPV1Unsigned = (opts: {
  id?: string
  vcs: VCV1[]
  holder: VPV1Holder
  type?: string | string[]
  context?: TContext,
  presentation_submission?: PresentationSubmissionV1
}) => VPV1Unsigned

export const buildVPV1Unsigned: BuildVPV1Unsigned = ({ id, vcs, holder, type, context, presentation_submission }): VPV1Unsigned => {
  if (id) {
    validateId(id)
  } else {
    warning(
      false,
      'An id should be supplied for the VP. Otherwise top-level, non-object properties (like "type") will be malleable.',
    )
  }

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      ...removeIfExists(context, 'https://www.w3.org/2018/credentials/v1'),
      ...(typeof presentation_submission === 'undefined' ? [] : ['https://identity.foundation/presentation-exchange/submission/v1'])
    ],
    ...(id ? { id } : {}),
    type: ['VerifiablePresentation', ...removeIfExists(type, 'VerifiablePresentation')],
    holder: holder,
    verifiableCredential: vcs,
    presentation_submission
  }
}

export type AuthenticationProofPurposeOptions = Record<string, any> & {
  challenge: string
  domain: string
}

export type GetAuthenticationProofPurposeOptionsFn = GetProofPurposeOptionsFn<AuthenticationProofPurposeOptions>

type BuildVPV1 = (opts: {
  unsigned: VPV1Unsigned
  holder: Signer
  getSignSuite: GetSignSuiteFn
  documentLoader: DocumentLoader
  getProofPurposeOptions: GetAuthenticationProofPurposeOptionsFn
}) => Promise<VPV1>

export const buildVPV1: BuildVPV1 = async ({
  unsigned,
  holder,
  getSignSuite,
  documentLoader,
  getProofPurposeOptions,
}) => {
  if (unsigned.id) {
    validateId(unsigned.id, true)
  } else {
    warning(
      false,
      'An id should be supplied for the VP. Otherwise top-level, non-object properties (like "type") will be malleable.',
    )
  }

  return jsigs.sign(
    {
      ...unsigned,
    },
    {
      suite: await getSignSuite({
        controller: holder.did,
        keyId: holder.keyId,
        privateKey: holder.privateKey,
      }),
      documentLoader: documentLoader,
      purpose: new AuthenticationProofPurpose(
        await getProofPurposeOptions({
          controller: holder.did,
          keyId: holder.keyId,
        }),
      ),
      compactProof: false,
    },
  )
}
