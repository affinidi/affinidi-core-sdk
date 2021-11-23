import Prometheus from 'prom-client'
import { IProfilerRecorder } from './IProfilerRecorder'

const METRIC_NAME = 'sdk_operations_duration_seconds_bucket'
const BUCKETS_START = 0.05
const BUCKETS_FACTOR = 1.55
const BUCKETS_COUNT = 17

let durationBucket = <Prometheus.Histogram<string>>Prometheus.register.getSingleMetric(METRIC_NAME)
if (!durationBucket) {
  durationBucket = new Prometheus.Histogram({
    name: METRIC_NAME,
    help: 'Duration of different operations inside SDK (sec)',
    labelNames: ['desc'],
    buckets: Prometheus.exponentialBuckets(BUCKETS_START, BUCKETS_FACTOR, BUCKETS_COUNT),
    registers: [Prometheus.register],
  })
}

export const PrometheusRecorder: IProfilerRecorder = {
  record: (name, className, startStamp, endStamp, marker) => {
    const duration = (endStamp - startStamp) / 1000
    durationBucket.observe({ desc: `${className}.${name}` }, duration)

    return marker
  },
}
