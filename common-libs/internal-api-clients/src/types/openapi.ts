type RefSpec<TRefName extends string> = {
  '$ref': `#/components/schemas/${TRefName}`
}

export type FieldSpecStringType = {
  type: 'string'
  enum?: undefined
  pattern?: string
}

export type FieldSpecEnumType<TEnum extends string> = {
  type: 'string'
  enum: readonly TEnum[]
}

export type FieldSpecBooleanType = {
  type: 'boolean'
}

export type FieldSpecDoubleType = {
  type: 'number'
  format: 'double'
}

export type FieldSpecRecordType = {
  type: 'object'
  additionalProperties: true
  properties?: Record<string, never>
}

export type FieldSpecRefType<TRefName extends string> = RefSpec<TRefName>

export type FieldSpecPrimitiveType =
  | FieldSpecStringType
  | FieldSpecEnumType<string>
  | FieldSpecDoubleType
  | FieldSpecBooleanType
  | FieldSpecRecordType
  | FieldSpecRefType<string>

export type FieldSpecArrayType<TElementType extends ObjectSpecType> = {
  items: TElementType
  type: 'array'
}

type SimpleObjectSpecOptionAdditionalProperties<TIsAdditionalPropertiesAllowed extends boolean> =
  TIsAdditionalPropertiesAllowed extends true
    ? { additionalProperties: true | Record<string, never> | { additionalProperties: true; type: 'object' } }
    : TIsAdditionalPropertiesAllowed extends false
      ? { additionalProperties?: false }
      : never

type SimpleObjectPropertiesType<TKeys extends string, TProperty extends ObjectSpec> = Record<TKeys, TProperty>

export type SimpleObjectSpec<
  TKeys extends string,
  TRequiredKeysArray extends readonly TKeys[],
  TIsAdditionalPropertiesAllowed extends boolean
> = {
  properties: SimpleObjectPropertiesType<TKeys, any>
  type: 'object'
  required?: TRequiredKeysArray
} & SimpleObjectSpecOptionAdditionalProperties<TIsAdditionalPropertiesAllowed>

export type AllOfObjectSpec<TObjectSpecTypes extends readonly ObjectSpecType[]> = {
  allOf: TObjectSpecTypes
}

export type AnyOfObjectSpec<TObjectSpecTypes extends readonly ObjectSpecType[]> = {
  anyOf: TObjectSpecTypes
}

export type OneOfObjectSpec<TObjectSpecTypes extends readonly ObjectSpecType[]> = {
  oneOf: TObjectSpecTypes
}

export type ObjectSpecType =
  | FieldSpecPrimitiveType
  | FieldSpecArrayType<any>
  | SimpleObjectSpec<string, readonly string[], boolean>
  | AllOfObjectSpec<any>
  | AnyOfObjectSpec<any>
  | OneOfObjectSpec<any>

export type ObjectSpecOptionNullable = {
  nullable: true
}

export type ObjectSpec = ObjectSpecType & Partial<ObjectSpecOptionNullable>

export type ObjectSpecs<TKeys extends string> = Record<TKeys, ObjectSpec>

export type ContentSpec = {
  content: {
    'application/json': {
      schema: ObjectSpec
    }
  }
}

export type RequestSpecWithData = ContentSpec

export type RequestSpecWithoutData = undefined

export type RequestSpec = RequestSpecWithData | RequestSpecWithoutData

export type ResponseSpecWithData = Partial<Record<'200' | '204', ContentSpec>>

type ResponseSpecWithoutData = Partial<Record<'200' | '204', {
  content?: {
    'application/json': {
      schema?: Record<string, never>
    }
  }
  description?: string
}>>

export type ResponseSpec = ResponseSpecWithData | ResponseSpecWithoutData

export type ParameterType = 'header' | 'query' | 'path'

export type ParameterSpec = {
  in: ParameterType
  name: string
  schema: ObjectSpec
  required: boolean
}

export type OperationSpec = {
  operationId: string,
  responses: ResponseSpec,
  requestBody?: RequestSpec,
  parameters?: readonly ParameterSpec[],
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete'

export type PathSpec = Partial<Record<HttpMethod, OperationSpec>>

export type PathSpecs<TPaths extends string> = Record<TPaths, PathSpec>

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
