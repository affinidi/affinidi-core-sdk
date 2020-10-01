export class CredentialStatus {
  id: string
  type: string
  revocationListIndex: string
  revocationListCredential: string
}

export class RevocationListOutput {
  credentialStatus: CredentialStatus
  revocationListCredential?: any
  isPublisRequired: boolean
}

export class RevocationListParamsInput {
  credentialId: string
  subjectDid: string
}
