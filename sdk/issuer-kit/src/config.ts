import fastify from 'fastify'
import * as f from 'fastify'
import * as http from 'http'
import { VCV1Unsigned, VCV1Skeleton, VCV1SubjectBase, MaybeArray } from '@affinidi/vc-common'
import { FastifyDynamicSwaggerOptions } from 'fastify-swagger'

export type VCV1SubjectBaseMA = MaybeArray<VCV1SubjectBase>

export type EndpointSpec<
  TP extends EndpointParamsBase = EndpointParamsBase,
  TR extends EndpointRespBase = EndpointRespBase,
  BodySchema = Record<string, any>,
  ResponseSchema = Record<string, any>
> = {
  fn: (params: TP) => Promise<TR>
  bodySchema?: BodySchema
  responseSchema?: ResponseSchema
  routeOpts: f.RouteShorthandOptions
}

export type PreParsingHook =
  | f.FastifyMiddleware<
      http.Server,
      http.IncomingMessage,
      http.ServerResponse,
      f.DefaultQuery,
      f.DefaultParams,
      f.DefaultHeaders,
      f.DefaultBody
    >
  | Array<
      f.FastifyMiddleware<
        http.Server,
        http.IncomingMessage,
        http.ServerResponse,
        f.DefaultQuery,
        f.DefaultParams,
        f.DefaultHeaders,
        f.DefaultBody
      >
    >

export type OnSendHook =
  | f.FastifyMiddlewareWithPayload<
      http.Server,
      http.IncomingMessage,
      http.ServerResponse,
      f.DefaultQuery,
      f.DefaultParams,
      f.DefaultHeaders,
      f.DefaultBody
    >
  | Array<
      f.FastifyMiddlewareWithPayload<
        http.Server,
        http.IncomingMessage,
        http.ServerResponse,
        f.DefaultQuery,
        f.DefaultParams,
        f.DefaultHeaders,
        f.DefaultBody
      >
    >

export type VerifyEndpointSpec<
  T extends VCV1SubjectBaseMA,
  TP extends EndpointParamsBase = EndpointParamsBase,
  TR extends VerifyRespBase<T> = VerifyRespBase<T>
> = Omit<EndpointSpec, 'fn'> & {
  fn: (params: TP) => Promise<TR>
}

export type EndpointParamsBase = {
  id: string
  holder: string
  type: Array<string>
  data: any
}

export type EndpointRespBase = {
  success: boolean
  status: string
  id: string
  type: Array<string>
  data: any
}

export type VerifyRespBase<T extends VCV1SubjectBaseMA> = EndpointRespBase & {
  vcs?: Array<VCV1Skeleton<T>>
}

export type VerifyRespVCsBase<T extends VCV1SubjectBaseMA> = EndpointRespBase & {
  vcs?: Array<VCV1Unsigned<T>>
}

export type EndpointsSpec<T extends VCV1SubjectBaseMA> = {
  initiate: EndpointSpec
  verify: VerifyEndpointSpec<T>
  [k: string]: EndpointSpec
}

export type ConfigOpts<T extends VCV1SubjectBaseMA, E extends EndpointsSpec<T>> = {
  // Expiration (in seconds)
  expirationLength: number

  endpoints: E

  // Fastify startup params
  fastifyOpts?: FastifyOpts

  // Fastify listen params
  fastifyListenOpts?: fastify.ListenOptions

  // Base URL
  apiBase?: string

  // Swagger base config
  swaggerOpts: FastifyDynamicSwaggerOptions
  writeSwaggerJson?: string
}

export type FastifyOpts =
  | fastify.ServerOptionsAsHttp
  | fastify.ServerOptionsAsHttp2
  | fastify.ServerOptionsAsSecureHttp
  | fastify.ServerOptionsAsSecureHttp2
