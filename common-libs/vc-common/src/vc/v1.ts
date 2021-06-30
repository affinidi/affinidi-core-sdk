import { TContext } from '../shared'

// Do not import {Thing} from 'schema-dts' because it chokes TS
export type SimpleThing = { '@type': string | string[] }

export type VCV1Type = ['VerifiableCredential', ...string[]]

export type MaybeArray<T> = T | Array<T>

export type VCV1Subject<Data extends SimpleThing> = {
  '@context'?: string
  id?: string
  data: Data
}

export type VCV1SubjectMA<D extends SimpleThing = SimpleThing> = MaybeArray<VCV1Subject<D>>

export type VCV1Holder = {
  id: string
}

export type VCV1Proof = {
  type: string
  created: string
  proofPurpose: 'assertionMethod'
  verificationMethod: string
} & ({ jws: string } | { proofValue: string })

export type VCV1Revocation = {
  // id: 'urn:uuid:...' etc.
  id: string
}

export type VCV1Skeleton<
  Subject extends MaybeArray<VCV1Subject<SimpleThing>> = VCV1SubjectMA,
  Type extends VCV1Type = VCV1Type,
  Holder extends VCV1Holder = VCV1Holder
> = {
  '@context': TContext
  id: string
  type: Type
  holder: Holder
  credentialSubject: Subject
}

export type VCV1Unsigned<
  Subject extends MaybeArray<VCV1Subject<SimpleThing>> = VCV1SubjectMA,
  Type extends VCV1Type = VCV1Type,
  Holder extends VCV1Holder = VCV1Holder,
  Revocation extends VCV1Revocation = VCV1Revocation
> = VCV1Skeleton<Subject, Type, Holder> & {
  issuanceDate: string
  expirationDate?: string
  revocation?: Revocation
}

export type VCV1<
  Subject extends MaybeArray<VCV1Subject<SimpleThing>> = VCV1SubjectMA,
  Type extends VCV1Type = VCV1Type,
  Holder extends VCV1Holder = VCV1Holder,
  Revocation extends VCV1Revocation = VCV1Revocation,
  Proof extends VCV1Proof = VCV1Proof
> = VCV1Unsigned<Subject, Type, Revocation, Holder> & {
  issuer: string
  proof: Proof
}

export type VCV1SubjectBase = VCV1Subject<SimpleThing>
export type VCV1SubjectBaseMA = MaybeArray<VCV1SubjectBase>
