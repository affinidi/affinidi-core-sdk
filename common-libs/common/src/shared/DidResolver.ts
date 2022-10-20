import LRUCache from 'lru-cache'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { DidDocument } from './interfaces'

type ServiceWithCache = {
  service: RegistryApiService
  cache?: LRUCache<string, Promise<DidDocument>>
}

type ConstructorOptions = ConstructorParameters<typeof RegistryApiService>[0] & {
  useCache: boolean
  cacheMaxSize?: number
  cacheTtlInMin?: number
}

const DEFAULT_CACHE_MAX_SIZE = 10_000
const DEFAULT_CACHE_TTL_IN_MIN = 1440

const services: Map<string, ServiceWithCache> = new Map()

const getService = (options: ConstructorOptions) => {
  const { accessApiKey, registryUrl } = options
  const cacheKey = JSON.stringify({ accessApiKey, registryUrl })
  if (!services.has(cacheKey)) {
    services.set(cacheKey, {
      service: new RegistryApiService(options),
      cache: options.useCache
        ? new LRUCache({
            max: options.cacheMaxSize ?? DEFAULT_CACHE_MAX_SIZE,
            ttl: (options.cacheTtlInMin ?? DEFAULT_CACHE_TTL_IN_MIN) * 60 * 1000,
            allowStale: true,
          })
        : undefined,
    })
  }

  return services.get(cacheKey)
}

const resolveDid = ({ service, cache }: ServiceWithCache, did: string) => {
  if (cache.has(did)) {
    return cache.get(did)
  }

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
  return cache.get(did)
}

const resolveDidWithoutCache = async ({ service }: ServiceWithCache, did: string) => {
  const response = await service.resolveDid({ did })
  return response.body.didDocument as DidDocument
}

export class LocalDidResolver {
  private readonly _service: ServiceWithCache
  private readonly _useCache: boolean

  constructor(options: ConstructorOptions) {
    this._useCache = options.useCache ?? true
    this._service = getService(options)
  }

  resolveDid(did: string) {
    return this._useCache ? resolveDid(this._service, did) : resolveDidWithoutCache(this._service, did)
  }
}

export type DidResolver = {
  resolveDid: (did: string) => Promise<DidDocument>
}
