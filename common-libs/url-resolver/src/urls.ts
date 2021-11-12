import { Service } from './services'

export const predefinedUrls: Partial<Record<Service, Record<string, string>>> = {
  [Service.SCHEMA_MANAGER]: {
    staging: 'https://schema.stg.affinidi.com',
    prod: 'https://schema.affinidi.com',
  },
}

export const envSetupUrls: Record<Service, string> = {
  [Service.METRICS]: process.env.METRICS_SERVICE_URL,
  [Service.REGISTRY]: process.env.REGISTRY_SERVICE_URL,
  [Service.SFF_ISSUER]: process.env.SFF_ISSUER_SERVICE_URL,
  [Service.VAULT]: process.env.VAULT_SERVICE_URL,
  [Service.BLOOM_VAUlT]: process.env.BLOOM_VAUlT_SERVICE_URL,
  [Service.CLOUD_WALLET_API]: process.env.CLOUD_WALLET_API_SERVICE_URL,
  [Service.ISSUER]: process.env.ISSUER_SERVICE_URL,
  [Service.KEY_STORAGE]: process.env.KEY_STORAGE_SERVICE_URL,
  [Service.VERIFIER]: process.env.VERIFIER_SERVICE_URL,
  [Service.ONBOARDING_BACKEND]: process.env.ONBOARDING_BACKEND_SERVICE_URL,
  [Service.MESSAGES]: process.env.MESSAGES_SERVICE_URL,
  [Service.REVOCATION]: process.env.REVOCATION_SERVICE_URL,
  [Service.USER_AUTH]: process.env.USER_AUTH_SERVICE_URL,
  [Service.SCHEMA_MANAGER]: process.env.SCHEMA_MANAGER_SERVICE_URL,
}
