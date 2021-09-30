import base64url from 'base64url'

import { validateDidMethodSupported } from '../_helpers'
import { randomBytes } from './randomBytes'
import { IPlatformCryptographyTools } from './interfaces'
import { ELEM_ANCHORED_DID_METHOD } from '../_defaultConfig'

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
  additionalData?: Record<string, any>
}

export const ADDITIONAL_DATA_SEPARATOR = '++;additionalDataJson:'
const EXTERNAL_KEYS_KEY = 'keys'
const METADATA_KEY = 'meta'

/**
 * Responsible for parsing decrypted seed
 * As the format is changing from version to version we need to support old formats
 * `${seedHex}++${didMethod}` - old format, backwards compatibility
 * `${seedHex}++${didMethod}++${base64EncodedKeys, can contain '++'}` - old format, backwards compatibility
 * `${seedHex}++${didMethod}++;additionalData:${base64EncodedData, contains both keys and metadata}` - final format
 */
export const getDecryptedSeedParts = (decryptedSeed: string) => {
  const seedParts = decryptedSeed.split('++')
  const seedHex = seedParts[0]
  const didMethod = seedParts[1]
  const additionalDataSeparatorIndex = decryptedSeed.indexOf(ADDITIONAL_DATA_SEPARATOR)
  const additionalDataIndex =
    additionalDataSeparatorIndex > 0 && additionalDataSeparatorIndex + ADDITIONAL_DATA_SEPARATOR.length
  const base64EncodedAdditionalData = additionalDataIndex && decryptedSeed.slice(additionalDataIndex)
  // backwards compatibility
  const base64EncodedKeys = !additionalDataIndex ? seedParts[2] : undefined

  return { seedHex, didMethod, base64EncodedKeys, base64EncodedAdditionalData }
}

export const parseDecryptedSeed = (decryptedSeed: string): ParseDecryptedSeedResult => {
  const { seedHex, didMethod, base64EncodedKeys, base64EncodedAdditionalData } = getDecryptedSeedParts(decryptedSeed)

  validateDidMethodSupported(didMethod)
  const seedHexWithMethod = `${seedHex}++${didMethod}`
  const seed = Buffer.from(seedHex, 'hex')
  const additionalData = base64EncodedAdditionalData && JSON.parse(base64url.decode(base64EncodedAdditionalData))
  const parsedFromBase64ExternalKeys = base64EncodedKeys && JSON.parse(base64url.decode(base64EncodedKeys))
  const externalKeys = additionalData?.[EXTERNAL_KEYS_KEY] ?? parsedFromBase64ExternalKeys
  const metadata = additionalData?.[METADATA_KEY]

  return { seed, didMethod, seedHexWithMethod, externalKeys, fullSeedHex: decryptedSeed, metadata, additionalData }
}

const generateAdditionalKeys = async (cryptographyTools: IPlatformCryptographyTools, keyOptions: KeyOptions) => {
  const filteredKeyTypes = keyOptions.keyTypes.flatMap((externalKeyType) => {
    if (externalKeyType === 'ecdsa') {
      return []
    }

    return [externalKeyType]
  })

  return Promise.all(
    filteredKeyTypes.map(async (externalKeyType) => {
      const { keyFormat, privateKey, publicKey } = await cryptographyTools.keyGenerators[externalKeyType]()
      return {
        type: externalKeyType,
        format: keyFormat,
        private: privateKey,
        public: publicKey,
        permissions: ['authentication', 'assertionMethod'],
      }
    }),
  )
}

export const generateSeedHexWithMethod = async (didMethod: string) => {
  const seed = await randomBytes(32)
  const seedHex = seed.toString('hex')
  return `${seedHex}++${didMethod}`
}

export const buildBase64EncodedAdditionalData = async (
  platformCryptographyTools: IPlatformCryptographyTools,
  keyOptions?: KeyOptions,
  metadata?: Record<string, any>,
) => {
  const additionalData = {
    ...(metadata && { [METADATA_KEY]: metadata }),
    ...(keyOptions && { [EXTERNAL_KEYS_KEY]: await generateAdditionalKeys(platformCryptographyTools, keyOptions) }),
  }
  return base64url.encode(JSON.stringify(additionalData))
}

export const generateFullSeed = async (
  platformCryptographyTools: IPlatformCryptographyTools,
  didMethod: string,
  keyOptions?: KeyOptions,
  metadata?: Record<string, any>,
): Promise<string> => {
  const seedWithMethod = await generateSeedHexWithMethod(didMethod)

  if (!keyOptions && !metadata) {
    return seedWithMethod
  }

  const additionalDataSection = await buildBase64EncodedAdditionalData(platformCryptographyTools, keyOptions, metadata)

  return `${seedWithMethod}${ADDITIONAL_DATA_SEPARATOR}${additionalDataSection}`
}

export const convertDecryptedSeedBufferToString = (decryptedSeed: Buffer): string => {
  const decryptedSeedString = decryptedSeed.toString()
  if (decryptedSeedString.includes('++')) {
    return decryptedSeedString
  }

  // legacy case, backwards compatibility
  const seedHex = decryptedSeed.toString('hex')
  return `${seedHex}++jolo`
}

export const extendSeedWithDid = (decryptedFullSeed: string, did: string) => {
  const { seed, metadata, additionalData: prevAdditionalData } = parseDecryptedSeed(decryptedFullSeed)
  const seedWithMethod = `${seed.toString('hex')}++${ELEM_ANCHORED_DID_METHOD}`
  const additionalData = {
    ...prevAdditionalData,
    [METADATA_KEY]: { ...metadata, anchoredDid: did },
  }
  const additionalDataSection = base64url.encode(JSON.stringify(additionalData))

  return `${seedWithMethod}${ADDITIONAL_DATA_SEPARATOR}${additionalDataSection}`
}

export const isLegacyDecryptedSeed = (decryptedSeed: Buffer): boolean => {
  const decryptedSeedString = decryptedSeed.toString()
  return !decryptedSeedString.includes('++')
}
