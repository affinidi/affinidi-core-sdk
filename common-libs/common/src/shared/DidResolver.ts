import { RegistryApiService } from '@affinidi/internal-api-clients'

type CachedResults = Map<string, Record<string, any>>
type ServiceWithCache = {
  service: RegistryApiService
  cache: CachedResults
}

type ConstructorOptions = ConstructorParameters<typeof RegistryApiService>[0]

const services: Map<string, ServiceWithCache> = new Map()

const getService = (options: ConstructorOptions) => {
  const { accessApiKey, registryUrl } = options
  const cacheKey = JSON.stringify({ accessApiKey, registryUrl })
  if (!services.has(cacheKey)) {
    services.set(cacheKey, {
      service: new RegistryApiService(options),
      cache: new Map(),
    })
  }

  return services.get(cacheKey)
}

const resolveDid = async ({ service, cache }: ServiceWithCache, did: string) => {
  if (!cache.has(did)) {
    const { body: { didDocument } } = await service.resolveDid({ did })
    cache.set(did, didDocument)
  }

  return cache.get(did)
}

export class DidResolver {
  private readonly _service: ServiceWithCache

  constructor(options: ConstructorOptions) {
    this._service = getService(options)
  }

  resolveDid(did: string) {
    return resolveDid(this._service, did)
  }
}
