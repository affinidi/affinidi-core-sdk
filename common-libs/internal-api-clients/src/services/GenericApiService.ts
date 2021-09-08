import keyBy from 'lodash.keyby'
import FetchType from 'node-fetch'
import { profile, SdkError } from '@affinidi/tools-common'

import { BuiltApiType } from '../types/typeBuilder'
import { ApiRequestHeaders, createHeaders, getExtendedHeaders } from '../helpers/headers'
import { RawApiSpec, RequestOptionsForOperation } from '../types/request'

let fetch: typeof FetchType

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!fetch) {
  fetch = require('node-fetch')
}

export type GenericConstructorOptions = { accessApiKey: string; sdkVersion?: string }

@profile()
export default class GenericApiService<TApi extends BuiltApiType> {
  private readonly _serviceUrl: string
  private readonly _specGroupByOperationId
  private readonly _initHeaders: ApiRequestHeaders

  constructor(serviceUrl: string, options: GenericConstructorOptions, rawSpec: RawApiSpec<TApi>) {
    this._serviceUrl = serviceUrl
    this._initHeaders = createHeaders(options)
    const specGroupByOperationId = GenericApiService.parseSpec(rawSpec)
    this._specGroupByOperationId = specGroupByOperationId
  }

  private static parseSpec<TApi extends BuiltApiType>(rawSpec: RawApiSpec<TApi>) {
    const basePath = rawSpec.servers[0].url

    const spec = Object.entries(rawSpec.paths).flatMap(([operationPath, operation]) => {
      const path = `${basePath}${operationPath}`

      return (['get', 'post', 'put', 'delete'] as const).flatMap((method) => {
        const operationForMethod = operation[method]
        if (!operationForMethod) {
          return []
        }

        const { operationId } = operationForMethod

        return [
          {
            path,
            method,
            operationId,
          },
        ]
      })
    })

    return keyBy(spec, 'operationId') as Record<keyof TApi, typeof spec[number]>
  }

  private static async executeByOptions<TResponse>(
    method: string,
    pathTemplate: string,
    headers: ApiRequestHeaders,
    options: { params?: any; pathParams?: any; queryParams?: Record<string, string> },
  ) {
    const { params } = options
    const fetchOptions = {
      headers,
      method,
      ...(!!params && { body: JSON.stringify(params, null, 2) }),
    }

    // eslint-disable-next-line no-unused-vars
    const path = pathTemplate.replace(/\{(\w+)\}/g, (_match, p1) => options.pathParams?.[p1])
    const url = new URL(path)

    for (const [name, value] of Object.entries(options.queryParams ?? {})) {
      url.searchParams.set(name, value)
    }

    const response = await fetch(url, fetchOptions)
    const { status } = response

    if (!status.toString().startsWith('2')) {
      const error = await response.json()
      const { code, message, context } = error
      throw new SdkError({ code, message }, context, Object.assign({}, error, { httpStatusCode: status }))
    }

    const jsonResponse = status.toString() === '204' ? {} : await response.json()
    return { body: jsonResponse as TResponse, status }
  }

  protected async execute<TOperationId extends keyof TApi>(
    serviceOperationId: TOperationId,
    options: RequestOptionsForOperation<TApi, TOperationId>,
  ): Promise<{ body: TApi[TOperationId]['responseBody']; status: number }> {
    if (!this._serviceUrl) {
      throw new Error('Service URL is empty')
    }

    const extendedHeaders = getExtendedHeaders(this._initHeaders, options)
    const operation = this._specGroupByOperationId[serviceOperationId]
    const { method, path } = operation
    const url = `${this._serviceUrl}${path}`
    return GenericApiService.executeByOptions<TApi[TOperationId]['responseBody']>(method, url, extendedHeaders, options)
  }
}
