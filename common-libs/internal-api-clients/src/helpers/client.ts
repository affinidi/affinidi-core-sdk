import keyBy from 'lodash.keyby'
import mapValues from 'lodash.mapvalues'
import FetchType from 'node-fetch'
import { SdkError } from '@affinidi/tools-common'

import { GenericApiSpec } from '../types/openapi'
import { ParseSpec } from '../types/openapiParser'
import { ResponseForOperation, RequestOptionsForOperation, RequestOptions } from '../types/request'
import { BuildApiTypeWithoutConstraint, BuiltApiOperationType, BuiltApiType } from '../types/typeBuilder'
import { createAdditionalHeaders, createHeaders } from './headers'

let fetch: typeof FetchType

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!fetch) {
  fetch = require('node-fetch')
}

type MethodTypeByOperation<TOperation extends BuiltApiOperationType> = (
  clientOptions: FullClientOptions,
  requestOptions: RequestOptionsForOperation<TOperation>,
) => Promise<ResponseForOperation<TOperation>>

type ClientTypeByApi<TApi extends BuiltApiType> = {
  [key in keyof TApi]: MethodTypeByOperation<TApi[key]>
}

export type ClientTypeByRawSpec<TRawSpec extends GenericApiSpec> = ClientTypeByApi<
  BuildApiTypeWithoutConstraint<ParseSpec<TRawSpec>>
>

export type FullClientOptions = {
  accessApiKey: string
  sdkVersion?: string
  serviceUrl: string
}

export type ClientOptions = Omit<FullClientOptions, 'serviceUrl'>

export type ClientFactoryByRawSpec = {
  <TRawSpec extends GenericApiSpec>(rawSpec: TRawSpec): ClientTypeByRawSpec<TRawSpec>
}

type GetRequestOptions<TOperation extends MethodTypeByOperation<any>> = Parameters<TOperation>[1]
export type GetParams<TOperation extends MethodTypeByOperation<any>> = GetRequestOptions<TOperation>['params']

const parseSpec = (rawSpec: GenericApiSpec) => {
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

  return keyBy(spec, 'operationId')
}

const executeByOptions = async (
  method: string,
  pathTemplate: string,
  { authorization, params, pathParams, queryParams, storageRegion }: RequestOptions<any, any, any>,
  clientOptions: FullClientOptions,
) => {
  if (!clientOptions.serviceUrl) {
    throw new Error('Service URL is empty')
  }

  const headers = {
    ...createHeaders(clientOptions),
    ...createAdditionalHeaders({ authorization, storageRegion }),
  }
  const fetchOptions = {
    headers,
    method,
    ...(!!params && { body: JSON.stringify(params, null, 2) }),
  }

  // eslint-disable-next-line no-unused-vars
  const path = pathTemplate.replace(/\{(\w+)\}/g, (_match, p1) => pathParams?.[p1])
  const url = new URL(`${clientOptions.serviceUrl}${path}`)

  for (const [name, value] of Object.entries(queryParams ?? {})) {
    url.searchParams.set(name, value as string)
  }

  const response = await fetch(url, fetchOptions)
  const { status } = response

  if (!status.toString().startsWith('2')) {
    const error = await response.json()
    const { code, message, context } = error
    throw new SdkError({ code, message }, context, Object.assign({}, error, { httpStatusCode: status }))
  }

  const jsonResponse = status.toString() === '204' ? {} : await response.json()
  return { body: jsonResponse, status }
}

export const createClient: ClientFactoryByRawSpec = <TApiSpec extends GenericApiSpec>(rawSpec: TApiSpec) => {
  type ClientType = ClientTypeByRawSpec<TApiSpec>
  const specGroupByOperationId: Record<keyof ClientType, { path: string; method: string }> = parseSpec(rawSpec) as any
  return mapValues(specGroupByOperationId, ({ path, method }) => {
    return (clientOptions: FullClientOptions, requestOptions: RequestOptions<any, any, any>) =>
      executeByOptions(method, path, requestOptions, clientOptions)
  }) as any // to avoid TS2589 "Type instantiation is excessively deep and possibly infinite"
}

export const createClientOptions = (serviceUrl: string, otherOptions: ClientOptions): FullClientOptions => {
  return {
    ...otherOptions,
    serviceUrl,
  }
}
