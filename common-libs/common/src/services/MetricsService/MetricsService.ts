import { profile } from '@affinidi/common'
import { metrics, EventComponent, VcMetadata } from '@affinidi/affinity-metrics-lib'

import { VcMetadataParserFactory } from './parsers'

class MetricsServiceOptions {
  accessApiKey: string
  metricsUrl: string
  component?: EventComponent
}

@profile()
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
    const metricsEvent = Object.assign({}, event, { component: this._component })

    metrics.send(metricsEvent, this._accessApiKey, this._metricsUrl)
  }

  parseVcMetadata(credential: any): VcMetadata {
    const vcMetadataParser = this._vcMetadataParserFactory.createParser(credential.type[1])
    const metadata = vcMetadataParser.parse(credential)
    return metadata
  }
}
