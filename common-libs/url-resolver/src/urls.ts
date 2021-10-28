import { Services } from './services'

export const predefinedUrls: Record<string, Record<string, string>> = {
  [Services.SCHEMA_MANAGER]: {
    staging: 'https://schema.stg.affinidi.com',
    prod: 'https://schema.affinidi.com',
  },
}
