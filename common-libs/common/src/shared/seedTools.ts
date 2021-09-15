import base64url from 'base64url'

import { validateDidMethodSupported } from '../_helpers'
import { randomBytes } from './randomBytes'
import { IPlatformCryptographyTools } from './interfaces'

export type KeyAlgorithmType = 'rsa' | 'bbs' | 'ecdsa'

export type KeyOptions = {
  keyTypes: KeyAlgorithmType[]
}

export const getDecryptedSeedParts = (decryptedSeed: string) => {
  const seedParts = decryptedSeed.split('++')
  const seedHex = seedParts[0]
  const didMethod = seedParts[1]
  const base64EncodedKeys = seedParts[2]

  return { seedHex, didMethod, base64EncodedKeys }
}

export const parseDecryptedSeed = (decryptedSeed: string) => {
  const { seedHex, didMethod, base64EncodedKeys } = getDecryptedSeedParts(decryptedSeed)

  validateDidMethodSupported(didMethod)
  const seedHexWithMethod = `${seedHex}++${didMethod}`
  const seed = Buffer.from(seedHex, 'hex')

  if (!base64EncodedKeys) {
    return {
      seed,
      didMethod,
      seedHexWithMethod,
      fullSeedHex: seedHexWithMethod,
    }
  }

  const fullSeedHex = `${seedHexWithMethod}++${base64EncodedKeys}`
  const externalKeys = JSON.parse(base64url.decode(base64EncodedKeys))

  return { seed, didMethod, seedHexWithMethod, externalKeys, fullSeedHex }
}

const generateAdditionalKeys = async (cryptographyTools: IPlatformCryptographyTools, keyOptions: KeyOptions) => {
  const filteredKeyTypes = keyOptions.keyTypes.flatMap((externalKeyType) => {
    if (externalKeyType === 'ecdsa') {
      return []
    }

    return [externalKeyType]
  })

  return Promise.all(
    filteredKeyTypes.map(async (externalKeyType) => ({
      externalKeyType,
      keyInfo: await cryptographyTools.keyGenerators[externalKeyType](),
    })),
  )
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

  const additionalKeys = await generateAdditionalKeys(platformCryptographyTools, keyOptions)
  const keysSeedSectionContent = additionalKeys.map(
    ({ externalKeyType, keyInfo: { keyFormat, privateKey, publicKey } }) => ({
      type: externalKeyType,
      format: keyFormat,
      private: privateKey,
      public: publicKey,
      permissions: ['authentication', 'assertionMethod'],
    }),
  )

  const keysSeedSection = base64url.encode(JSON.stringify(keysSeedSectionContent))
  return `${seedWithMethod}++${keysSeedSection}`
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
