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

const { TEST_SECRETS } = process.env
const { DEV_API_KEY_HASH, PROD_API_KEY_HASH, STAGING_API_KEY_HASH } = JSON.parse(TEST_SECRETS)

let accessApiKey
let userPoolId
let registryUrl
let keyStorageUrl

export const getOptionsForEnvironment = (environment = ''): any => {
  const env = environment || 'staging'

  switch (environment) {
    case 'dev':
      accessApiKey = DEV_API_KEY_HASH
      userPoolId = DEV_COGNITO_USER_POOL_ID
      registryUrl = DEV_REGISTRY_URL
      keyStorageUrl = DEV_KEY_STORAGE_URL
      break

    case 'prod':
      accessApiKey = PROD_API_KEY_HASH
      userPoolId = PROD_COGNITO_USER_POOL_ID
      registryUrl = PROD_REGISTRY_URL
      keyStorageUrl = PROD_KEY_STORAGE_URL
      break

    default:
      accessApiKey = STAGING_API_KEY_HASH
      userPoolId = STAGING_COGNITO_USER_POOL_ID
      registryUrl = STAGING_REGISTRY_URL
      keyStorageUrl = STAGING_KEY_STORAGE_URL
      break
  }

  return { env, accessApiKey, userPoolId, registryUrl, keyStorageUrl }
}
