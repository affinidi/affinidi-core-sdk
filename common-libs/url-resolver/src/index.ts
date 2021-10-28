import { defaultTemplate, predefinedTemplates } from './templates'
import { predefinedUrls } from './urls'

export { Services } from './services'

export default function resolveUrl(service: string, env: string, template?: string): string {
  const tmpl =
    template ?? predefinedUrls[service]?.[env] ?? predefinedTemplates[service] ?? defaultTemplate
  if (!tmpl) {
    throw new Error('Url template can not be empty')
  }
  return tmpl.replace(/{{service}}/, service).replace(/{{env}}/, env)
}
