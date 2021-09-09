import mapValues from 'lodash.mapValues'
import { FullClientOptions, ClientOptions } from './client'
import { DidAuthAdapter } from './DidAuthAdapter'
import { DidAuthSession } from './DidAuthManager'

export type DidAuthConstructorOptions = ClientOptions & {
  didAuthAdapter: DidAuthAdapter
}

type BasicApiMethodType = (clientOptions: FullClientOptions, requestOptions: any) => Promise<unknown>

type MappedMethod<TMethod extends BasicApiMethodType> = (
  didAuthSession: DidAuthSession,
  ...rest: Parameters<TMethod>
) => ReturnType<TMethod>

type DidAuthApiMethodType = (
  clientOptions: FullClientOptions,
  requestOptions: { params: { audienceDid: string } },
) => Promise<{ body: string }>

type MappedMethods<TMethods> = {
  [key in keyof TMethods]: TMethods[key] extends BasicApiMethodType ? MappedMethod<TMethods[key]> : never
}

type GetRequestOptions<TOperation extends MappedMethod<any>> = Parameters<TOperation>[2]
type ExtractField<TObject, TField extends string> = TObject extends Record<TField, unknown> ? TObject[TField] : never
export type GetParams<TOperation extends MappedMethod<any>> = ExtractField<GetRequestOptions<TOperation>, 'params'>

export const wrapWithDidAuth = <TMethods>(
  didAuthMethod: DidAuthApiMethodType,
  methods: TMethods,
): MappedMethods<TMethods> => {
  const createRequestToken = async (clientOptions: FullClientOptions, audienceDid: string) => {
    const response = await didAuthMethod(clientOptions, { params: { audienceDid } })
    return response.body
  }

  return mapValues(methods as any, (method) => {
    return async (didAuthSession: DidAuthSession, clientOptions: FullClientOptions, requestOptions: any) => {
      const authorization = await didAuthSession.getResponseToken((did) => createRequestToken(clientOptions, did))
      return method(clientOptions, { ...requestOptions, authorization })
    }
  }) as any
}
