import base64url from 'base64url'

import { validateDidMethodSupported } from '../_helpers'
import { randomBytes } from './randomBytes'
import { IPlatformCryptographyTools } from './interfaces'

export type KeyAlgorithmType = 'rsa' | 'bbs' | 'ecdsa'

export type KeyOptions = {
  keyTypes: KeyAlgorithmType[]
}

export type ParseDecryptedSeedResult = {
  seed: Buffer
  didMethod: string
  seedHexWithMethod: string
  fullSeedHex: string
  externalKeys?: any[]
  metadata?: Record<string, any>
}

export const getDecryptedSeedParts = (decryptedSeed: string) => {
  const seedParts = decryptedSeed.split('++')
  const seedHex = seedParts[0]
  const didMethod = seedParts[1]
  const base64EncodedKeys = seedParts[2]
  const base64EncodedMetadata = seedParts[3]

  return { seedHex, didMethod, base64EncodedKeys, base64EncodedMetadata }
}

export const parseDecryptedSeed = (decryptedSeed: string): ParseDecryptedSeedResult => {
  const { seedHex, didMethod, base64EncodedKeys, base64EncodedMetadata } = getDecryptedSeedParts(decryptedSeed)

  validateDidMethodSupported(didMethod)
  const seedHexWithMethod = `${seedHex}++${didMethod}`
  const seed = Buffer.from(seedHex, 'hex')
  let fullSeedHex = seedHexWithMethod
  let externalKeys
  let metadata

  if (base64EncodedKeys) {
    fullSeedHex = `${fullSeedHex}++${base64EncodedKeys}`
    externalKeys = JSON.parse(base64url.decode(base64EncodedKeys))
  }

  if (base64EncodedMetadata) {
    fullSeedHex = `${fullSeedHex}++${base64EncodedKeys ? '' : '++'}${base64EncodedMetadata}`
    metadata = JSON.parse(base64url.decode(base64EncodedMetadata))
  }

  return { seed, didMethod, seedHexWithMethod, externalKeys, fullSeedHex, metadata }
}

export const generateFullSeed = async (
  platformCryptographyTools: IPlatformCryptographyTools,
  didMethod: string,
  keyOptions?: KeyOptions,
) => {
  const seed = await randomBytes(32)
  const seedHex = seed.toString('hex')
  const seedWithMethod = `${seedHex}++${didMethod}`
  if (!keyOptions) {
    return seedWithMethod
  }

  const additionalKeys = []
  // eslint-disable-next-line no-restricted-syntax
  for (const externalKeyType of keyOptions.keyTypes) {
    if (externalKeyType === 'ecdsa') {
      throw new Error('Please provide key type from the list: `rsa`, `bbs`. Some of your keys is not implemented!')
    }

    const { keyFormat, privateKey, publicKey } = await platformCryptographyTools.keyGenerators[externalKeyType]()

    additionalKeys.push({
      type: externalKeyType,
      format: keyFormat,
      private: privateKey,
      public: publicKey,
      permissions: ['authentication', 'assertionMethod'],
    })
  }

  const keysSeedSection = base64url.encode(JSON.stringify(additionalKeys))

  const fullSeed = `${seedWithMethod}++${keysSeedSection}`
  return fullSeed
}

export const convertDecryptedSeedBufferToString = (decryptedSeed: Buffer) => {
  const decryptedSeedString = decryptedSeed.toString()
  if (decryptedSeedString.includes('++')) {
    return decryptedSeedString
  }

  // legacy case, backwards compatibility
  const seedHex = decryptedSeed.toString('hex')
  return `${seedHex}++jolo`
}

export const isLegacyDecryptedSeed = (decryptedSeed: Buffer) => {
  const decryptedSeedString = decryptedSeed.toString()
  return !decryptedSeedString.includes('++')
}
