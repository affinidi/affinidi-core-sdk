import { IsOptional, IsNumber, IsString } from 'class-validator'

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

export class MessageParameters {
  message: string

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  htmlMessage?: string
}
