import { Env } from '@affinidi/url-resolver'

export interface VerifierOptions {
  environment: Env
  accessApiKey: string
}

export type CreateResponseTokenOptions = {
  maxTokenValidInMs?: number
}
