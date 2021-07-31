import { SignedCredential } from '../../src/dto'
import { v4 } from 'uuid'

export const generateCredential = (types: string[] = []) => {
  const credential = {
    id: v4(),
    type: types,
    issuer: v4(),
  } as SignedCredential

  return credential
}

type options = {
  count?: number
  types?: string[]
}

export const generateCredentials = (options?: options) => {
  const typeCount = options?.count || Math.floor(Math.random() * 5 + 1)
  const credentials: SignedCredential[] = []

  for (let i = 0; i < typeCount; i++) {
    credentials.push(generateCredential(options?.types))
  }

  return credentials
}
