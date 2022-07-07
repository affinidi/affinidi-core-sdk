import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsISO8601,
  IsUrl,
  IsNumber,
  IsObject,
  IsString,
  IsArray,
  IsJWT,
  Matches,
  IsIn,
  IsInt,
  Min,
} from 'class-validator'

import { SUPPORTED_DID_METHODS, SUPPORTED_ENVIRONMENTS } from '../_defaultConfig'

export type Env = 'dev' | 'staging' | 'prod'
export type DidMethod = typeof SUPPORTED_DID_METHODS[number]
export const DID_METHOD = /^(jolo|elem|polygon|polygon:testnet)$/
export const DID = /^did:[\w\d]{2,}:[\w\d:;\-=]{10,}/
export const PASSWORD = /^.{6,}$/
export const JWT = /^[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.?[A-Za-z0-9_.+/=-]*$/
export const COGNITO_CONFIRMATION_CODE = /^\d{6}$/

export class SdkOptions {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  registryUrl?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  issuerUrl?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  verifierUrl?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  keyStorageUrl?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  bloomVaultUrl?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  affinidiVaultUrl?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  revocationUrl?: string

  @IsOptional()
  @IsIn(SUPPORTED_DID_METHODS)
  didMethod?: DidMethod

  @IsIn(SUPPORTED_ENVIRONMENTS)
  env: Env

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  phoneIssuerBasePath?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  emailIssuerBasePath?: string

  @IsBoolean()
  @IsOptional()
  skipBackupEncryptedSeed?: boolean

  @IsBoolean()
  @IsOptional()
  skipBackupCredentials?: boolean

  @IsOptional()
  apiKey?: string

  @IsOptional()
  accessApiKey?: string

  @IsBoolean()
  @IsOptional()
  isProfilerActive?: boolean

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  metricsUrl?: string

  @IsOptional()
  storageRegion?: string

  @IsOptional()
  issueSignupCredential?: boolean

  @IsBoolean()
  @IsOptional()
  queryBloomVault?: boolean

  @IsString()
  @IsOptional()
  userPoolId?: string

  @IsString()
  @IsOptional()
  clientId?: string

  @IsString()
  @IsOptional()
  region?: string
}

export class MessageParameters {
  message: string

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  htmlMessage?: string
}

export class KeyParams {
  @IsString()
  encryptedSeed: string

  @IsString()
  password: string
}

export type KeyAlgorithmType = 'rsa' | 'bbs' | 'ecdsa'

export class KeyOptions {
  @IsArray()
  @IsIn(['rsa', 'bbs', 'ecdsa'], { each: true })
  keyTypes: KeyAlgorithmType[]
}

export type KeyParamsOrOptions = KeyParams | KeyOptions

export class CognitoUserTokens {
  @IsOptional()
  @IsString()
  accessToken?: string

  @IsOptional()
  @IsString()
  idToken?: string

  @IsOptional()
  @IsString()
  refreshToken?: string

  @IsOptional()
  @IsNumber()
  expiresIn?: number
}

export class SdkOptionsWithCongitoSetup extends SdkOptions {
  @IsOptional()
  @IsString()
  userPoolId?: string

  @IsOptional()
  @IsString()
  clientId?: string
}

export class CredentialParams {
  @IsDefined()
  @IsString()
  type: string

  @IsDefined()
  @IsArray()
  context: unknown[]

  @IsDefined()
  @IsObject()
  credentialSubject: unknown

  @IsOptional()
  @IsISO8601()
  expiresAt?: string
}

export class SignedCredential {
  // legacy attributes - to be deleted after support is dropped
  @IsOptional()
  @IsObject()
  claim?: unknown

  @IsOptional()
  @IsISO8601()
  issued?: string

  @IsOptional()
  @IsISO8601()
  expires?: string

  // current structure according to W3C https://www.w3.org/TR/vc-data-model
  @IsDefined()
  @IsArray()
  '@context': unknown[]

  @IsDefined()
  @IsString()
  id: string

  @IsOptional()
  @IsString()
  name?: string

  // NOTE, according to W3C it be either an URI string or an object with id property
  // https://www.w3.org/TR/vc-data-model/#issuer
  // @Matches(DID) - can be any string (f.e. URL) or an object ^^
  @IsDefined()
  issuer: string | { id: string }

  @IsOptional()
  @IsISO8601()
  issuanceDate?: string

  @IsOptional()
  @IsISO8601()
  expirationDate?: string

  @IsDefined()
  @IsArray()
  type: string[]

  // NOTE, according to W3C it can be an object or an array of objects
  // https://www.w3.org/TR/vc-data-model/#credential-subject
  @IsOptional()
  credentialSubject?: unknown

  @IsDefined()
  @IsObject()
  proof: Proof

  @IsOptional()
  @IsObject()
  credentialStatus?: unknown

  @IsOptional()
  @IsArray()
  verifiableCredential?: unknown[]

  @IsOptional()
  @IsObject()
  credentialSchema?: unknown

  @IsOptional()
  @IsObject()
  refreshService?: unknown

  @IsOptional()
  @IsArray()
  termsOfUse?: unknown[]

  @IsOptional()
  @IsArray()
  evidence?: unknown[]
}

export class CredentialRequirement {
  @IsDefined()
  @IsArray()
  type: string[]
  @IsOptional()
  @IsArray()
  constraints?: string[]
}

export class JwtOptions {
  @IsOptional()
  @Matches(DID)
  audienceDid?: string

  @IsOptional()
  @IsISO8601()
  expiresAt?: string

  @IsOptional()
  @IsString()
  nonce?: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @IsUrl({ require_tld: false })
  @IsOptional()
  callbackUrl?: string
}

export class OfferedCredential {
  @IsDefined()
  @IsString()
  type: string

  @IsOptional()
  renderInfo?: unknown
}

// export class SignedCredentialContext {
//   id: string;
//   type: string;
//   cred: string;
//   schema: string;
//   email: string;
//   [key: string]: string;
// }

export class Proof {
  @IsDefined()
  @IsString()
  type: string
}

export class ClaimMetadata {
  @IsOptional()
  context?: unknown

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsArray()
  type?: string[]

  @IsOptional()
  claimInterface?: unknown
}

export class SignCredentialOptionalInput {
  @IsOptional()
  @Matches(DID)
  requesterDid?: string

  @IsOptional()
  @IsJWT()
  credentialOfferResponseToken?: string
}

export class FetchCredentialsPaginationOptions {
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number
}
