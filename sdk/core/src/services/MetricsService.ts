import { profile } from '@affinidi/common'
import { metrics, EventComponent } from '@affinidi/affinity-metrics-lib'

import { MetricsEvent, MetricsServiceOptions } from '../dto/shared.dto'

@profile()
export default class MetricsService {
  _apiKey: string
  _metricsUrl: string
  _component: EventComponent

  constructor(options: MetricsServiceOptions, component?: EventComponent) {
    this._apiKey = options.apiKey
    this._metricsUrl = options.metricsUrl
    this._component = component
  }

  send(event: MetricsEvent): void {
    const metricsEvent = Object.assign({}, event, { component: this._component })

    metrics.send(metricsEvent, this._apiKey, this._metricsUrl)
  }
}
