import { resolveUrl, Service } from '@affinidi/url-resolver'
// TODO: find a better solution for sharing this data for integration testing
import {
  DEFAULT_COGNITO_REGION,
  DEV_COGNITO_CLIENT_ID,
  DEV_COGNITO_USER_POOL_ID,
  PROD_COGNITO_CLIENT_ID,
  PROD_COGNITO_USER_POOL_ID,
  STAGING_COGNITO_CLIENT_ID,
  STAGING_COGNITO_USER_POOL_ID,
} from '@affinidi/wallet-core-sdk/dist/_defaultConfig'

import { TEST_AGAINST, testSecrets } from './testSecrets'

type Env = 'dev' | 'staging' | 'prod'

const { DEV_API_KEY_HASH, PROD_API_KEY_HASH, STAGING_API_KEY_HASH } = testSecrets

let environment: Env = 'staging'

if (TEST_AGAINST === 'dev' || TEST_AGAINST === 'prod') {
  environment = TEST_AGAINST
}

export const getAllOptionsForEnvironment = () => {
  const env = environment

  const urls = {
    keyStorageUrl: resolveUrl(Service.KEY_STORAGE, env),
  }

  switch (env) {
    case 'dev':
      return {
        env,
        cognitoRegion: DEFAULT_COGNITO_REGION,
        clientId: DEV_COGNITO_CLIENT_ID,
        userPoolId: DEV_COGNITO_USER_POOL_ID,
        accessApiKey: DEV_API_KEY_HASH,
        ...urls,
      }

    case 'prod':
      return {
        env,
        cognitoRegion: DEFAULT_COGNITO_REGION,
        clientId: PROD_COGNITO_CLIENT_ID,
        userPoolId: PROD_COGNITO_USER_POOL_ID,
        accessApiKey: PROD_API_KEY_HASH,
        ...urls,
      }

    case 'staging':
      return {
        env,
        cognitoRegion: DEFAULT_COGNITO_REGION,
        clientId: STAGING_COGNITO_CLIENT_ID,
        userPoolId: STAGING_COGNITO_USER_POOL_ID,
        accessApiKey: STAGING_API_KEY_HASH,
        ...urls,
      }
  }
}

export const getBasicOptionsForEnvironment = () => {
  const { accessApiKey, env } = getAllOptionsForEnvironment()
  return { accessApiKey, env }
}
