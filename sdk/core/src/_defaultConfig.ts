export const DEFAULT_COGNITO_REGION = 'ap-southeast-1'

export const DEV_COGNITO_CLIENT_ID = '7v04j8pn0niv1fv5an59i59k91'
export const DEV_COGNITO_USER_POOL_ID = 'ap-southeast-1_wL9liixv9'
export const DEV_PHONE_ISSUER_BASE_PATH = 'https://issuer-phone-twillio.dev.affinity-project.org'
export const DEV_EMAIL_ISSUER_BASE_PATH = 'https://issuer-email-ses.dev.affinity-project.org'

export const STAGING_COGNITO_CLIENT_ID = '3kkiu7rski2ob6r1lk0nk7k4ft'
export const STAGING_COGNITO_USER_POOL_ID = 'ap-southeast-1_z8q6rRlJV'
export const STAGING_PHONE_ISSUER_BASE_PATH = 'https://issuer-phone-twillio.staging.affinity-project.org'
export const STAGING_EMAIL_ISSUER_BASE_PATH = 'https://issuer-email-ses.staging.affinity-project.org'

export const PROD_COGNITO_CLIENT_ID = '4ds756i9ji54tagaj8as9041qc'
export const PROD_COGNITO_USER_POOL_ID = 'ap-southeast-1_Og0weulSg'
export const PROD_PHONE_ISSUER_BASE_PATH = 'https://issuer-phone-twillio.prod.affinity-project.org'
export const PROD_EMAIL_ISSUER_BASE_PATH = 'https://issuer-email-ses.prod.affinity-project.org'

export const DEFAULT_JWT_EXPIRY_MS = 10 * 60 * 1000
export const MINIMUM_RECOMMENDED_PASSWORD_LENGTH = 8

export const ELEM_DID_METHOD = 'elem'
export const ELEM_ANCHORED_DID_METHOD = 'elem-anchored'
export const JOLO_DID_METHOD = 'jolo'
export const POLYGON_DID_METHOD = 'polygon'
export const POLYGON_TESTNET_DID_METHOD = 'polygon:testnet'
export const WEB_DID_METHOD = 'web'
export const KEY_DID_METHOD = 'key'
export const DEFAULT_DID_METHOD = ELEM_DID_METHOD
export const SUPPORTED_DID_METHODS = [
  JOLO_DID_METHOD,
  ELEM_DID_METHOD,
  ELEM_ANCHORED_DID_METHOD,
  POLYGON_DID_METHOD,
  POLYGON_TESTNET_DID_METHOD,
  WEB_DID_METHOD,
  KEY_DID_METHOD,
] as const
export const SUPPORTED_ENVIRONMENTS = ['dev', 'staging', 'prod'] as const
