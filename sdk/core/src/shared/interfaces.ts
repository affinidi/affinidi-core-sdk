import { IPlatformCryptographyTools as ICommonCryptographyTools } from '@affinidi/common'

type KeyData = {
  privateKey: string
  publicKey: string
  keyFormat: 'pem' | 'base58'
}

type KeyGenerator = () => Promise<KeyData>

export type IPlatformCryptographyTools = ICommonCryptographyTools & {
  keyGenerators: Record<'rsa' | 'bbs', KeyGenerator>
}
