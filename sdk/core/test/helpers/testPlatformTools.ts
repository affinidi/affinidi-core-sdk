import { IPlatformEncryptionTools } from '../../src/shared/interfaces'

export const testPlatformTools: IPlatformEncryptionTools = {
  platformName: 'stub',
  decryptByPrivateKey: async () => {
    throw new Error('not implemented')
  },
  encryptByPublicKey: async () => {
    throw new Error('not implemented')
  },
  computePersonalHash: async () => {
    throw new Error('not implemented')
  },
}
