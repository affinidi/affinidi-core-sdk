import S, { JSONSchema } from 'fluent-schema'

export type EndpointSchema = {
  body: JSONSchema
  response: {
    200: JSONSchema
    400: JSONSchema
  }
}

// This is because "$schema" is not supported by Swagger (silent) or OpenAPI (error)
const removeUnsupporedKeyWord = (schema: JSONSchema) => {
  const copy = Object.assign({}, schema.valueOf())
  delete (copy as any)['$schema']
  return S.raw(copy)
}

const getInitiateBodySchema = (payloadDataSchema: JSONSchema) => {
  return S.object()
    .description('Initiate payload')
    .prop(
      'payload',
      S.object()
        .prop('id', S.string())
        .prop('holder', S.string())
        .prop('type', S.array().items(S.string()))
        .prop('data', payloadDataSchema)
        .required(['id', 'holder', 'type', 'data']),
    )
    .required(['payload'])
}

const getInitiateResponse200 = (payloadDataSchema: JSONSchema) => {
  return S.object()
    .description('Successful response')
    .prop('id', S.string())
    .prop('status', S.string())
    .prop('type', S.array().items(S.string()))
    .prop('success', S.boolean().enum([true]))
    .prop('data', payloadDataSchema)
    .required(['id', 'status', 'type', 'success', 'data'])
}

const getInitiateResponse400 = (payloadDataSchema: JSONSchema) => {
  return S.object()
    .description('Error response')
    .prop('id', S.string())
    .prop('status', S.string())
    .prop('type', S.array().items(S.string()))
    .prop('success', S.boolean().enum([false]))
    .prop('data', payloadDataSchema)
    .required(['id', 'status', 'type', 'success', 'data'])
}

export const getInitiateSchema = ({ payloadDataSchema }: { payloadDataSchema: JSONSchema }): EndpointSchema => {
  const body = removeUnsupporedKeyWord(getInitiateBodySchema(payloadDataSchema))
  const response200 = removeUnsupporedKeyWord(getInitiateResponse200(payloadDataSchema))
  const response400 = removeUnsupporedKeyWord(getInitiateResponse400(payloadDataSchema))

  return {
    body,
    response: {
      200: response200,
      400: response400,
    },
  }
}

const getVerifyBodySchema = (payloadDataSchema: JSONSchema) => {
  return S.object()
    .description('Verify payload')
    .prop(
      'payload',
      S.object()
        .prop('id', S.string())
        .prop('holder', S.string())
        .prop('type', S.array().items(S.string()))
        .prop('data', payloadDataSchema)
        .required(['id', 'holder', 'type', 'data']),
    )
    .required(['payload'])
}

const getVerifyResponse200Schema = (payloadDataSchema: JSONSchema, credentialSubjectDataSchema: JSONSchema) => {
  const credentialSubjectSchema = S.object()
    .prop('id', S.string())
    .prop('data', credentialSubjectDataSchema)
    .required(['data'])

  return S.object()
    .description('Successful response')
    .prop('id', S.string())
    .prop('success', S.boolean().enum([true]))
    .prop('type', S.array().items(S.string()))
    .prop('status', S.string())
    .prop('data', payloadDataSchema)
    .prop(
      'vcs',
      S.array().items(
        S.object()
          .prop('@context', S.array().items(S.anyOf([S.string(), S.object()])))
          .prop('id', S.string())
          .prop('type', S.array().items(S.string()))
          .prop('holder', S.object().prop('id', S.string()).required(['id']))
          // Credential Subject may be a single item or an array of items
          .prop('credentialSubject', S.anyOf([credentialSubjectSchema, S.array().items(credentialSubjectSchema)]))
          .prop('issuanceDate', S.string().format('date-time'))
          .prop('expirationDate', S.string().format('date-time'))
          .prop('revocation', S.object().prop('id', S.string()).required(['id']))
          .required(['@context', 'id', 'type', 'holder', 'credentialSubject', 'issuanceDate']),
      ),
    )
    .required(['id', 'status', 'type', 'success', 'data', 'vcs'])
}

const getVerifyResponse400Schema = (dataSchema: JSONSchema) => {
  return S.object()
    .description('Error response')
    .prop('id', S.string())
    .prop('status', S.string())
    .prop('type', S.array().items(S.string()))
    .prop('success', S.boolean().enum([false]))
    .prop('data', dataSchema)
    .required(['id', 'status', 'success', 'data'])
}

export const getVerifySchema = ({
  payloadDataSchema,
  credentialSubjectDataSchema,
}: {
  payloadDataSchema: JSONSchema
  credentialSubjectDataSchema: JSONSchema
}): EndpointSchema => {
  const body = removeUnsupporedKeyWord(getVerifyBodySchema(payloadDataSchema))
  const response200 = removeUnsupporedKeyWord(
    getVerifyResponse200Schema(payloadDataSchema, credentialSubjectDataSchema),
  )
  const response400 = removeUnsupporedKeyWord(getVerifyResponse400Schema(payloadDataSchema))

  return {
    body,
    response: {
      200: response200,
      400: response400,
    },
  }
}
