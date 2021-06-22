import keyBy from 'lodash.keyby'

import { STAGING_REGISTRY_URL, STAGING_ISSUER_URL, STAGING_VERIFIER_URL } from '../_defaultConfig'
import SdkError from '../shared/SdkError'

let fetch: any

/* istanbul ignore next */
if (!fetch) {
  fetch = require('node-fetch')
}

import registrySpec from '../_registry.json'
import issuerSpec from '../_issuer.json'
import verifierSpec from '../_verifier.json'
import { profile } from '@affinidi/common'

type ConstructorOptions = { accessApiKey: string }

@profile()
export default class ApiService {
  _registryUrl: string
  _issuerUrl: string
  _verifierUrl: string
  _accessApiKey: string
  _specGroupByOperationId: any

  constructor(registryUrl: string, issuerUrl: string, verifierUrl: string, options: ConstructorOptions) {
    this._issuerUrl = issuerUrl || STAGING_ISSUER_URL
    this._registryUrl = registryUrl || STAGING_REGISTRY_URL
    this._verifierUrl = verifierUrl || STAGING_VERIFIER_URL
    this._accessApiKey = options.accessApiKey
    this._specGroupByOperationId = {}
    this._parseSpecs()
  }

  _parseSpecs() {
    const specs = [registrySpec, issuerSpec, verifierSpec]

    for (const spec of specs) {
      const serviceName = spec.info.title.replace('affinity-', '')

      const map = this._parseSpec(spec)
      this._specGroupByOperationId[serviceName] = map
    }
  }

  _parseSpec(rawSpec: any): any {
    const spec = []
    const basePath = rawSpec.servers[0].url

    for (const operationPath in rawSpec.paths) {
      const operation = rawSpec.paths[operationPath]
      const path = `${basePath}${operationPath}`

      for (const method in operation) {
        const { operationId } = operation[method]

        spec.push({
          path,
          method,
          operationId,
        })
      }
    }

    return keyBy(spec, 'operationId')
  }

  async execute(serviceOperation: string, options: any = {}): Promise<any> {
    if (!options.url) {
      const [serviceName, operationId] = serviceOperation.split('.')
      const operation = this._specGroupByOperationId[serviceName][operationId]
      const { method, path } = operation

      let networkUrl

      switch (serviceName) {
        case 'registry':
          networkUrl = this._registryUrl
          break
        case 'issuer':
          networkUrl = this._issuerUrl
          break
        case 'verifier':
          networkUrl = this._verifierUrl
          break
      }

      options.url = `${networkUrl}${path}`
      options.method = method
    }

    options.headers = options.headers || {}
    options.headers['Accept'] = 'application/json'
    options.headers['Content-Type'] = 'application/json'
    options.headers['Api-Key'] = this._accessApiKey

    if (options.params) {
      let { params: body } = options

      body = JSON.stringify(body, null, 2)
      options.body = body
    }

    const { url } = options

    delete options.params
    delete options.url

    const response = await fetch(url, options)
    const { status } = response

    let jsonResponse

    if (status.toString().startsWith('2')) {
      jsonResponse = status.toString() === '204' ? {} : await response.json()
    } else {
      const error = await response.json()

      const { code, message, context } = error

      throw new SdkError({ code, message }, context, Object.assign({}, error, { httpStatusCode: status }))
    }

    return { body: jsonResponse, status }
  }
}
