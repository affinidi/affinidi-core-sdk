type Simplify<T> = T extends Record<string, unknown> | unknown[]
  ? (T extends infer O
    ? { [K in keyof O]: Simplify<O[K]> }
    : never)
  : T;

type RefSpec<TRefName extends string> = {
  '$ref': `#/components/schemas/${TRefName}`
}

type FieldSpecStringType = {
  type: 'string'
  enum?: undefined
  pattern?: string
}

type FieldSpecEnumType<TEnum extends string> = {
  type: 'string'
  enum: readonly TEnum[]
}

type FieldSpecBooleanType = {
  type: 'boolean'
}

type FieldSpecDoubleType = {
  type: 'number'
  format: 'double'
}

type FieldSpecRecordType = {
  type: 'object'
  additionalProperties: true
  properties?: undefined
}

type FieldSpecRefType<TRefName extends string> = RefSpec<TRefName>

type FieldSpecOptionNullable = {
  nullable: true
}

type FieldSpecOptions = Partial<FieldSpecOptionNullable>

type FieldSpecPrimitiveType =
  | FieldSpecStringType
  | FieldSpecEnumType<string>
  | FieldSpecDoubleType
  | FieldSpecBooleanType
  | FieldSpecRecordType
  | FieldSpecRefType<string>

type FieldSpecPrimitive = FieldSpecPrimitiveType & FieldSpecOptions

type FieldSpecArrayType<TElementType extends FieldSpecType> = {
  items: TElementType
  type: 'array'
}

type FieldSpecType = FieldSpecPrimitiveType | FieldSpecArrayType<FieldSpecPrimitive>

type FieldSpec = FieldSpecType & Partial<FieldSpecOptionNullable>

type SimpleObjectSpecOptionAdditionalProperties<TIsAdditionalPropertiesAllowed extends boolean> =
  | (TIsAdditionalPropertiesAllowed extends false ? { additionalProperties?: false } : never)
  | (TIsAdditionalPropertiesAllowed extends true ? { additionalProperties: { additionalProperties: true; type: 'object' } } : never)

type SimpleObjectSpec<
  TKeys extends string,
  TRequiredKeys extends TKeys,
  TIsAdditionalPropertiesAllowed extends boolean
> = {
  properties: Record<TKeys, FieldSpec>
  type: 'object'
  required?: ReadonlyArray<TRequiredKeys>
} & SimpleObjectSpecOptionAdditionalProperties<TIsAdditionalPropertiesAllowed>

type AllOfOptionSpec = RefSpec<string> | SimpleObjectSpec<string, string, boolean>

type AllOfObjectSpec<T extends readonly AllOfOptionSpec[]> = {
  allOf: T
}

type ObjectSpec = SimpleObjectSpec<string, string, boolean> | AllOfObjectSpec<readonly AllOfOptionSpec[]>

type ObjectSpecs<TKeys extends string> = Record<TKeys, ObjectSpec>

type RequestSpecWithData<TRequestName extends string> = {
  content: {
    'application/json': {
      schema: RefSpec<TRequestName>
    }
  }
}

type RequestSpecWithoutData = undefined

type RequestSpec = RequestSpecWithData<string> | RequestSpecWithoutData

type ResponseSpecWithDataByCode<TFieldSpec extends FieldSpec, THttpCode extends string> = Record<THttpCode, {
  content: {
    'application/json': {
      schema: TFieldSpec
    }
  }
}>

type ResponseSpecWithData<TFieldSpec extends FieldSpec> =
  | ResponseSpecWithDataByCode<TFieldSpec, '200'>
  | ResponseSpecWithDataByCode<TFieldSpec, '204'>

type ResponseSpecWithoutDataByCode<THttpCode extends string> = Record<THttpCode, {
  content?: {
    'application/json': {
      schema?: undefined
    }
  }
  description?: 'No content'
}>

type ResponseSpecWithoutData =
  | ResponseSpecWithoutDataByCode<'200'>
  | ResponseSpecWithoutDataByCode<'204'>

