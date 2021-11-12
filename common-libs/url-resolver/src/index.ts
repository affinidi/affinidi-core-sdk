import { defaultTemplate, predefinedTemplates, defaultInternalTemplate } from './templates'
import { predefinedUrls } from './urls'
import { Service } from './services'

export type Env = 'dev' | 'staging' | 'prod'

const pickPublicTemplate = (service: Service, env: Env) =>
  predefinedUrls[service]?.[env] ?? predefinedTemplates[service] ?? defaultTemplate

const pickInternalTemplate = () => defaultInternalTemplate

function resolveUrl(service: Service, env: Env, userTemplate?: string): string {
  const isAffinidiInternalService = process.env.AFFINIDI_INTERNAL_SERVICE === 'true'
  if (!Object.values(Service).includes(service)) {
    throw new Error(`Service ${service} is not supported by url-resolver`)
  }

  const template =
    userTemplate ?? (isAffinidiInternalService
      ? pickInternalTemplate()
      : pickPublicTemplate(service, env))

  return template.replace(/{{service}}/, service).replace(/{{env}}/, env)
}

export { Service, resolveUrl }
