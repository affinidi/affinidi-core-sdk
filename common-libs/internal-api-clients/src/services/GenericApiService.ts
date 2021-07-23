import keyBy from 'lodash.keyby'
import FetchType from 'node-fetch'
import { profile, SdkError } from '@affinidi/common'

import { BuiltApiType } from '../types/typeBuilder'
import { Simplify } from '../types/util'

let fetch: typeof FetchType

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!fetch) {
  fetch = require('node-fetch')
}

type BasicRequestOptions = {
  authorization?: string
  storageRegion?: string
}

type OptionalRecord = Record<string, any> | undefined

type WithOptionalField<TName extends string, TData extends OptionalRecord> = TData extends undefined | never
  ? Partial<Record<TName, undefined>>
  : Record<TName, TData>

type RequestOptions<
  TParams extends OptionalRecord,
  TQuery extends OptionalRecord,
  TPath extends OptionalRecord
> = BasicRequestOptions &
  WithOptionalField<'params', TParams> &
  WithOptionalField<'queryParams', TQuery> &
  WithOptionalField<'pathParams', TPath>

type RequestOptionsForOperation<TApi extends BuiltApiType, TOperationId extends keyof TApi> = Simplify<
  RequestOptions<TApi[TOperationId]['requestBody'], TApi[TOperationId]['queryParams'], TApi[TOperationId]['pathParams']>
>

type ConstructorOptions = { accessApiKey: string }

type RawApiSpec<TApi extends BuiltApiType> = {
  servers: readonly [{ url: string }]
  paths: Record<string, Partial<Record<'get' | 'post' | 'put' | 'delete', { operationId: keyof TApi }>>>
}

@profile()
export default class GenericApiService<TApi extends BuiltApiType> {
  private readonly _serviceUrl: string
  private readonly _accessApiKey: string
  private readonly _specGroupByOperationId

  constructor(serviceUrl: string, options: ConstructorOptions, rawSpec: RawApiSpec<TApi>) {
    this._serviceUrl = serviceUrl
    this._accessApiKey = options.accessApiKey
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
    accessApiKey: string,
    method: string,
    pathTemplate: string,
    options: BasicRequestOptions & { params?: any; pathParams?: any; queryParams?: any },
  ) {
    const { authorization, storageRegion, params } = options
    const fetchOptions = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Api-Key': accessApiKey,
        ...(authorization && { Authorization: authorization }),
        ...(storageRegion && { 'X-DST-REGION': storageRegion }),
      },
      method,
      ...(!!params && { body: JSON.stringify(params, null, 2) }),
    }

    // eslint-disable-next-line no-unused-vars
    const path = pathTemplate.replace(/\{(\w+)\}/g, (_match, p1) => options.pathParams?.[p1])
    const url = new URL(path)
    url.search = new URLSearchParams(options.queryParams ?? {}).toString()

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

    const operation = this._specGroupByOperationId[serviceOperationId]
    const { method, path } = operation
    const url = `${this._serviceUrl}${path}`
    return GenericApiService.executeByOptions<TApi[TOperationId]['responseBody']>(
      this._accessApiKey,
      method,
      url,
      options,
    )
  }
}
