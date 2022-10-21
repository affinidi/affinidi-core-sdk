import { EventName, EventComponent, VerificationMetadata } from '@affinidi/affinity-metrics-lib'
import { DidResolver } from '../shared/DidResolver'

export class AffinityOptions {
  apiKey?: string
  registryUrl?: string
  metricsUrl?: string
  component?: EventComponent
  didResolver?: DidResolver
  useCache?: boolean
  cacheMaxSize?: number
  cacheTtlInMin?: number
}

export class EventOptions {
  link: string
  secondaryLink?: string
  name: EventName
  subcategory?: string
  verificationMetadata?: VerificationMetadata
}
