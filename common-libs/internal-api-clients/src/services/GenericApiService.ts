import keyBy from 'lodash.keyby'
import FetchType from 'node-fetch'
import { SdkError } from '@affinidi/tools-common'

import { createAdditionalHeaders, createHeaders } from '../helpers/headers'
import { GenericApiSpec } from '../types/openapi'
import { ParseSpec } from '../types/openapiParser'
import { RawApiSpec, ResponseForOperation, RequestOptionsForOperation } from '../types/request'
import { BuildApiTypeWithoutConstraint, BuiltApiOperationType, BuiltApiType } from '../types/typeBuilder'

let fetch: typeof FetchType

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!fetch) {
  fetch = require('node-fetch')
}

type MethodTypeByOperation<TOperation extends BuiltApiOperationType> = (
  serviceOptions: FullServiceOptions,
  requestOptions: RequestOptionsForOperation<TOperation>,
) => Promise<ResponseForOperation<TOperation>>

type ServiceTypeByApi<TApi extends BuiltApiType> = {
  [key in keyof TApi]: MethodTypeByOperation<TApi[key]>
}

export type ServiceTypeByRawSpec<TRawSpec extends GenericApiSpec> = ServiceTypeByApi<
  BuildApiTypeWithoutConstraint<ParseSpec<TRawSpec>>
>

export type FullServiceOptions = {
  accessApiKey: string
  sdkVersion?: string
  serviceUrl: string
}

export type ServiceOptions = Omit<FullServiceOptions, 'serviceUrl'>

export type RequestOptions = {
  params?: any
  pathParams?: any
  queryParams?: Record<string, string>
  headerParams?: Record<string, string>
}

export type ServiceFactoryByRawSpec<TRawSpec extends GenericApiSpec> = {
  createInstance(): ServiceTypeByRawSpec<TRawSpec>
}

type GetRequestOptions<TOperation extends MethodTypeByOperation<any>> = Parameters<TOperation>[1]
export type GetParams<TOperation extends MethodTypeByOperation<any>> = GetRequestOptions<TOperation>['params']

const parseSpec = <TApi extends BuiltApiType>(rawSpec: RawApiSpec<TApi>) => {
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

const executeByOptions = async <TResponse>(
  method: string,
  pathTemplate: string,
  requestOptions: RequestOptions,
  serviceOptions: FullServiceOptions,
) => {
  const headers = {
    ...createHeaders(serviceOptions),
    ...createAdditionalHeaders(requestOptions.headerParams ?? {}),
  }
  const { params } = requestOptions
  const fetchOptions = {
    headers,
    method,
    ...(!!params && { body: JSON.stringify(params, null, 2) }),
  }

  // eslint-disable-next-line no-unused-vars
  const path = pathTemplate.replace(/\{(\w+)\}/g, (_match, p1) => requestOptions.pathParams?.[p1])
  const url = new URL(`${serviceOptions.serviceUrl}${path}`)

  for (const [name, value] of Object.entries(requestOptions.queryParams ?? {})) {
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

export const createServiceFactory = <TApiSpec extends GenericApiSpec>(
  rawSpec: TApiSpec,
): ServiceFactoryByRawSpec<TApiSpec> => {
  const specGroupByOperationId = parseSpec(rawSpec)

  const result: Record<string, any> = {}
  Object.entries(specGroupByOperationId).forEach(([serviceOperationId, { method, path }]) => {
    result[serviceOperationId] = (serviceOptions: FullServiceOptions, requestOptions: RequestOptions) =>
      executeByOptions(method, path, requestOptions, serviceOptions)
  })

  return {
    createInstance() {
      return result
    },
  } as any
}

export const createServiceOptions = (serviceUrl: string, otherOptions: ServiceOptions): FullServiceOptions => {
  if (!serviceUrl) {
    throw new Error('Service URL is empty')
  }

  return {
    ...otherOptions,
    serviceUrl,
  }
}
