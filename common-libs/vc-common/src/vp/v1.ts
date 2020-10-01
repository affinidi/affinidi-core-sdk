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

export type VPV1Unsigned<
  VC extends VCV1 = VCV1,
  Type extends VPV1Type = VPV1Type,
  Holder extends VPV1Holder = VPV1Holder
> = {
  '@context': TContext
  type: Type
  verifiableCredential: VC[]
  holder: Holder
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
