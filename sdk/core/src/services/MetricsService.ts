import { profile } from '@affinidi/common'
import { metrics, EventComponent, VcMetadata } from '@affinidi/affinity-metrics-lib'

import { MetricsEvent, MetricsServiceOptions, SignedCredential } from '../dto/shared.dto'
import { VcMetadataParserFactory } from './parsers'

@profile()
export default class MetricsService {
  _apiKey: string
  _metricsUrl: string
  _vcMetadataParserFactory: VcMetadataParserFactory
  _component: EventComponent

  constructor(options: MetricsServiceOptions, component?: EventComponent) {
    this._apiKey = options.apiKey
    this._metricsUrl = options.metricsUrl
    this._vcMetadataParserFactory = new VcMetadataParserFactory()
    this._component = component
  }

  send(event: MetricsEvent): void {
    const metricsEvent = Object.assign({}, event, { component: this._component })

    metrics.send(metricsEvent, this._apiKey, this._metricsUrl)
  }

  parseVcMetadata(credential: SignedCredential): VcMetadata {
    const vcMetadataParser = this._vcMetadataParserFactory.createParser(credential.type[1])
    const metadata = vcMetadataParser.parse(credential)
    return metadata
  }
}
