import { EventName, EventComponent, VerificationMetadata } from '@affinidi/affinity-metrics-lib'

export class AffinityOptions {
  apiKey?: string
  registryUrl?: string
  metricsUrl?: string
  component?: EventComponent
}

export class EventOptions {
  link: string
  secondaryLink?: string
  name: EventName
  subcategory?: string
  verificationMetadata?: VerificationMetadata
}
