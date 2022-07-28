if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

if (typeof process === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.process = {}
}

if (typeof process.version === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.process.version = ''
}

export { JwtService } from '@affinidi/tools-common'

export { Affinity, Affinity as Affinidi } from './Affinity'

export {
  KeyVault,
  LocalKeyVault,
  DidDocumentService,
  DigestService,
  KeysService,
  MetricsService,
  PolygonDidDocumentService,
  ElemDidDocumentService,
  ElemAnchoredDidDocumentService,
  JoloDidDocumentService,
} from './services'

export { IPlatformCryptographyTools } from './shared/interfaces'

export { ecdsaCryptographyTools } from './shared/EcdsaCryptographyTools'

export { wrapJsonldFrameFunction } from './utils/jsonldFrameWrapper'
export * from './utils/ethUtils'

export {
  generateFullSeed,
  generateSeedHexWithMethod,
  extendSeedWithDid,
  buildBase64EncodedAdditionalData,
} from './shared/seedTools'

export { DidResolver } from './shared/DidResolver'
export * from './shared/interfaces'
