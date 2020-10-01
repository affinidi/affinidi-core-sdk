import fastify from 'fastify'
import * as C from './config'
import { VCV1SubjectBaseMA } from '@affinidi/vc-common'
import { Server, IncomingMessage, ServerResponse } from 'http'
import fastifyCors from 'fastify-cors'

export type FastifyServer = fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>

export const getFastifyServer = async <T extends VCV1SubjectBaseMA, E extends C.EndpointsSpec<T>>(
  opts: C.ConfigOpts<T, E>,
) => {
  const server: FastifyServer = fastify(opts.fastifyOpts)
  server.register(fastifyCors)

  return server
}
