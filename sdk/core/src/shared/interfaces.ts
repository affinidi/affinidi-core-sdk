export interface FreeFormObject {
  [key: string]: any
}

export interface IPlatformEncryptionTools {
  platformName: string
  decryptByPrivateKey(privateKeyBuffer: Buffer, encryptedDataString: string): Promise<any>
  encryptByPublicKey(publicKeyBuffer: Buffer, data: unknown): Promise<string>
}
