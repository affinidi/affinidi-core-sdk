import { TContext } from '../shared'
import { VCV1 } from '../vc/v1'

export type VPV1Type = ['VerifiablePresentation', ...string[]]

export type VPV1Proof = {
  type: string
  created: string
  proofPurpose: 'authentication'
  verificationMethod: string
  challenge: string
  domain: string
  jws: string
}

export type VPV1Holder = {
  id: string
}

export type PresentationSubmissionDescriptorV1 = {
  id: string
  path: string
  path_nested?: PresentationSubmissionDescriptorV1
  format: 'jwt' | 'jwt_vc' | 'jwt_vp' | 'ldp' | 'ldp_vc' | 'ldp_vp'
}
export type PresentationSubmissionV1 = {
  locale?: string
  descriptor_map: PresentationSubmissionDescriptorV1[]
}

export type VPV1Unsigned<
  VC extends VCV1 = VCV1,
  Type extends VPV1Type = VPV1Type,
  Holder extends VPV1Holder = VPV1Holder
  > = {
    '@context': TContext
    id?: string
    type: Type
    verifiableCredential: VC[]
    holder: Holder
    presentation_submission?: PresentationSubmissionV1
  }

// TODO: This is missing the `signature` and `packedData` fields. How should those translate over?
export type VPV1<
  VC extends VCV1 = VCV1,
  Type extends VPV1Type = VPV1Type,
  Holder extends VPV1Holder = VPV1Holder,
  Proof extends VPV1Proof = VPV1Proof
  > = VPV1Unsigned<VC, Type, Holder> & {
    proof: Proof
  }
