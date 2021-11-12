import { Service } from './services'

export const predefinedUrls: Partial<Record<Service, Record<string, string>>> = {
  [Service.SCHEMA_MANAGER]: {
    staging: 'https://schema.stg.affinidi.com',
    prod: 'https://schema.affinidi.com',
  },
}
