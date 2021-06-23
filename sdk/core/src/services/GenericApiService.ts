import keyBy from 'lodash.keyby'
import FetchType from 'node-fetch'
import { profile } from '@affinidi/common'

import SdkError from '../shared/SdkError'

let fetch: typeof FetchType

/* istanbul ignore next */
if (!fetch) {
  fetch = require('node-fetch')
}

type ConstructorOptions = { accessApiKey: string }

type SpecMethodType<OperationIdType extends string> = {
  operationId: OperationIdType
}

type SpecType<OperationIdType extends string> = {
  servers: Readonly<
    {
      url: string
    }[]
  >
  paths: Record<
    string,
    {
      get?: SpecMethodType<OperationIdType>
      post?: SpecMethodType<OperationIdType>
      put?: SpecMethodType<OperationIdType>
      delete?: SpecMethodType<OperationIdType>
    }
  >
}

export type ExtractOperationIdTypes<T extends SpecType<string>> = T extends SpecType<infer U> ? U : never

@profile()
export default class GenericApiService<OperationIdType extends string> {
  private readonly _serviceUrl: string
  private readonly _accessApiKey: string
  private readonly _specGroupByOperationId

  constructor(serviceUrl: string, options: ConstructorOptions, rawSpec: SpecType<OperationIdType>) {
    this._serviceUrl = serviceUrl
    this._accessApiKey = options.accessApiKey
    const specGroupByOperationId = GenericApiService.parseSpec(rawSpec)
    this._specGroupByOperationId = specGroupByOperationId
  }

  private static parseSpec<OperationIdType extends string>(rawSpec: SpecType<OperationIdType>) {
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

    return keyBy(spec, 'operationId') as Record<OperationIdType, typeof spec[number]>
  }

  static async executeByOptions(accessApiKey: string, url: string, options: Record<string, any>) {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { params, url: _url, ...rest } = options
    const fetchOptions = {
      ...rest,
      headers: {
        ...options.headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Api-Key': accessApiKey,
      },
      ...(params && { body: JSON.stringify(params, null, 2) }),
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

  async execute(serviceOperationId: OperationIdType, options: Record<string, any>) {
    const operation = this._specGroupByOperationId[serviceOperationId]
    const { method, path } = operation
    return GenericApiService.executeByOptions(this._accessApiKey, `${this._serviceUrl}${path}`, { ...options, method })
  }
}
