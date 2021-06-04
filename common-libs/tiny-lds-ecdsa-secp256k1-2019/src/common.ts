export const KEY_TYPE = 'EcdsaSecp256k1Signature2019'
export const VERIFICATION_KEY_TYPE = 'EcdsaSecp256k1VerificationKey2019'

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
