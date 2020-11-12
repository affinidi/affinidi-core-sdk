if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

if (typeof process === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.process = {}
}

if (typeof process.version === 'undefined') {
  global.process.version = ''
}

export { Affinity, Affinity as Affinidi } from './Affinity'
export { profile, ProfileAction } from './shared/profiler/ProfilerDecorator'

export { DidDocumentService, DigestService, JwtService, KeysService, MetricsService } from './services'
