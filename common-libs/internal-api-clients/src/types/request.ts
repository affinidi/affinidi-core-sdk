import { BuiltApiType } from './typeBuilder'
import { Simplify } from './util'

export type RawApiSpec<TApi extends BuiltApiType> = {
  servers: readonly [{ url: string }]
  paths: Record<string, Partial<Record<'get' | 'post' | 'put' | 'delete', { operationId: keyof TApi }>>>
}

type OptionalRecord = Record<string, any> | undefined

type WithOptionalField<TName extends string, TData extends OptionalRecord> = TData extends undefined | never
  ? Partial<Record<TName, undefined>>
  : Record<TName, TData>

type BasicRequestOptions = {
  authorization?: string
  storageRegion?: string
}

type RequestOptions<
  TParams extends OptionalRecord,
  TQuery extends OptionalRecord,
  TPath extends OptionalRecord
> = BasicRequestOptions &
  WithOptionalField<'params', TParams> &
  WithOptionalField<'queryParams', TQuery> &
  WithOptionalField<'pathParams', TPath>

export type RequestOptionsForOperation<TApi extends BuiltApiType, TOperationId extends keyof TApi> = Simplify<
  RequestOptions<TApi[TOperationId]['requestBody'], TApi[TOperationId]['queryParams'], TApi[TOperationId]['pathParams']>
>
