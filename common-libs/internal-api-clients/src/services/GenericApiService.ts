import keyBy from 'lodash.keyby'
import FetchType from 'node-fetch'
import { profile, SdkError } from '@affinidi/common'

import {
  GenericApiSpec,
  ExtractAllOperationIds,
  ExtractRequestType,
  ExtractResponseType,
  ExtractParametersType,
} from './SwaggerTypes'

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

type WithOptionalField<TName extends string, TData extends OptionalRecord> = TData extends undefined
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

type RequestOptionsForOperation<
  TApiSpec extends GenericApiSpec,
  TOperationId extends ExtractAllOperationIds<TApiSpec>
> = RequestOptions<
  ExtractRequestType<TApiSpec, TOperationId>,
  ExtractParametersType<TApiSpec, TOperationId, 'query'>,
  ExtractParametersType<TApiSpec, TOperationId, 'path'>
>

type ConstructorOptions = { accessApiKey: string }

@profile()
export default class GenericApiService<TApiSpec extends GenericApiSpec> {
  private readonly _serviceUrl: string
  private readonly _accessApiKey: string
  private readonly _specGroupByOperationId

  constructor(serviceUrl: string, options: ConstructorOptions, rawSpec: TApiSpec) {
    this._serviceUrl = serviceUrl
    this._accessApiKey = options.accessApiKey
    const specGroupByOperationId = GenericApiService.parseSpec(rawSpec)
    this._specGroupByOperationId = specGroupByOperationId
  }

  private static parseSpec<TApiSpec extends GenericApiSpec>(rawSpec: TApiSpec) {
    const basePath = rawSpec.servers[0].url

    const spec = Object.entries(rawSpec.paths).flatMap(([operationPath, operation]) => {
      const path = `${basePath}${operationPath}`

      return (['get', 'post', 'put', 'delete'] as const).flatMap((method) => {
        const operationForMethod = operation[method]
        if (!operationForMethod) {
          return []
        }

        const { operationId }: { operationId: ExtractAllOperationIds<TApiSpec> } = operationForMethod

        return [
          {
            path,
            method,
            operationId,
          },
        ]
      })
    })

    return keyBy(spec, 'operationId') as Record<ExtractAllOperationIds<TApiSpec>, typeof spec[number]>
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

  protected async execute<TOperationId extends ExtractAllOperationIds<TApiSpec>>(
    serviceOperationId: TOperationId,
    options: RequestOptionsForOperation<TApiSpec, TOperationId>,
  ): Promise<{ body: ExtractResponseType<TApiSpec, TOperationId>; status: number }> {
    if (!this._serviceUrl) {
      throw new Error('Service URL is empty')
    }

    const operation = this._specGroupByOperationId[serviceOperationId]
    const { method, path } = operation
    const url = `${this._serviceUrl}${path}`
    return GenericApiService.executeByOptions<ExtractResponseType<TApiSpec, TOperationId>>(
      this._accessApiKey,
      method,
      url,
      options,
    )
  }
}
