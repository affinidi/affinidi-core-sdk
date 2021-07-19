import keyBy from 'lodash.keyby'
import FetchType from 'node-fetch'
import { profile, SdkError } from '@affinidi/common'

import { GenericApiSpec, ExtractAllOperationIds, ExtractRequestType, ExtractResponseType } from './SwaggerTypes'

let fetch: typeof FetchType

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!fetch) {
  fetch = require('node-fetch')
}

type BasicRequestOptions = {
  authorization?: string
  storageRegion?: string
  urlPostfix?: string
}

type RequestOptions<TParams extends Record<string, any> | undefined> = TParams extends undefined
  ? BasicRequestOptions
  : BasicRequestOptions & { params: TParams }

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
    url: string,
    options: BasicRequestOptions & { params?: unknown },
  ) {
    const { authorization, storageRegion, params, urlPostfix } = options
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

    const response = await fetch(`${url}${urlPostfix ?? ''}`, fetchOptions)
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
    options: RequestOptions<ExtractRequestType<TApiSpec, TOperationId>>,
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
