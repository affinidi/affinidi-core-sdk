import moment from 'moment'
import { VCV1Skeleton, VCV1SubjectBaseMA } from '@affinidi/vc-common'
import { buildVCV1Unsigned } from '@affinidi/vc-common'

import { FastifyServer } from './server'
import * as C from './config'
import { genUrn5 } from './urn'

export const getApiBase = (apiBase?: string) => {
  return apiBase || '/api/'
}

export const applyStandardEndpoint = async (
  server: FastifyServer,
  name: string,
  spec: C.EndpointSpec<any, any>,
  apiBase: string,
) => {
  server.post(apiBase + name, spec.routeOpts, async (request, reply) => {
    const result = await spec.fn(request.body.payload)
    reply.type('application/json').code(200)
    return result
  })
}

export const applyVerifyEndpoint = async <T extends VCV1SubjectBaseMA>(
  server: FastifyServer,
  name: string,
  spec: C.VerifyEndpointSpec<T>,
  apiBase: string,
  expirationLength: number,
) => {
  server.post(apiBase + name, spec.routeOpts, async (request, reply) => {
    const result = await spec.fn(request.body.payload)
    const resp = {
      ...result,
      ...(result.vcs && {
        vcs: await Promise.all(
          result.vcs.map((vc: VCV1Skeleton<T>) => {
            const issuanceDate = moment().toISOString()
            const expirationDate = moment(issuanceDate).add(expirationLength, 'seconds').toISOString()

            return buildVCV1Unsigned({
              skeleton: vc,
              revocation: { id: genUrn5() },
              issuanceDate,
              expirationDate,
            })
          }),
        ),
      }),
    }

    reply.type('application/json').code(200)
    return resp
  })
}

export const applyEndpoint = async (server: FastifyServer, name: string, spec: C.EndpointSpec, apiBase: string) => {
  server.post(apiBase + name, async (request, reply) => {
    const result = await spec.fn(request.body.payload)
    reply.type('application/json').code(200)
    return {
      ...result,
    }
  })
}

export const router = async <T extends VCV1SubjectBaseMA, E extends C.EndpointsSpec<T>>(
  server: FastifyServer,
  opts: C.ConfigOpts<T, E>,
) => {
  const apiBase = getApiBase(opts.apiBase)
  const endpointNames = Object.keys(opts.endpoints)
  await Promise.all(
    endpointNames.map((endpointName) => {
      const spec = opts.endpoints[endpointName]
      if (endpointName === 'verify') {
        return applyVerifyEndpoint<T>(server, endpointName, spec, apiBase, opts.expirationLength)
      } else {
        return applyStandardEndpoint(server, endpointName, spec, apiBase)
      }
    }),
  )
}
