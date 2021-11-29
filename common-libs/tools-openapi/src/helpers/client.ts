import keyBy from 'lodash.keyby'
import { fetch } from '@affinidi/platform-fetch'
import { SdkError } from '@affinidi/tools-common'

import { GenericApiSpec } from '../types/openapi'
import { ParseSpec } from '../types/openapiParser'
import { ResponseForOperation, RequestOptionsForOperation, RequestOptions } from '../types/request'
import { BuildApiTypeWithoutConstraint, BuiltApiOperationType, BuiltApiType } from '../types/typeBuilder'
import { createAdditionalHeaders, createHeaders } from './headers'
import { mapFunctions } from './mapFunctions'

export type ThisData = {
  accessApiKey: string
  sdkVersion?: string
  serviceUrl: string
}

type MethodTypeByOperation<TOperation extends BuiltApiOperationType> = (
  this: ThisData,
  requestOptions: RequestOptionsForOperation<TOperation>,
) => Promise<ResponseForOperation<TOperation>>

type ClientTypeByApi<TApi extends BuiltApiType> = {
  [key in keyof TApi]: MethodTypeByOperation<TApi[key]>
}

export type ClientTypeByRawSpec<TRawSpec extends GenericApiSpec> = ClientTypeByApi<
  BuildApiTypeWithoutConstraint<ParseSpec<TRawSpec>>
>

export type ClientOptions = Omit<ThisData, 'serviceUrl'>

export type ClientFactoryByRawSpec = {
  <TRawSpec extends GenericApiSpec>(rawSpec: TRawSpec): ClientTypeByRawSpec<TRawSpec>
}

type GetRequestOptions<TOperation extends MethodTypeByOperation<any>> = Parameters<TOperation>[0]
export type GetParams<TOperation extends MethodTypeByOperation<any>> = GetRequestOptions<TOperation>['params']

const httpMethodsLowercase = ['get', 'post', 'put', 'delete'] as const
type HttpMethodLowercase = typeof httpMethodsLowercase[number]
type HttpMethodUppercase = Uppercase<HttpMethodLowercase>

const parseSpec = (rawSpec: GenericApiSpec) => {
  const basePath = rawSpec.servers[0].url === '/' ? '' : rawSpec.servers[0].url

  const spec = Object.entries(rawSpec.paths).flatMap(([operationPath, operation]) => {
    const path = `${basePath}${operationPath}`

    return httpMethodsLowercase.flatMap((method) => {
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
  method: HttpMethodLowercase,
  pathTemplate: string,
  { authorization, params, pathParams, queryParams, storageRegion }: RequestOptions<any, any, any>,
  clientOptions: ThisData,
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
    method: method.toUpperCase() as HttpMethodUppercase,
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

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return { body: {}, status }
  }

  const jsonResponse = await response.json()
  return { body: jsonResponse, status }
}

export const createClientMethods: ClientFactoryByRawSpec = <TApiSpec extends GenericApiSpec>(rawSpec: TApiSpec) => {
  type ClientType = ClientTypeByRawSpec<TApiSpec>
  const parsedSpec = parseSpec(rawSpec)
  const typedParsedSpec = parsedSpec as Pick<typeof parsedSpec, keyof ClientType & string>
  return mapFunctions(typedParsedSpec, ({ path, method }) => {
    return (self: ThisData, requestOptions: RequestOptions<any, any, any>) =>
      executeByOptions(method, path, requestOptions, self)
  }) as any // to avoid TS2589 "Type instantiation is excessively deep and possibly infinite"
}

export const createThisData = (serviceUrl: string, otherOptions: ClientOptions): ThisData => {
  return {
    ...otherOptions,
    serviceUrl,
  }
}

export const createClient = <TMethods>(
  methods: TMethods,
  serviceUrl: string,
  otherOptions: ClientOptions,
): TMethods & ThisData => {
  const thisData: ThisData = createThisData(serviceUrl, otherOptions)

  return Object.assign(Object.create(methods as any), thisData)
}
