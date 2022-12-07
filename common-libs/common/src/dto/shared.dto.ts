import { EventName, EventComponent, VerificationMetadata } from '@affinidi/affinity-metrics-lib'
import { DidResolver } from '../shared/DidResolver'

export type DocumentLoader = (
  iri: string,
) => Promise<{ contextUrl: string | null; document: Record<string, any>; documentUrl: string | null } | undefined>

export class AffinityOptions {
  apiKey?: string
  registryUrl?: string
  metricsUrl?: string
  component?: EventComponent
  didResolver?: DidResolver
  useCache?: boolean
  cacheMaxSize?: number
  cacheTtlInMin?: number
  resolveLegacyElemLocally?: boolean
  beforeDocumentLoader?: DocumentLoader
}

export class EventOptions {
  link: string
  secondaryLink?: string
  name: EventName
  subcategory?: string
  verificationMetadata?: VerificationMetadata
}
