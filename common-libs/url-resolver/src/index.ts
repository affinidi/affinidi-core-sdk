import {
  defaultTemplate,
  defaultDevTemplate,
  predefinedTemplates,
  defaultInternalTemplate,
  defaultInternalDevTemplate,
} from './templates'
import { envSetupUrls, predefinedUrls } from './urls'
import { Service } from './services'

export type Env = 'dev' | 'staging' | 'prod'

const pickPublicTemplate = (service: Service, env: Env) =>
  predefinedUrls[service]?.[env] ??
  predefinedTemplates[service] ??
  (env === 'dev' ? defaultDevTemplate : defaultTemplate)

const pickInternalTemplate = (env: Env) =>
  env === 'dev' ? defaultInternalDevTemplate : defaultInternalTemplate

function resolveUrl(service: Service, env: Env, userTemplate?: string): string {
  const isAffinidiInternalService =
    process.env.AFFINIDI_INTERNAL_SERVICE === 'true' && process.env.NODE_ENV !== 'test'
  if (!Object.values(Service).includes(service)) {
    throw new Error(`Service ${service} is not supported by url-resolver`)
  }

  const template =
    userTemplate ??
    envSetupUrls[service] ??
    (isAffinidiInternalService ? pickInternalTemplate(env) : pickPublicTemplate(service, env))

  return template.replace(/{{service}}/, service).replace(/{{env}}/, env)
}

export { Service, resolveUrl }
