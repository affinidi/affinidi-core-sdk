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

export {
  ElemDidDocument,
  KeyVault,
  LocalKeyVault,
  DidDocumentService,
  DigestService,
  JwtService,
  KeysService,
  MetricsService,
} from './services'

export { IPlatformCryptographyTools } from './shared/interfaces'

export { ecdsaCryptographyTools } from './shared/EcdsaCryptographyTools'

export {
  generateFullSeed,
  generateSeedHexWithMethod,
  processAnchoredElemDidSeed,
  buildBase64EncodedAdditionalData,
} from './shared/seedTools'

export { DidResolver } from './shared/DidResolver'
