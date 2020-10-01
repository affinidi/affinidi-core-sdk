import * as C from './config'
import { getFastifyServer } from './server'
import { router } from './router'
import { VCV1SubjectBaseMA } from '@affinidi/vc-common'
import fs from 'fs'

export const issuer = async <T extends VCV1SubjectBaseMA, E extends C.EndpointsSpec<T>>(opts: C.ConfigOpts<T, E>) => {
  const fastify = await getFastifyServer<T, E>(opts)
  fastify.register(require('fastify-swagger'), opts.swaggerOpts)

  router<T, E>(fastify, opts)

  const fastifyListenPr = fastify.listen(opts.fastifyListenOpts || { port: 3000 })

  const swagger = fastifyListenPr.then(() => fastify.swagger())

  fastifyListenPr.then((address: string) => {
    fastify.log.info(`server listening on ${address}`)
  })

  const filepath = opts.writeSwaggerJson

  if (filepath) {
    fastifyListenPr.then(() => {
      console.log('Writing swagger JSON to ', filepath)
      fs.writeFileSync(filepath, JSON.stringify(fastify.swagger()))
    })
  }

  return { fastify: fastifyListenPr, swagger }
}
