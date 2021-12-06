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
