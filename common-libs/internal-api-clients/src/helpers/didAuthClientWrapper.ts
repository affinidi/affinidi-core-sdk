import mapValues from 'lodash.mapvalues'
import { ThisData as BasicThisData, ClientOptions, createThisData } from './client'
import { DidAuthAdapter } from './DidAuthAdapter'
import { DidAuthSession } from './DidAuthManager'

export type DidAuthConstructorOptions = ClientOptions & {
  didAuthAdapter: DidAuthAdapter
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

type MappedMethods<TMethods> = {
  [key in keyof TMethods]: TMethods[key] extends BasicApiMethodType ? MappedMethod<TMethods[key]> : never
}

export type GetParams<TOperation extends MappedMethod<any>> = TOperation extends MappedMethod<infer UOriginalMethod>
  ? ExtractOriginalRequestOptions<UOriginalMethod>['params']
  : never

export const wrapWithDidAuth = <TMethods>(
  didAuthMethod: DidAuthApiMethodType,
  methods: TMethods,
): MappedMethods<TMethods> => {
  const createRequestToken = async (clientOptions: BasicThisData, audienceDid: string) => {
    const response = await didAuthMethod.call(clientOptions, { params: { audienceDid } })
    return response.body
  }

  return mapValues(methods as any, (method, key) => {
    // we could simply return a function here, but then it would not have a display name
    // and wouldn't show up in stacktraces properly,
    // so we have to make a temporary object here in order for function to get a display name
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#inferred_function_names
    const functionObject = {
      [key]: async function (this: ThisData, requestOptions: any) {
        const authorization = await this.didAuthSession.getResponseToken((did) => createRequestToken(this, did))
        return method.call(this, { ...requestOptions, authorization })
      },
    }

    return functionObject[key]
  }) as any
}

export const createClient = <TMethods>(
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
