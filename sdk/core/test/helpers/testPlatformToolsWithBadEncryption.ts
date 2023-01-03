import { ecdsaCryptographyTools } from '@affinidi/common'
import { IPlatformCryptographyTools } from '../../src/shared/interfaces'

/**
 * Purpose: for credential with bad encryption
 */
export const testPlatformToolsWithBadEncryption: IPlatformCryptographyTools = {
  ...ecdsaCryptographyTools,
  // eslint-disable-next-line no-unused-vars
  decryptByPrivateKey: async (_privateKeyBuffer: Buffer, data: string) => {
    throw new Error('Failed to decrypt the credential')
  },
  // eslint-disable-next-line no-unused-vars
  encryptByPublicKey: async (_publicKeyBuffer: Buffer, data: unknown) => {
    throw new Error('Failed to encrypt the credential')
  },
  // eslint-disable-next-line no-unused-vars
  computePersonalHash: async (_privateKeyBuffer: Buffer, data: string) => {
    return data
  },
}
