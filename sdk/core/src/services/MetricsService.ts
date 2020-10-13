import { profile } from '@affinidi/common'
import { metrics, EventComponent } from '@affinidi/affinity-metrics-lib'

import { MetricsEvent, MetricsServiceOptions } from '../dto/shared.dto'

@profile()
export default class MetricsService {
  _apiKey: string
  _metricsUrl: string

  constructor(options: MetricsServiceOptions) {
    this._apiKey = options.apiKey
    this._metricsUrl = options.metricsUrl
  }

  send(event: MetricsEvent): void {
    const component = EventComponent.AffinityBrowserExpoSDK

    const metricsEvent = Object.assign({}, event, { component })

    metrics.send(metricsEvent, this._apiKey, this._metricsUrl)
  }
}
