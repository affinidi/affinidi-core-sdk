import { SignedCredential, OfferedCredential } from './shared.dto'

import { VPV1 } from '@affinidi/vc-common'

export class CredentialShareResponseOutput {
  nonce: string
  errors: string[]
  did: string
  isValid: boolean
  suppliedCredentials: SignedCredential[]
}

export class CredentialOfferResponseOutput {
  nonce: string
  errors: string[]
  did: string
  isValid: boolean
  selectedCredentials: OfferedCredential[]
}

type PresentationValidationInvalidOutput = {
  errors: string[]
  isValid: false
  suppliedPresentation: unknown
}

type PresentationValidationValidOutput = {
  challenge: string
  did: string
  isValid: true
  suppliedPresentation: VPV1
}

export type PresentationValidationOutput = PresentationValidationValidOutput | PresentationValidationInvalidOutput
