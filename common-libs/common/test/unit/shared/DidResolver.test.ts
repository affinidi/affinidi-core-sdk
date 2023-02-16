import { expect, use } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import LRUCache from 'lru-cache'
import { resolveUrl, Service } from '@affinidi/url-resolver'
import { RegistryApiService } from '@affinidi/internal-api-clients'
import { ResponseForOperation } from '@affinidi/tools-openapi'
import { LocalDidResolver } from '../../../src/shared/DidResolver'
import {did, did1, did2, response} from '../../factory/resolveDidResponse'

use(sinonChai)

const {TEST_SECRETS} = process.env
const {DEV_API_KEY_HASH} = JSON.parse(TEST_SECRETS)

const DEFAULT_CACHE_MAX_SIZE = 3
const DEFAULT_CACHE_TTL_IN_MIN = 1440

describe('LocalDidResolver with cache', () => {
  const didResolver = new LocalDidResolver({
    registryUrl: resolveUrl(Service.REGISTRY, 'dev'),
    accessApiKey: DEV_API_KEY_HASH,
    useCache: true,
    cacheMaxSize: DEFAULT_CACHE_MAX_SIZE,
    cacheTtlInMin: DEFAULT_CACHE_TTL_IN_MIN * 60 * 1000,
  })

  describe('#resolveDid with cache', () => {
    // eslint-disable-next-line prettier/prettier
    let spyOnCacheHas: sinon.SinonSpy<[key: any, options?: LRUCache.HasOptions], boolean>
    let spyOnCacheSet: sinon.SinonSpy<[key: any, value: any,
      options?: LRUCache.SetOptions<any, any>], LRUCache<any, any>>
    let spyOnCacheGet: sinon.SinonSpy<[key: any, options?: LRUCache.GetOptions], unknown>
    let spyOnCacheDelete: sinon.SinonSpy<[key: any], boolean>
    let registryStub: sinon.SinonStub<[params: { readonly did: string }],
        Promise<ResponseForOperation<{ pathParams: undefined; queryParams: undefined;
        requestBody: { readonly did: string }; responseBody: any }>>>

    beforeEach(() => {
      spyOnCacheHas = sinon.spy(LRUCache.prototype, 'has')
      spyOnCacheSet = sinon.spy(LRUCache.prototype, 'set')
      spyOnCacheGet = sinon.spy(LRUCache.prototype, 'get')
      spyOnCacheDelete = sinon.spy(LRUCache.prototype, 'delete')
      registryStub = sinon.stub(RegistryApiService.prototype, 'resolveDid')
    })

    afterEach(() => {
      spyOnCacheHas.restore()
      spyOnCacheSet.restore()
      spyOnCacheGet.restore()
      spyOnCacheDelete.restore()
      registryStub.restore()
    })

    it('should resolve DID that is not in cache yet', async () => {
      registryStub.resolves(response)

      await didResolver.resolveDid(did)

      expect(spyOnCacheHas).to.have.been.calledOnce
      expect(spyOnCacheSet).to.have.been.calledOnce
      expect(spyOnCacheGet).to.have.been.calledOnce
    })

    it('should return DID from cache', async () => {
      registryStub.resolves(response)

      await didResolver.resolveDid(did1)
      await didResolver.resolveDid(did1)

      expect(spyOnCacheHas).to.have.been.calledTwice
      expect(spyOnCacheSet).to.have.been.calledOnce
      expect(spyOnCacheGet).to.have.been.calledTwice
    })

    it('should delete cache entry for DID if RegistryApiService rejects', async () => {
      registryStub.rejects()

      await didResolver.resolveDid(did2).catch((reason) => console.error(reason))

      expect(spyOnCacheHas).to.have.been.calledOnce
      expect(spyOnCacheDelete).to.have.been.calledOnce
    })

    it('should delete the oldest cache entry if exceed cacheMaxSize', async () => {
      registryStub.resolves(response)

      await didResolver.resolveDid(did2)
      expect(spyOnCacheHas).to.have.been.calledOnce
      expect(spyOnCacheSet).to.have.been.calledOnce
      expect(spyOnCacheGet).to.have.been.calledOnce
      spyOnCacheHas.restore()
      spyOnCacheSet.restore()
      spyOnCacheGet.restore()

      await didResolver.resolveDid(did)
      expect(spyOnCacheHas).to.have.been.calledOnce
      expect(spyOnCacheSet).to.have.been.calledOnce
      expect(spyOnCacheGet).to.have.been.calledOnce
    })
  })
})

describe('LocalDidResolver without cache', () => {
  const didResolver1 = new LocalDidResolver({
    registryUrl: resolveUrl(Service.REGISTRY, 'dev'),
    accessApiKey: DEV_API_KEY_HASH,
    useCache: false,
  })

  describe('#resolveDid without cache', () => {
    // eslint-disable-next-line prettier/prettier
    let registryStub: sinon.SinonStub<[params: { readonly did: string }],
        Promise<ResponseForOperation<{ pathParams: undefined; queryParams: undefined;
          requestBody: { readonly did: string }; responseBody: any }>>>

    beforeEach(() => {
      registryStub = sinon.stub(RegistryApiService.prototype, 'resolveDid')
    })

    afterEach(() => {
      registryStub.restore()
    })

    it('should call RegistryApiService.resolveDid each time', async () => {
      registryStub.resolves(response)

      await didResolver1.resolveDid(did)
      await didResolver1.resolveDid(did)

      expect(registryStub).to.have.been.calledTwice
    })
  })
})
