export const KEY_TYPE = 'EcdsaSecp256k1Signature2019'
export const VERIFICATION_KEY_TYPE = 'EcdsaSecp256k1VerificationKey2019'

// It is only declared in standard TS type declarations for Node, and we need this to run everywhere
type WithImplicitCoercion<T> = T | { valueOf(): T }

export type BufferLike = {
  buffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>
  byteOffset?: number
  length?: number
}

export type BufferDataLike = WithImplicitCoercion<Uint8Array | ReadonlyArray<number> | string>

export type Signer = { sign: ({ data }: { data: BufferLike }) => string | Promise<string> }
export type Verifier = {
  verify: ({ data, signature }: { data: BufferLike; signature: string }) => boolean | Promise<boolean>
}
