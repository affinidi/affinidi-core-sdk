import { FullServiceOptions, ServiceOptions } from './GenericApiService'
import { DidAuthAdapter } from '../helpers/DidAuthAdapter'
import { DidAuthSession } from '../helpers/DidAuthManager'

export type DidAuthConstructorOptions = ServiceOptions & {
  didAuthAdapter: DidAuthAdapter
}

type BasicApiMethodType = (serviceOptions: FullServiceOptions, requestOptions: any) => Promise<unknown>

type MappedMethod<TMethod extends BasicApiMethodType> = (
  didAuthSession: DidAuthSession,
  ...rest: Parameters<TMethod>
) => ReturnType<TMethod>

type DidAuthApiMethodType = (
  serviceOptions: FullServiceOptions,
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
  const createRequestToken = async (serviceOptions: FullServiceOptions, audienceDid: string) => {
    const response = await didAuthMethod(serviceOptions, { params: { audienceDid } })
    return response.body
  }

  const result: Record<string, any> = {}
  Object.entries(methods).forEach(([key, method]: [string, BasicApiMethodType]) => {
    result[key] = (didAuthSession: DidAuthSession, serviceOptions: FullServiceOptions, requestOptions: any) => {
      method(serviceOptions, {
        ...requestOptions,
        authorization: didAuthSession.getResponseToken((did) => createRequestToken(serviceOptions, did)),
      })
    }
  })

  return result as any
}
