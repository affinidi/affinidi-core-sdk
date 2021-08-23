import SdkError from './shared/SdkError'

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
export { SdkError }

export {
  ElemDidDocument,
  KeyVault,
  DidDocumentService,
  DigestService,
  JwtService,
  KeysService,
  MetricsService,
} from './services'

export { IPlatformCryptographyTools } from './shared/interfaces'

export { ecdsaCryptographyTools } from './shared/EcdsaCryptographyTools'

export { generateFullSeed } from './shared/seedTools'
