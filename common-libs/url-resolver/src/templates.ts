import { Service } from './services'

export const defaultTemplate = 'https://{{service}}.{{env}}.affinity-project.org'

export const predefinedTemplates: Partial<Record<Service, string>> = {}
