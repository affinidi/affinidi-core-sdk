export type OutputModifier = Uint8Array | ((len: number) => Uint8Array);

export type NonceFunction = (
  message: Buffer,
  privateKey: Buffer,
  algo?: Buffer,
  data?: Buffer,
  attempt?: number
) => Buffer;

export interface SignOptions {
  noncefn: NonceFunction;
  data: Buffer;
}

export interface SignResult {
  signature: Buffer;
  recovery: number;
}

export interface ISecp256k1 {
  privateKeyVerify(privateKey: Buffer): boolean;
  privateKeyExport(privateKey: Buffer, compressed?: boolean): Buffer;
  privateKeyImport(privateKey: Buffer): Buffer;
  privateKeyNegate(privateKey: Buffer): Buffer;
  privateKeyModInverse(privateKey: Buffer): Buffer;
  privateKeyTweakAdd(privateKey: Buffer, tweak: Buffer): Buffer;
  privateKeyTweakMul(privateKey: Buffer, tweak: Buffer): Buffer;
  publicKeyCreate(privateKey: Buffer, compressed?: boolean): Buffer;
  publicKeyConvert(publicKey: Buffer, compressed?: boolean): Buffer;
  publicKeyVerify(publicKey: Buffer): boolean;
  publicKeyTweakAdd(
    publicKey: Buffer,
    tweak: Buffer,
    compressed?: boolean
  ): Buffer;
  publicKeyTweakMul(
    publicKey: Buffer,
    tweak: Buffer,
    compressed?: boolean
  ): Buffer;
  publicKeyCombine(publicKeys: Buffer[], compressed?: boolean): Buffer;
  signatureNormalize(signature: Buffer): Buffer;
  signatureExport(signature: Buffer): Buffer;
  signatureImport(signature: Buffer): Buffer;
  signatureImportLax(signature: Buffer): Buffer;
  sign(
    message: Buffer,
    privateKey: Buffer,
    options?: Partial<SignOptions>
  ): SignResult;
  verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean;
  recover(
    message: Buffer,
    signature: Buffer,
    recovery: number,
    compressed?: boolean
  ): Buffer;
  ecdh(publicKey: Buffer, privateKey: Buffer): Buffer;
  ecdhUnsafe(
    publicKey: Buffer,
    privateKey: Buffer,
    compressed?: boolean
  ): Buffer;
}
