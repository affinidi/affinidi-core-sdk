import { Service } from './services'

export const defaultTemplate = 'https://{{service}}.{{env}}.affinity-project.org'

export const defaultInternalTemplate = 'http://{{service}}.default.svc.cluster.local'

export const predefinedTemplates: Partial<Record<Service, string>> = {}
