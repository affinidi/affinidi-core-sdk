import { KeysService } from '@affinidi/common'
import { resolveUrl, Service } from '@affinidi/url-resolver'
import { Env, SdkOptions } from '../dto/shared.dto'

import {
  DEV_COGNITO_CLIENT_ID,
  DEV_COGNITO_USER_POOL_ID,
  DEV_EMAIL_ISSUER_BASE_PATH,
  DEV_PHONE_ISSUER_BASE_PATH,
  PROD_COGNITO_CLIENT_ID,
  PROD_COGNITO_USER_POOL_ID,
  PROD_EMAIL_ISSUER_BASE_PATH,
  PROD_PHONE_ISSUER_BASE_PATH,
  STAGING_COGNITO_CLIENT_ID,
  STAGING_COGNITO_USER_POOL_ID,
  STAGING_EMAIL_ISSUER_BASE_PATH,
  STAGING_PHONE_ISSUER_BASE_PATH,
  DEFAULT_COGNITO_REGION,
} from '../_defaultConfig'

type AccessApiKeyOptions = {
  accessApiKey?: string
  apiKey?: string
}

export const getAccessApiKeyFromOptions = ({ accessApiKey, apiKey }: AccessApiKeyOptions) => {
  if (!accessApiKey && !apiKey) {
    throw new Error('Neither accessApiKey nor apiKey is contained in options')
  }

  if (apiKey) {
    const apiKeyBuffer = KeysService.sha256(Buffer.from(apiKey))
    return apiKeyBuffer.toString('hex')
  }

  return accessApiKey
}

type EnvironmentOptions = {
  env: Env
  issuerUrl?: string
  registryUrl?: string
  verifierUrl?: string
  affinidiVaultUrl?: string
  affinidiMessagesUrl?: string
  keyStorageUrl?: string
  phoneIssuerBasePath?: string
  emailIssuerBasePath?: string
  revocationUrl?: string
  userPoolId?: string
  clientId?: string
}

function getBasicOptionsFromEnvironment(options: EnvironmentOptions) {
  const env = options.env

  const urls = {
    issuerUrl: resolveUrl(Service.ISSUER, env, options.issuerUrl),
    registryUrl: resolveUrl(Service.REGISTRY, env, options.registryUrl),
    verifierUrl: resolveUrl(Service.VERIFIER, env, options.verifierUrl),
    affinidiVaultUrl: resolveUrl(Service.VAULT, env, options.affinidiVaultUrl),
    affinidiMessagesUrl: resolveUrl(Service.MESSAGES, env, options.affinidiMessagesUrl),
    keyStorageUrl: resolveUrl(Service.KEY_STORAGE, env, options.keyStorageUrl),
    revocationUrl: resolveUrl(Service.REVOCATION, env, options.revocationUrl),
    metricsUrl: resolveUrl(Service.METRICS, env),
    migrationUrl: resolveUrl(Service.VAULT_MIGRATION, env),
  }

  switch (env) {
    /* istanbul ignore next */
    case 'dev':
      return {
        env: env as Env,
        clientId: options.clientId || DEV_COGNITO_CLIENT_ID,
        userPoolId: options.userPoolId || DEV_COGNITO_USER_POOL_ID,
        phoneIssuerBasePath: options.phoneIssuerBasePath || DEV_PHONE_ISSUER_BASE_PATH,
        emailIssuerBasePath: options.emailIssuerBasePath || DEV_EMAIL_ISSUER_BASE_PATH,
        ...urls,
      }

    /* istanbul ignore next */
    case 'prod':
      return {
        env: env as Env,
        clientId: options.clientId || PROD_COGNITO_CLIENT_ID,
        userPoolId: options.userPoolId || PROD_COGNITO_USER_POOL_ID,
        phoneIssuerBasePath: options.phoneIssuerBasePath || PROD_PHONE_ISSUER_BASE_PATH,
        emailIssuerBasePath: options.emailIssuerBasePath || PROD_EMAIL_ISSUER_BASE_PATH,
        ...urls,
      }

    case 'staging':
      return {
        env: env as Env,
        clientId: options.clientId || STAGING_COGNITO_CLIENT_ID,
        userPoolId: options.userPoolId || STAGING_COGNITO_USER_POOL_ID,
        phoneIssuerBasePath: options.phoneIssuerBasePath || STAGING_PHONE_ISSUER_BASE_PATH,
        emailIssuerBasePath: options.emailIssuerBasePath || STAGING_EMAIL_ISSUER_BASE_PATH,
        ...urls,
      }
  }
}

const splitOptions = <TOptions extends SdkOptions>(options: TOptions) => {
  const {
    accessApiKey,
    apiKey,
    env,
    issuerUrl,
    registryUrl,
    verifierUrl,
    affinidiVaultUrl,
    affinidiMessagesUrl,
    keyStorageUrl,
    phoneIssuerBasePath,
    emailIssuerBasePath,
    revocationUrl,
    storageRegion,
    clientId,
    userPoolId,
    region,
    origin,
    ...otherOptions
  } = options

  return {
    region,
    accessApiKeyOptions: {
      accessApiKey,
      apiKey,
    },
    environmentOptions: {
      env,
      issuerUrl,
      registryUrl,
      verifierUrl,
      affinidiVaultUrl,
      affinidiMessagesUrl,
      keyStorageUrl,
      phoneIssuerBasePath,
      emailIssuerBasePath,
      revocationUrl,
      clientId,
      userPoolId,
    },
    storageRegion,
    otherOptions,
    origin,
  }
}

export const getOptionsFromEnvironment = (options: SdkOptions) => {
  const { region, accessApiKeyOptions, environmentOptions, storageRegion, otherOptions, origin } = splitOptions(options)

  return {
    region: region || DEFAULT_COGNITO_REGION,
    basicOptions: getBasicOptionsFromEnvironment(environmentOptions),
    accessApiKey: getAccessApiKeyFromOptions(accessApiKeyOptions),
    storageRegion,
    otherOptions,
    origin,
  }
}

export type ParsedOptions = ReturnType<typeof getOptionsFromEnvironment>
