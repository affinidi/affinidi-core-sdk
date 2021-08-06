import { DataAllOfType, DataAnyOfType, DataAnyType, DataArrayType, DataObjectType, DataPrimitiveType, DataRecordType, DataRefType, DataType, DataTypeWithOptions, ParsedOperationSpec, ParsedSpec } from "./openapiParser"
import { RemoveEmpty, Simplify, Tail } from "./util"

type BuildProperties<TProps extends DataObjectType['properties'], TObjects extends ParsedSpec['objects']> = {
  [key in keyof TProps as TProps[key]['isRequired'] extends true ? key : never]: BuildDataWithOptions<TProps[key], TObjects>
} & {
  [key in keyof TProps as TProps[key]['isRequired'] extends false ? key : never]?: BuildDataWithOptions<TProps[key], TObjects>
}

type BuildAdditionalData<TIsAdditionalPropertiesAllowed extends boolean> =
  TIsAdditionalPropertiesAllowed extends true
    ? Record<string, any>
    : Record<never, never>

type BuildObjectData<TData extends DataObjectType, TObjects extends ParsedSpec['objects']> =
  BuildProperties<TData['properties'], TObjects> & BuildAdditionalData<TData['isAdditionalProperties']>

type BuildObjectDataWithUndefined<TData extends DataObjectType | undefined, TObjects extends ParsedSpec['objects']> =
  TData extends DataObjectType ? BuildObjectData<TData, TObjects> : undefined

type BuildAllOfData<TElementTypes extends readonly DataType[], TObjects extends ParsedSpec['objects']> =
  TElementTypes['length'] extends 0
    ? Record<never, never>
    : BuildData<TElementTypes[0], TObjects> & BuildAllOfData<Tail<TElementTypes>, TObjects>

type BuildAnyOfData<TElementTypes extends readonly DataType[], TObjects extends ParsedSpec['objects']> =
  TElementTypes['length'] extends 0
    ? Record<never, never>
    : TElementTypes extends readonly (infer UDataType)[]
      ? UDataType extends DataType
        ? BuildData<UDataType, TObjects>
        : never
      : never

type BuildData<TData extends DataType, TObjects extends ParsedSpec['objects']> =
  TData extends DataRefType<infer URef>
    ? BuildData<TObjects[URef], TObjects>
    : TData extends DataPrimitiveType<infer UPrimitive>
      ? UPrimitive
      : TData extends DataRecordType
        ? Record<string, any>
        : TData extends DataArrayType
          ? BuildDataWithOptions<TData['elementType'], TObjects>[]
          : TData extends DataObjectType
            ? BuildObjectData<TData, TObjects>
            : TData extends DataAllOfType<infer UElementTypes>
              ? BuildAllOfData<UElementTypes, TObjects>
              : TData extends DataAnyOfType<infer UElementTypes>
                ? BuildAnyOfData<UElementTypes, TObjects>
                : TData extends DataAnyType
                  ? string | number | boolean | Record<string, any>
                  : never

type BuildDataWithUndefined<TData extends DataType | undefined, TObjects extends ParsedSpec['objects']> =
  TData extends DataType ? BuildData<TData, TObjects> : undefined

type BuildDataWithOptions<TData extends DataTypeWithOptions, TObjects extends ParsedSpec['objects']> =
  TData['isNullable'] extends true
    ? BuildData<TData, TObjects> | null
    : TData['isNullable'] extends false
      ? BuildData<TData, TObjects>
      : never

type BuildOperation<TOperation extends ParsedOperationSpec, TObjects extends ParsedSpec['objects']> = {
  pathParams: RemoveEmpty<BuildObjectDataWithUndefined<TOperation['pathParams'], TObjects>>
  queryParams: RemoveEmpty<BuildObjectDataWithUndefined<TOperation['queryParams'], TObjects>>
  requestBody: RemoveEmpty<BuildDataWithUndefined<TOperation['requestBody'], TObjects>>
  responseBody: RemoveEmpty<BuildDataWithUndefined<TOperation['responseBody'], TObjects>>
}

type BuildOperations<TOperations extends ParsedSpec['operations'], TObjects extends ParsedSpec['objects']> = {
  [key in keyof TOperations]: BuildOperation<TOperations[key], TObjects>
}

type BuildApiRawType<TParsedSpec extends ParsedSpec> =
  BuildOperations<TParsedSpec['operations'], TParsedSpec['objects']>

export type BuiltApiType = Record<string, {
  pathParams?: Record<string, any>
  queryParams?: Record<string, any>
  requestBody?: any
  responseBody?: any
}>

export type BuildApiType<TParsedSpec extends ParsedSpec> = Simplify<BuildApiRawType<TParsedSpec>>
