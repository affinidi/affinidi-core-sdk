export interface CognitoUserTokens {
  accessToken?: string
  idToken?: string
  refreshToken?: string
  expiresIn?: number
}

export interface MessageParameters {
  message: string
  subject?: string
  htmlMessage?: string
}

export interface ProfileTrueCaller {
  payload: string
  signature: string
  signatureAlgorithm: string
  avatarUrl?: string | null
  city?: string | null
  companyName?: string | null
  countryCode?: string | null
  email?: string | null
  facebookId?: string | null
  firstName?: string
  gender?: string
  isAmbassador?: boolean
  isBusiness?: boolean
  isVerified?: boolean
  jobTitle?: string | null
  lastName?: string
  phoneNumber?: string
  requestNonce?: string
  street?: string | null
  successful?: boolean
  twitterId?: string | null
  url?: string | null
  zipcode?: string | null
  [key: string]: any
}

export interface ProfileTrueCallerPayload {
  requestTime: number
  phoneNumber: string
  verifier: string
  requestNonce?: string
  firstName?: string
  lastName?: string
  gender?: string
  countryCode?: string
  trueName?: boolean
  ambassador?: boolean
  isBusiness?: boolean
  [key: string]: any
}
