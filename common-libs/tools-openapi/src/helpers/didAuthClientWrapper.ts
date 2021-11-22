import { ThisData as BasicThisData, ClientOptions, createThisData } from './client'
import { DidAuthSession } from './didAuthSession'
import { mapFunctions } from './mapFunctions'

export type DidAuthAdapterType = {
  readonly did: string
  createDidAuthResponseToken(didAuthRequestToken: string): Promise<string>
  isResponseTokenExpired(responseToken: string, requestTime: number): boolean
}

export type DidAuthConstructorOptions = ClientOptions & {
  didAuthAdapter: DidAuthAdapterType
}

type ThisData = BasicThisData & {
  didAuthSession: DidAuthSession
}

type BasicApiMethodType<TRequestOptions = any> = (
  this: BasicThisData,
  requestOptions: TRequestOptions,
) => Promise<unknown>

type ExtractOriginalRequestOptions<TMethod extends BasicApiMethodType> = TMethod extends BasicApiMethodType<infer U>
  ? U
  : never

type MappedMethod<TMethod extends BasicApiMethodType> = (
  this: ThisData,
  requestOptions: Omit<ExtractOriginalRequestOptions<TMethod>, 'authorization'>,
) => ReturnType<TMethod>

type DidAuthApiMethodType = (
  this: BasicThisData,
  requestOptions: { params: { audienceDid: string } },
) => Promise<{ body: string }>

type MappedMethods<TMethods extends Record<keyof TMethods, BasicApiMethodType>> = {
  [key in keyof TMethods]: MappedMethod<TMethods[key]>
}

export type GetDidAuthParams<TOperation extends MappedMethod<any>> = TOperation extends MappedMethod<
  infer UOriginalMethod
>
  ? ExtractOriginalRequestOptions<UOriginalMethod>['params']
  : never

export const wrapWithDidAuth = <TMethods extends Record<keyof TMethods, BasicApiMethodType>>(
  didAuthMethod: DidAuthApiMethodType,
  methods: TMethods,
): MappedMethods<TMethods> => {
  const createRequestToken = async (clientOptions: BasicThisData, audienceDid: string) => {
    const response = await didAuthMethod.call(clientOptions, { params: { audienceDid } })
    return response.body
  }

  return mapFunctions(methods, (method) => {
    return async (self: ThisData, requestOptions: any) => {
      const authorization = await self.didAuthSession.getResponseToken((did) => createRequestToken(self, did))
      return method.call(self, { ...requestOptions, authorization })
    }
  }) as any
}

export const createDidAuthClient = <TMethods>(
  methods: TMethods,
  didAuthSession: DidAuthSession,
  serviceUrl: string,
  otherOptions: ClientOptions,
): TMethods & ThisData => {
  const thisData: ThisData = {
    ...createThisData(serviceUrl, otherOptions),
    didAuthSession,
  }

  return Object.assign(Object.create(methods as any), thisData)
}
