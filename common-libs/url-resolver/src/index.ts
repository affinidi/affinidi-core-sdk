import { defaultTemplate, predefinedTemplates } from './templates'
import { predefinedUrls } from './urls'
import { Service } from './services'

interface IUrlResolver {
  resolve: (service: Service, env: string) => string
}

class UrlResolver implements IUrlResolver {
  resolve(service: Service, env: string): string {
    if (!Object.values(Service).includes(service)) {
      throw new Error(`Service ${service} is not supported by url-resolver`)
    }

    const template =
      predefinedUrls[service]?.[env] ?? predefinedTemplates[service] ?? defaultTemplate

    return template.replace(/{{service}}/, service).replace(/{{env}}/, env)
  }
}

const urlResolver = new UrlResolver()

export { Service, IUrlResolver, UrlResolver, urlResolver }
