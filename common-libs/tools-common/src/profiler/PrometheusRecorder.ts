import { IProfilerRecorder } from './IProfilerRecorder'

const METRIC_NAME = 'sdk_operation_duration_seconds'
const BUCKETS_START = 0.05
const BUCKETS_FACTOR = 1.55
const BUCKETS_COUNT = 17

let durationBucket: { observe: (labels: Record<string, unknown>, value: number) => void } | null
try {
  const Prometheus = require('prom-client')
  durationBucket = Prometheus.register.getSingleMetric(METRIC_NAME)
  if (!durationBucket) {
    durationBucket = new Prometheus.Histogram({
      name: METRIC_NAME,
      help: 'Duration of different operations inside SDK (sec)',
      labelNames: ['desc'],
      buckets: Prometheus.exponentialBuckets(BUCKETS_START, BUCKETS_FACTOR, BUCKETS_COUNT),
      registers: [Prometheus.register],
    })
  }
} catch (e) {
  durationBucket = null
}

export const PrometheusRecorder: IProfilerRecorder = {
  record: (name, className, startStamp, endStamp, marker) => {
    const duration = (endStamp - startStamp) / 1000
    if (durationBucket) {
      durationBucket.observe({ desc: `${className}.${name}` }, duration)
    }

    return marker
  },
}