type ResponseSpec = ResponseSpecWithData<FieldSpec> | ResponseSpecWithoutData

type ParameterType = 'header' | 'query' | 'path'

type ParameterSpec<
  TParameterType extends ParameterType,
  TName extends string,
  TFieldSpec extends FieldSpec,
  TIsRequired extends boolean,
> = {
  in: TParameterType
  name: TName
  schema: TFieldSpec
  required: TIsRequired
}

type OperationSpec = {
  operationId: string,
  responses: ResponseSpec,
  requestBody?: RequestSpec,
  parameters?: readonly ParameterSpec<ParameterType, string, FieldSpec, boolean>[],
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete'

type PathSpec = Partial<Record<HttpMethod, OperationSpec>>

type PathSpecs<TPaths extends string> = Record<TPaths, PathSpec>

export type GenericApiSpec = {
  components: {
    schemas: ObjectSpecs<string>
  }
  paths: PathSpecs<string>
  servers: Readonly<
    {
      url: string
    }[]
  >
}

type ExtractAllOperationSpecsFromMethods<TPathSpec extends PathSpec> =
  TPathSpec extends Record<string, infer U>
    ? Extract<U, OperationSpec>
    : never

type ExtractAllOperationSpecsFromPaths<TPaths extends PathSpecs<string>> =
  TPaths extends Record<string, infer U>
    ? ExtractAllOperationSpecsFromMethods<U>
    : never

type ExtractAllOperationSpecs<TSpec extends GenericApiSpec> = ExtractAllOperationSpecsFromPaths<TSpec['paths']>

type ExtractNonNullableFieldDeclaration<TField extends FieldSpecType, TObjectSpecs extends ObjectSpecs<string>> = 
  TField extends FieldSpecRefType<infer URefName>
    ? ExtractObjectDeclarationByName<URefName, TObjectSpecs>
    : TField extends FieldSpecArrayType<infer UInnerFieldSpec>
      ? ExtractNonNullableFieldDeclaration<UInnerFieldSpec, TObjectSpecs>[]
      : TField extends FieldSpecBooleanType
        ? boolean
        : TField extends FieldSpecStringType
          ? string
          : TField extends FieldSpecDoubleType
            ? number
            : TField extends FieldSpecRecordType
              ? Record<string, any>
              : TField extends FieldSpecEnumType<infer UEnum>
                ? UEnum
                : never

type ExtractFieldDeclaration<TField extends FieldSpec, TObjectSpecs extends ObjectSpecs<string>> =
  TField extends FieldSpecOptionNullable
    ? ExtractNonNullableFieldDeclaration<TField, TObjectSpecs> | null
    : ExtractNonNullableFieldDeclaration<TField, TObjectSpecs>

type IsStaticNonEmptyArray<T> = 
  T extends undefined | null | never
    ? false
    : (T extends readonly unknown[]
      ? (T['length'] extends 0
        ? false
        : true)
      : false)

type ExtractRequiredFixedKeys<TObjectSpec extends SimpleObjectSpec<any, any, any>> =
  IsStaticNonEmptyArray<TObjectSpec['required']> extends false
    ? never
    : (TObjectSpec extends SimpleObjectSpec<infer TKeys, infer TRequiredKeys, any>
      ? TRequiredKeys
      : never)

type ExtractObjectDeclarationRequiredFields<
  TObjectSpec extends SimpleObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  TObjectSpec extends SimpleObjectSpec<infer TKeys, infer TRequiredKeys, any> ? {
    [key in Extract<TKeys, ExtractRequiredFixedKeys<TObjectSpec>>]:
      ExtractFieldDeclaration<TObjectSpec['properties'][key], TObjectSpecs>
  } : never

type ExtractObjectDeclarationOptionalFields<
  TObjectSpec extends SimpleObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  TObjectSpec extends SimpleObjectSpec<infer TKeys, any, any> ? {
    [key in Exclude<TKeys, ExtractRequiredFixedKeys<TObjectSpec>>]?:
      ExtractFieldDeclaration<TObjectSpec['properties'][key], TObjectSpecs>
  } : never

type ExtractObjectDeclarationWithoutAdditionalFields<
  TObjectSpec extends SimpleObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> = ExtractObjectDeclarationRequiredFields<TObjectSpec, TObjectSpecs> &
  ExtractObjectDeclarationOptionalFields<TObjectSpec, TObjectSpecs>

type ExtractSimpleObjectDeclaration<
  TObjectSpec extends SimpleObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>
> =
  TObjectSpec extends SimpleObjectSpec<string, string, true>
    ? ExtractObjectDeclarationWithoutAdditionalFields<TObjectSpec, TObjectSpecs> & Record<string, unknown>
    : ExtractObjectDeclarationWithoutAdditionalFields<TObjectSpec, TObjectSpecs>

type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : [];

type ExtractAllOfOptionDeclaration<TOption extends AllOfOptionSpec, TObjectSpecs extends ObjectSpecs<string>> =
  TOption extends RefSpec<infer URefName>
    ? ExtractObjectDeclarationByName<URefName, TObjectSpecs>
    : (TOption extends SimpleObjectSpec<string, string, boolean>
      ? ExtractSimpleObjectDeclaration<TOption, TObjectSpecs>
      : never)

type ExtractAllOfDeclaration<TOptions extends readonly AllOfOptionSpec[], TObjectSpecs extends ObjectSpecs<string>> =
  TOptions['length'] extends 0
    ? Record<never, never>
    : ExtractAllOfOptionDeclaration<TOptions[0], TObjectSpecs> & ExtractAllOfDeclaration<Tail<TOptions>, TObjectSpecs>

type ExtractObjectDeclarationByValue<TObjectSpec extends ObjectSpec, TObjectSpecs extends ObjectSpecs<string>> =
  TObjectSpec extends SimpleObjectSpec<string, string, boolean>
    ? ExtractSimpleObjectDeclaration<TObjectSpec, TObjectSpecs>
    : (TObjectSpec extends AllOfObjectSpec<readonly AllOfOptionSpec[]>
        ? ExtractAllOfDeclaration<TObjectSpec['allOf'], TObjectSpecs>
        : never)

type ExtractObjectDeclarationByName<TName extends string, TObjectSpecs extends ObjectSpecs<string>> =
  TName extends `FreeFormObject${infer U}`
    ? any
    : ExtractObjectDeclarationByValue<TObjectSpecs[TName], TObjectSpecs>

type ExtractRequestName<TRequestSpec extends RequestSpec> =
  TRequestSpec extends RequestSpecWithData<infer U>
    ? U
    : undefined

type ExtractResponseField<TResponseSpec extends ResponseSpec> =
  TResponseSpec extends ResponseSpecWithData<infer U>
    ? U
    : void

type ExtractOperationRequestByName<TRequestName extends string | undefined, TObjectSpecs extends ObjectSpecs<string>> =
  TRequestName extends undefined | null
    ? undefined
    : ExtractObjectDeclarationByName<NonNullable<TRequestName>, TObjectSpecs>
  
type ExtractOperationRequest<TOperationSpec extends OperationSpec, TObjectSpecs extends ObjectSpecs<string>> =
  ExtractOperationRequestByName<ExtractRequestName<TOperationSpec['requestBody']>, TObjectSpecs>

type ExtractOperationResponseByField<TFieldSpec extends FieldSpec | void, TObjectSpecs extends ObjectSpecs<string>> =
  TFieldSpec extends FieldSpec
    ? ExtractFieldDeclaration<TFieldSpec, TObjectSpecs>
    : TFieldSpec extends void ? void : never

type ExtractOperationResponse<TOperationSpec extends OperationSpec, TObjectSpecs extends ObjectSpecs<string>> =
  ExtractOperationResponseByField<ExtractResponseField<TOperationSpec['responses']>, TObjectSpecs>

type ExtractParameterDeclaration<
  TParameterSpec extends ParameterSpec<ParameterType, string, FieldSpec, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  TParameterSpec extends ParameterSpec<ParameterType, string, infer UFieldSpec, boolean>
    ? ExtractFieldDeclaration<UFieldSpec, TObjectSpecs>
    : never

type ExtractParameterDeclarationByName<
  TParameterSpecs extends ParameterSpec<ParameterType, string, FieldSpec, boolean>,
  TName extends string, TObjectSpecs extends ObjectSpecs<string>,
> = ExtractParameterDeclaration<
  Extract<TParameterSpecs, ParameterSpec<ParameterType, TName, FieldSpec, boolean>>,
  TObjectSpecs
>
  
type ExtractOperationRequiredParameters<
  TParameterSpecs extends ParameterSpec<ParameterType, string, FieldSpec, true>,
  TObjectSpecs extends ObjectSpecs<string>,
> = {
  [key in TParameterSpecs['name']]: ExtractParameterDeclarationByName<TParameterSpecs, key, TObjectSpecs>
}

type ExtractOperationOptionalParameters<
  TParameterSpecs extends ParameterSpec<ParameterType, string, FieldSpec, false>,
  TObjectSpecs extends ObjectSpecs<string>,
> ={
  [key in TParameterSpecs['name']]?: ExtractParameterDeclarationByName<TParameterSpecs, key, TObjectSpecs>
}

type ExtractOperationParametersByParameterSpecs<
  TParameterSpecs extends ParameterSpec<ParameterType, string, FieldSpec, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  ExtractOperationRequiredParameters<
    Extract<TParameterSpecs, ParameterSpec<ParameterType, string, FieldSpec, true>>,
    TObjectSpecs
  > &
  ExtractOperationOptionalParameters<
    Extract<TParameterSpecs, ParameterSpec<ParameterType, string, FieldSpec, false>>,
    TObjectSpecs
  >

type ExtractOperationParametersByParameterType<
  TOperationSpec extends OperationSpec,
  TParameterType extends ParameterType,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  TOperationSpec['parameters'] extends readonly (infer UParameterSpec)[]
    ? TParameterType extends TOperationSpec['parameters'][number]['in']
      ? ExtractOperationParametersByParameterSpecs<
        Extract<UParameterSpec, ParameterSpec<TParameterType, string, FieldSpec, boolean>>,
        TObjectSpecs
      >
      : undefined
    : undefined

type ExtractAllOperationIdsFromUnion<TOperationsSpec extends OperationSpec> = TOperationsSpec['operationId']

export type ExtractAllOperationIds<TSpec extends GenericApiSpec> =
  ExtractAllOperationIdsFromUnion<ExtractAllOperationSpecs<TSpec>>

type GetOperationById<TSpec extends GenericApiSpec, TOperationId extends ExtractAllOperationIds<TSpec>> =
  Extract<ExtractAllOperationSpecs<TSpec>, { operationId: TOperationId }>

export type ExtractRequestType<TSpec extends GenericApiSpec, TOperationId extends ExtractAllOperationIds<TSpec>> =
  Simplify<ExtractOperationRequest<GetOperationById<TSpec, TOperationId>, TSpec['components']['schemas']>>

export type ExtractResponseType<TSpec extends GenericApiSpec, TOperationId extends ExtractAllOperationIds<TSpec>> =
  Simplify<ExtractOperationResponse<GetOperationById<TSpec, TOperationId>, TSpec['components']['schemas']>>

export type ExtractParametersType<
  TSpec extends GenericApiSpec,
  TOperationId extends ExtractAllOperationIds<TSpec>,
  TParameterType extends ParameterType,
> =
  Simplify<ExtractOperationParametersByParameterType<GetOperationById<TSpec, TOperationId>, TParameterType, TSpec['components']['schemas']>>