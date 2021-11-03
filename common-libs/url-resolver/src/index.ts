import { defaultTemplate, predefinedTemplates } from './templates'
import { predefinedUrls } from './urls'
import { Service } from './services'

export type Env = 'dev' | 'staging' | 'prod'

function resolveUrl(service: Service, env: Env, userTemplate?: string): string {
  if (!Object.values(Service).includes(service)) {
    throw new Error(`Service ${service} is not supported by url-resolver`)
  }

  const template =
    userTemplate ??
    predefinedUrls[service]?.[env] ??
    predefinedTemplates[service] ??
    defaultTemplate

  return template.replace(/{{service}}/, service).replace(/{{env}}/, env)
}

export { Service, resolveUrl }
