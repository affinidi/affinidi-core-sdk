import { profile } from '@affinidi/common'

import { STAGING_REGISTRY_URL, STAGING_ISSUER_URL, STAGING_VERIFIER_URL } from '../_defaultConfig'

import registrySpec from '../_registry'
import issuerSpec from '../_issuer'
import verifierSpec from '../_verifier'
import GenericApiService from './GenericApiService'
import IssuerApiService from './IssuerApiService'
import RegistryApiService from './RegistryApiService'
import VerifierApiService from './VerifierApiService'

type ConstructorOptions = { accessApiKey: string }

@profile()
export default class ApiService {
  private readonly services

  constructor(registryUrl: string, issuerUrl: string, verifierUrl: string, options: ConstructorOptions) {
    const extendedOptions = {
      ...options,
      registryUrl: registryUrl || STAGING_REGISTRY_URL,
      issuerUrl: issuerUrl || STAGING_ISSUER_URL,
      verifierUrl: verifierUrl || STAGING_VERIFIER_URL,
    }

    const services = {
      [ApiService.getServiceName(issuerSpec.info.title)]: new IssuerApiService(extendedOptions),
      [ApiService.getServiceName(registrySpec.info.title)]: new RegistryApiService(extendedOptions),
      [ApiService.getServiceName(verifierSpec.info.title)]: new VerifierApiService(extendedOptions),
      'default': new GenericApiService(undefined, options, { servers: [{ url: undefined }], paths: {} })
    }

    this.services = services
  }

  private static getServiceName<T extends string>(title: `affinity-${T}`): T {
    return title.replace('affinity-', '') as T
  }

  async execute<TService extends keyof ApiService['services']>(
    serviceOperation: `${TService}.${Parameters<ApiService['services'][TService]['execute']>[0]}`,
    options?: Record<string, any>,
  ): Promise<any>
  async execute(
    serviceOperation: undefined | null,
    options: Record<string, any> & { url: string },
  ): Promise<any>
  async execute<TService extends keyof ApiService['services']>(
    serviceOperation: `${TService}.${Parameters<ApiService['services'][TService]['execute']>[0]}` | undefined | null,
    options: any = {},
  ) {
    if (options.url) {
      return this.services.default.executeByOptions(options)
    }

    const [serviceName, operationId] = serviceOperation.split('.') as [TService, string]
    const service = this.services[serviceName] as GenericApiService<string>
    return service.execute(operationId, options)
  }
}
