import {
  DEV_REGISTRY_URL,
  STAGING_REGISTRY_URL,
  PROD_REGISTRY_URL,
  DEV_KEY_STORAGE_URL,
  STAGING_KEY_STORAGE_URL,
  PROD_KEY_STORAGE_URL,
} from '@affinidi/wallet-core-sdk/dist/_defaultConfig'

let registryUrl
let keyStorageUrl

export const getOptionsForEnvironment = (environment = ''): any => {
  const env = environment || 'staging'

  switch (environment) {
    case 'dev':
      registryUrl = DEV_REGISTRY_URL
      keyStorageUrl = DEV_KEY_STORAGE_URL
      break

    case 'prod':
      registryUrl = PROD_REGISTRY_URL
      keyStorageUrl = PROD_KEY_STORAGE_URL
      break

    default:
      registryUrl = STAGING_REGISTRY_URL
      keyStorageUrl = STAGING_KEY_STORAGE_URL
      break
  }

  return { env, registryUrl, keyStorageUrl }
}
