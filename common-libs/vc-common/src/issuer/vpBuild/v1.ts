import { VCV1, TContext, VPV1, VPV1Unsigned, VPV1Holder, DocumentLoader } from '../../'

import { Signer, GetSignSuiteFn, GetProofPurposeOptionsFn } from '../common'

const jsigs = require('jsonld-signatures')
const { AuthenticationProofPurpose } = jsigs.purposes

const removeIfExists = <T>(input: T | T[] | undefined, ...items: T[]) => {
  if (typeof input === 'undefined') {
    return []
  }

  const array = (Array.isArray(input) ? input : [input]).slice()
  for (const item of items) {
    const foundIndex = array.indexOf(item)
    if (foundIndex >= 0) {
      array.splice(foundIndex, 1)
    }
  }

  return array
}

type BuildVPV1Unsigned = (opts: {
  vcs: VCV1[]
  holder: VPV1Holder
  type?: string | string[]
  context?: TContext
}) => VPV1Unsigned

export const buildVPV1Unsigned: BuildVPV1Unsigned = ({ vcs, holder, type, context }): VPV1Unsigned => {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      ...removeIfExists(context, 'https://www.w3.org/2018/credentials/v1'),
    ],
    type: ['VerifiablePresentation', ...removeIfExists(type, 'VerifiablePresentation')],
    holder: holder,
    verifiableCredential: vcs,
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
}) =>
  jsigs.sign(
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
