export const { TEST_AGAINST, TEST_SECRETS } = process.env

export const testSecrets: {
  COGNITO_PASSWORD: string
  COGNITO_USERNAME: string
  COGNITO_USERNAME_UNCONFIRMED: string
  DEV_API_KEY_HASH: string
  PROD_API_KEY_HASH: string
  STAGING_API_KEY_HASH: string
} = JSON.parse(TEST_SECRETS)
