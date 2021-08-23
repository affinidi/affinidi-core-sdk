import { IPlatformCryptographyTools as ICommonCryptographyTools } from '@affinidi/common'

type KeyData = {
  privateKey: string
  publicKey: string
  keyFormat: 'pem' | 'base58'
}

type KeyGenerator = () => Promise<KeyData>

export type IPlatformCryptographyTools = ICommonCryptographyTools & {
  decryptByPrivateKey(privateKeyBuffer: Buffer, encryptedDataString: string): Promise<any>
  encryptByPublicKey(publicKeyBuffer: Buffer, data: unknown): Promise<string>
  computePersonalHash(privateKeyBuffer: Buffer, data: string): Promise<string>
  keyGenerators: Record<'rsa' | 'bbs', KeyGenerator>
}
