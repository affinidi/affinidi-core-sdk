import {
  metrics,
  EventComponent,
  VcMetadata,
  EventCategory,
  EventName,
  EventInput,
} from '@affinidi/affinity-metrics-lib'

import { VcMetadataParserFactory } from './parsers'
import { EventOptions } from '../../dto/shared.dto'

class MetricsServiceOptions {
  accessApiKey: string
  metricsUrl: string
  component?: EventComponent
}

export default class MetricsService {
  _accessApiKey: string
  _metricsUrl: string
  _vcMetadataParserFactory: VcMetadataParserFactory
  _component: EventComponent

  constructor(options: MetricsServiceOptions) {
    this._accessApiKey = options.accessApiKey
    this._metricsUrl = options.metricsUrl
    this._component = options.component
    this._vcMetadataParserFactory = new VcMetadataParserFactory()
  }

  send(event: any): void {
    metrics.send(event, this._accessApiKey, this._metricsUrl)
  }

  parseVcMetadata(credential: any, name: EventName): VcMetadata {
    let vcMetadataParser
    switch (name) {
      // parse common + type-specific metadata for the following events
      case EventName.VC_SAVED:
      case EventName.VC_VERIFIED:
      case EventName.VC_VERIFIED_PER_PARTY:
        vcMetadataParser = this._vcMetadataParserFactory.createParser(credential.type[1])
        break

      // parse only common metadata otherwise
      default:
        vcMetadataParser = this._vcMetadataParserFactory.createParser('default')
    }

    const metadata = vcMetadataParser.parse(credential)
    return metadata
  }

  private _isTestEnvironment(): boolean {
    let isTestEnvironment = false

    if (process && process.env) {
      isTestEnvironment = process.env.NODE_ENV === 'test'
    }

    return isTestEnvironment
  }

  sendVcEvent(credential: any, options: EventOptions): void {
    if (this._isTestEnvironment()) {
      return
    }

    const metadata = this.parseVcMetadata(credential, options.name)
    const event: EventInput = {
      component: this._component,
      link: options.link,
      secondaryLink: options.secondaryLink,
      name: options.name,
      category: EventCategory.VC,
      subCategory: options.subcategory,
      metadata: metadata,
    }

    this.send(event)
  }

  sendVpEvent(options: EventOptions): void {
    if (this._isTestEnvironment()) {
      return
    }

    const event: EventInput = {
      component: this._component,
      link: options.link,
      secondaryLink: options.secondaryLink,
      name: options.name,
      category: EventCategory.VP,
      subCategory: options.subcategory,
    }

    this.send(event)
  }
}
