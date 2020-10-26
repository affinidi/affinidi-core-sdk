import { profile } from '@affinidi/common'
import { metrics, EventComponent, VcMetadata } from '@affinidi/affinity-metrics-lib'

import { MetricsEvent, MetricsServiceOptions, SignedCredential } from '../dto/shared.dto'
import { VcMetadataParserFactory } from './parsers'

@profile()
export default class MetricsService {
  _apiKey: string
  _metricsUrl: string
  _vcMetadataParserFactory: VcMetadataParserFactory

  constructor(options: MetricsServiceOptions) {
    this._apiKey = options.apiKey
    this._metricsUrl = options.metricsUrl
    this._vcMetadataParserFactory = new VcMetadataParserFactory()
  }

  send(event: MetricsEvent): void {
    const component = EventComponent.AffinityBrowserExpoSDK

    const metricsEvent = Object.assign({}, event, { component })

    metrics.send(metricsEvent, this._apiKey, this._metricsUrl)
  }

  parseVcMetadata(credential: SignedCredential): VcMetadata {
    const vcMetadataParser = this._vcMetadataParserFactory.createParser(credential.type[1])
    const metadata = vcMetadataParser.parse(credential)
    return metadata
  }
}
