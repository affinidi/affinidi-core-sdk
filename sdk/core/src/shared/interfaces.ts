export interface IPlatformEncryptionTools {
  platformName: string
  decryptByPrivateKey(privateKeyBuffer: Buffer, encryptedDataString: string): Promise<any>
  encryptByPublicKey(publicKeyBuffer: Buffer, data: unknown): Promise<string>
  computePersonalHash(privateKeyBuffer: Buffer, data: string): Promise<string>
}
