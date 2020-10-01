import {
  DEV_REGISTRY_URL,
  PROD_REGISTRY_URL,
  STAGING_REGISTRY_URL,
  DEV_KEY_STORAGE_URL,
  PROD_KEY_STORAGE_URL,
  STAGING_KEY_STORAGE_URL,
  DEV_COGNITO_USER_POOL_ID,
  PROD_COGNITO_USER_POOL_ID,
  STAGING_COGNITO_USER_POOL_ID,
} from '../../src/_defaultConfig'

let userPoolId
let registryUrl
let keyStorageUrl

export const getOptionsForEnvironment = (environment = ''): any => {
  const env = environment || 'staging'

  switch (environment) {
    case 'dev':
      userPoolId = DEV_COGNITO_USER_POOL_ID
      registryUrl = DEV_REGISTRY_URL
      keyStorageUrl = DEV_KEY_STORAGE_URL
      break

    case 'prod':
      userPoolId = PROD_COGNITO_USER_POOL_ID
      registryUrl = PROD_REGISTRY_URL
      keyStorageUrl = PROD_KEY_STORAGE_URL
      break

    default:
      userPoolId = STAGING_COGNITO_USER_POOL_ID
      registryUrl = STAGING_REGISTRY_URL
      keyStorageUrl = STAGING_KEY_STORAGE_URL
      break
  }

  return { env, userPoolId, registryUrl, keyStorageUrl }
}
