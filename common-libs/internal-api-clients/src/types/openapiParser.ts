import { AllOfObjectSpec, AnyOfObjectSpec, ContentSpec, FieldSpecAnyType, FieldSpecArrayType, FieldSpecBooleanType, FieldSpecDoubleType, FieldSpecEnumType, FieldSpecPrimitiveType, FieldSpecRecordType, FieldSpecRefType, FieldSpecStringType, GenericApiSpec, ObjectSpec, ObjectSpecOptionNullable, ObjectSpecs, ObjectSpecType, OneOfObjectSpec, OperationSpec, ParameterSpec, ParameterType, PathSpec, PathSpecs, RequestSpec, RequestSpecWithData, ResponseSpec, ResponseSpecWithData, SimpleObjectSpec } from "./openapi"
import { SafeGetArray, Simplify } from "./util"

type GenericDataType<TDataType extends string, TAdditionalData extends Record<string, unknown>> = {
  dataType: TDataType
} & TAdditionalData

export type DataRefType<TRefName extends string> = GenericDataType<'ref', { refName: TRefName }>
export type DataPrimitiveType<TPrimitiveType extends string | boolean | number> = GenericDataType<'primitive', { primitiveType: TPrimitiveType }>
export type DataRecordType = GenericDataType<'record', Record<never, never>>
export type DataAnyType = GenericDataType<'any', Record<never, never>>
export type DataArrayType = GenericDataType<'array', { elementType: DataTypeWithOptions }>
export type DataObjectType = GenericDataType<'object', {
  properties: Record<string, DataTypeWithOptions & { isRequired: boolean }>,
  isAdditionalProperties: boolean,
}>
export type DataAllOfType<TElementTypes extends readonly DataType[]> = GenericDataType<'allOf', { allOf: TElementTypes }>
export type DataAnyOfType<TElementTypes extends readonly DataType[]> = GenericDataType<'anyOf', { anyOf: TElementTypes }>
export type DataType =
  | DataRefType<string>
  | DataPrimitiveType<string | boolean | number>
  | DataRecordType
  | DataAnyType
  | DataArrayType
  | DataObjectType
  | DataAllOfType<readonly DataType[]>
  | DataAnyOfType<readonly DataType[]>

export type DataTypeWithOptions = DataType & { isNullable: boolean }

type DataErrorType<TMessage extends string, T> = GenericDataType<'error', { message: TMessage, originalType: T }>

type ParseFieldSpecPrimitiveType<TField extends FieldSpecPrimitiveType> = 
  TField extends FieldSpecRefType<infer URefName>
    ? DataRefType<URefName>
    : TField extends FieldSpecBooleanType
      ? DataPrimitiveType<boolean>
      : TField extends FieldSpecStringType
        ? DataPrimitiveType<string>
        : TField extends FieldSpecDoubleType
          ? DataPrimitiveType<number>
          : TField extends FieldSpecRecordType
            ? DataRecordType
            : TField extends FieldSpecEnumType<infer UEnum>
              ? DataPrimitiveType<UEnum>
              : TField extends FieldSpecAnyType
                ? DataAnyType
                : DataErrorType<'Unable to find matching primitive type', TField>

type ParseFieldSpecArrayType<
  TInnerFieldSpec extends ObjectSpecType,
  TField extends FieldSpecArrayType<TInnerFieldSpec>,
> = {
  dataType: 'array'
  elementType: ParseObjectSpec<TInnerFieldSpec>
} //DataArrayType<ParseObjectSpec<TInnerFieldSpec>>

type ParseSimpleObjectSpecWithParameters<
  TKeys extends string,
  TRequiredKeysArray extends readonly TKeys[],
  TIsAdditionalPropertiesAllowed extends boolean,
  TObject extends SimpleObjectSpec<TKeys, TRequiredKeysArray, TIsAdditionalPropertiesAllowed>,
> = {
  dataType: 'object'
  properties: {
    readonly [key in TKeys]: ParseObjectSpec<TObject['properties'][key]> & {
      isRequired: key extends SafeGetArray<TObject['required']>[number] ? true : false
    }
  }
  isAdditionalProperties: TObject extends { additionalProperties?: false } ? false : true
}

type ParseAllOfObjectSpec<TObjectSpecType extends readonly ObjectSpecType[]> = {
  dataType: 'allOf'
  allOf: {
    [key in keyof TObjectSpecType]:
      TObjectSpecType[key] extends TObjectSpecType[number]
        ? ParseObjectSpecType<TObjectSpecType[key]>
        : never
  }
}

type ParseAnyOfObjectSpec<TObjectSpecType extends readonly ObjectSpecType[]> = {
  dataType: 'anyOf'
  anyOf: {
    [key in keyof TObjectSpecType]:
      TObjectSpecType[key] extends TObjectSpecType[number]
        ? ParseObjectSpecType<TObjectSpecType[key]>
        : never
  }
}

