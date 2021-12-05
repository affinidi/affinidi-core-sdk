export type W3cCredentialLike = {
  data?: never | (any & { id?: never })
  id: string
  type: string[]
}

export type OACredentialLike = {
  data: { id: string }
  id?: never
  type?: never
}

// We cannot use `Record<string, unknown>` instead of `object` here
// because class instances are not assignable to it (they lack index signature for type string),
// and `SignedCredential` is a class.
// eslint-disable-next-line @typescript-eslint/ban-types
export type CredentialLike = object & (W3cCredentialLike | OACredentialLike)
