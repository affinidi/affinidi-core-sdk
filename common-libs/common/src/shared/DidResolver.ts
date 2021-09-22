import { RegistryApiService } from '@affinidi/internal-api-clients'

type DidDocument = Record<string, any> & { id: string }
type CachedPromises = Map<string, Promise<DidDocument>>
type ServiceWithCache = {
  service: RegistryApiService
  cache: CachedPromises
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

const resolveDid = ({ service, cache }: ServiceWithCache, did: string) => {
  if (!cache.has(did)) {
    const promise = new Promise((resolve, reject) => {
      service
        .resolveDid({ did })
        .then(({ body }) => {
          const { didDocument } = body
          resolve(didDocument)
        })
        .catch((reason) => {
          // Don't cache fails
          cache.delete(did)
          reject(reason)
        })
    })
    cache.set(did, promise as Promise<DidDocument>)
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