type ParseObjectSpecType<TObject extends ObjectSpecType> =
  TObject extends FieldSpecPrimitiveType
    ? ParseFieldSpecPrimitiveType<TObject>
    : TObject extends FieldSpecArrayType<infer UInnerFieldSpec>
      ? ParseFieldSpecArrayType<UInnerFieldSpec, TObject>
      : TObject extends SimpleObjectSpec<infer UKeys, infer URequiredKeysArray, boolean>
        ? ParseSimpleObjectSpecWithParameters<UKeys, URequiredKeysArray, boolean, TObject>
        : TObject extends AllOfObjectSpec<infer UObjectSpecTypes>
          ? ParseAllOfObjectSpec<UObjectSpecTypes>
          : TObject extends AnyOfObjectSpec<infer UObjectSpecTypes>
            ? ParseAnyOfObjectSpec<UObjectSpecTypes>
            : TObject extends OneOfObjectSpec<infer UObjectSpecTypes>
              ? ParseAnyOfObjectSpec<UObjectSpecTypes> // we do not make distinction between oneOf and anyOf
              : DataErrorType<'Unable to find matching object spec type', TObject>

type ParseObjectSpec<TObject extends ObjectSpec> = ParseObjectSpecType<TObject> & {
  isNullable: TObject extends ObjectSpecOptionNullable ? true : false
}

type ParseObjectSpecs<TObjectSpecs extends ObjectSpecs<string>> = {
  [key in keyof TObjectSpecs]: key extends `FreeFormObject${string}`
    ? { dataType: 'record' }
    : ParseObjectSpec<TObjectSpecs[key]>
}

type ParseContentSpec<TContentSpec extends ContentSpec> =
  ParseObjectSpec<TContentSpec['content']['application/json']['schema']>

type ParseRequestSpec<TRequestSpec extends RequestSpec> =
  TRequestSpec extends RequestSpecWithData
    ? ParseContentSpec<TRequestSpec>
    : undefined

type ParseResponseSpec<TResponseSpec extends ResponseSpec> =
  TResponseSpec extends ResponseSpecWithData
    ? TResponseSpec extends Record<string, infer U>
      ? ParseContentSpec<Extract<U, ContentSpec>>
      : DataErrorType<'Unable to infer response content type', TResponseSpec>
    : undefined

type ParseOperationParameterSpec<TParameterSpec extends ParameterSpec> = ParseObjectSpec<TParameterSpec['schema']> & {
  isRequired: TParameterSpec['required']
}

type ParseOperationParametersSpec<TParameterSpecs extends ParameterSpec> = {
  dataType: 'object',
  properties: {
    readonly [key in TParameterSpecs['name']]: ParseOperationParameterSpec<Extract<TParameterSpecs, { name: key }>>
  },
  isAdditionalProperties: false,
}

type GetOperationParametersByParameterType<
  TOperationSpec extends OperationSpec,
  TParameterType extends ParameterType,
> =
  TOperationSpec['parameters'] extends readonly (infer UParameterSpec)[]
    ? TParameterType extends TOperationSpec['parameters'][number]['in']
      ? Extract<UParameterSpec, ParameterSpec & { in: TParameterType }>
      : never
    : never

type ParseOperationParametersByParameterType<
  TOperationSpec extends OperationSpec,
  TParameterType extends ParameterType,
> = ParseOperationParametersSpec<GetOperationParametersByParameterType<TOperationSpec, TParameterType>>

export type ParsedOperationSpec = {
  pathParams?: DataObjectType
  queryParams?: DataObjectType
  requestBody?: DataType
  responseBody?: DataType
}

type ParseOperationSpec<TOperationSpec extends OperationSpec> = {
  pathParams: ParseOperationParametersByParameterType<TOperationSpec, 'path'>
  queryParams: ParseOperationParametersByParameterType<TOperationSpec, 'query'>
  requestBody: ParseRequestSpec<TOperationSpec['requestBody']>
  responseBody: ParseResponseSpec<TOperationSpec['responses']>
}

type ParseOperationSpecs<TOperationSpecs extends OperationSpec> = {
  readonly [key in TOperationSpecs['operationId']]: ParseOperationSpec<Extract<TOperationSpecs, { operationId: key }>>
}

type GetOperationsFromPathSpec<TPathSpec extends PathSpec> =
  TPathSpec extends Record<string, infer UOperationSpec>
    ? Extract<UOperationSpec, OperationSpec>
    : DataErrorType<'Unable to parse path spec', TPathSpec>

type GetOperationsFromPathSpecs<TPathSpecs extends PathSpecs<string>> =
  TPathSpecs extends Record<string, infer UPathSpec>
    ? GetOperationsFromPathSpec<UPathSpec>
    : DataErrorType<'Unable to parse path specs', TPathSpecs>

export type ParsedSpec = {
  objects: Record<string, DataType>
  operations: Record<string, ParsedOperationSpec>
}

type ParseSpecRaw<TApiSpec extends GenericApiSpec> = {
  objects: ParseObjectSpecs<TApiSpec['components']['schemas']>
  operations: ParseOperationSpecs<GetOperationsFromPathSpecs<TApiSpec['paths']>>
}

export type ParseSpec<TApiSpec extends GenericApiSpec> = Simplify<ParseSpecRaw<TApiSpec>>
