import { Service } from './services'

export const defaultTemplate = 'https://{{service}}.apse1.affinidi.io'

export const defaultDevTemplate = 'https://{{service}}.apse1.{{env}}.affinidi.io'

export const defaultInternalTemplate = 'http://{{service}}.default.svc.cluster.local'

export const defaultInternalDevTemplate = 'http://{{service}}.foundational.svc.cluster.local'

export const predefinedTemplates: Partial<Record<Service, string>> = {}
