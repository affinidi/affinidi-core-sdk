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
  pattern?: string
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
}

type FieldSpecRefType<TRefName extends string> = RefSpec<TRefName>

type FieldSpecOptionNullable = {
  nullable: true
}

type FieldSpecOptions = Partial<FieldSpecOptionNullable>

type FieldSpecPrimitiveType =
  | FieldSpecStringType
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

type ObjectSpecOptionAdditionalProperties<TIsAdditionalPropertiesAllowed extends boolean> =
  | (TIsAdditionalPropertiesAllowed extends false ? false : never)
  | (TIsAdditionalPropertiesAllowed extends true ? { additionalProperties: true; type: 'object' } : never)

type ObjectSpec<TKeys extends string, TRequiredKeys extends TKeys, TIsAdditionalPropertiesAllowed extends boolean> = {
  properties: Record<TKeys, FieldSpec>
  type: 'object'
  required?: ReadonlyArray<TRequiredKeys>
  additionalProperties: ObjectSpecOptionAdditionalProperties<TIsAdditionalPropertiesAllowed>
}

type ObjectSpecs<TKeys extends string> = Record<TKeys, ObjectSpec<string, string, boolean>>

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
  content: {
    'application/json': {
      schema?: undefined
    }
  }
}>

type ResponseSpecWithoutData =
  | ResponseSpecWithoutDataByCode<'200'>
  | ResponseSpecWithoutDataByCode<'204'>

type ResponseSpec = ResponseSpecWithData<FieldSpec> | ResponseSpecWithoutData

type OperationSpec = {
  operationId: string,
  responses: ResponseSpec,
  requestBody?: RequestSpec,
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
    ? ExtractObjectDeclaration<URefName, TObjectSpecs>
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

type ExtractRequiredFixedKeys<TObjectSpec extends ObjectSpec<any, any, any>> =
  IsStaticNonEmptyArray<TObjectSpec['required']> extends false
    ? never
    : (TObjectSpec extends ObjectSpec<infer TKeys, infer TRequiredKeys, any>
      ? TRequiredKeys
      : never)

type ExtractObjectDeclarationRequiredFields<
  TObjectSpec extends ObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  TObjectSpec extends ObjectSpec<infer TKeys, infer TRequiredKeys, any> ? {
    [key in Extract<TKeys, ExtractRequiredFixedKeys<TObjectSpec>>]:
      ExtractFieldDeclaration<TObjectSpec['properties'][key], TObjectSpecs>
  } : never

type ExtractObjectDeclarationOptionalFields<
  TObjectSpec extends ObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> =
  TObjectSpec extends ObjectSpec<infer TKeys, any, any> ? {
    [key in Exclude<TKeys, ExtractRequiredFixedKeys<TObjectSpec>>]?:
      ExtractFieldDeclaration<TObjectSpec['properties'][key], TObjectSpecs>
  } : never

type ExtractObjectDeclarationWithoutAdditionalFields<
  TObjectSpec extends ObjectSpec<string, string, boolean>,
  TObjectSpecs extends ObjectSpecs<string>,
> = ExtractObjectDeclarationRequiredFields<TObjectSpec, TObjectSpecs> &
  ExtractObjectDeclarationOptionalFields<TObjectSpec, TObjectSpecs>

type ExtractObjectDeclaration<TName extends string, TObjectSpecs extends ObjectSpecs<string>> =
  TName extends `FreeFormObject${infer U}`
    ? any
    : TObjectSpecs[TName] extends ObjectSpec<string, string, true>
      ? ExtractObjectDeclarationWithoutAdditionalFields<TObjectSpecs[TName], TObjectSpecs> & Record<string, unknown>
      : ExtractObjectDeclarationWithoutAdditionalFields<TObjectSpecs[TName], TObjectSpecs>

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
    : ExtractObjectDeclaration<NonNullable<TRequestName>, TObjectSpecs>
  
type ExtractOperationRequest<TOperationSpec extends OperationSpec, TObjectSpecs extends ObjectSpecs<string>> =
  ExtractOperationRequestByName<ExtractRequestName<TOperationSpec['requestBody']>, TObjectSpecs>

type ExtractOperationResponseByField<TFieldSpec extends FieldSpec | void, TObjectSpecs extends ObjectSpecs<string>> =
  TFieldSpec extends FieldSpec
    ? ExtractFieldDeclaration<TFieldSpec, TObjectSpecs>
    : TFieldSpec extends void ? void : never

type ExtractOperationResponse<TOperationSpec extends OperationSpec, TObjectSpecs extends ObjectSpecs<string>> =
  ExtractOperationResponseByField<ExtractResponseField<TOperationSpec['responses']>, TObjectSpecs>

type ExtractAllOperationIdsFromUnion<TOperationsSpec extends OperationSpec> = TOperationsSpec['operationId']

export type ExtractAllOperationIds<TSpec extends GenericApiSpec> =
  ExtractAllOperationIdsFromUnion<ExtractAllOperationSpecs<TSpec>>

type GetOperationById<TSpec extends GenericApiSpec, TOperationId extends ExtractAllOperationIds<TSpec>> =
  Extract<ExtractAllOperationSpecs<TSpec>, { operationId: TOperationId }>

export type ExtractRequestType<TSpec extends GenericApiSpec, TOperationId extends ExtractAllOperationIds<TSpec>> =
  Simplify<ExtractOperationRequest<GetOperationById<TSpec, TOperationId>, TSpec['components']['schemas']>>

export type ExtractResponseType<TSpec extends GenericApiSpec, TOperationId extends ExtractAllOperationIds<TSpec>> =
  Simplify<ExtractOperationResponse<GetOperationById<TSpec, TOperationId>, TSpec['components']['schemas']>>
