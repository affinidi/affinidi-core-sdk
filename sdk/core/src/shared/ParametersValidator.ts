import {
  validate,
  isDefined,
  isString,
  isNumber,
  isArray,
  isBoolean,
  isObject,
  matches,
  isISO8601,
} from 'class-validator'
import Ajv from 'ajv'
import S from 'fluent-schema'

import { DID, DID_METHOD, JWT, COGNITO_CONFIRMATION_CODE, PASSWORD } from '../dto/shared.dto'

import SdkError from './SdkError'

const did = 'did'
const didMethod = 'didMethod'
const jwt = 'jwt'
const array = 'array'
const number = 'number'
const object = 'object'
const string = 'string'
const boolean = 'boolean'
const isoString = 'isoString'
const confirmationCode = 'confirmationCode'
const password = 'password'

const primitives = [did, didMethod, jwt, array, number, object, string, boolean, isoString, confirmationCode, password]
const jsonSchemas = {
  VCV1: S.object()
    .prop('@context', S.anyOf([S.array().items(S.anyOf([S.string(), S.object()])), S.object(), S.string()]))
    .prop('id', S.string())
    .prop('type', S.array().items(S.string()))
    .prop('holder', S.object().prop('id', S.string()).required(['id']))
    // Credential Subject may be a single item or an array of items
    .prop('credentialSubject', S.anyOf([S.array(), S.object()]))
    .prop('issuanceDate', S.string().format('date-time'))
    .prop('expirationDate', S.string().format('date-time'))
    .prop('revocation', S.object().prop('id', S.string()).required(['id']))
    .required(['@context', 'id', 'type', 'holder', 'credentialSubject', 'issuanceDate']),
}

const isPrimitive = (schema: string) => primitives.includes(schema)

export class ParametersValidator {
  static async validate(schemas: any) {
    const allErrors: any = []

    for (const [index, schema] of schemas.entries()) {
      const { isArray, type, isRequired, value: SchemaValue } = schema

      let errors: any = []

      const isArrayValid = Array.isArray(SchemaValue) && SchemaValue

      if (isArray && isArrayValid && SchemaValue.length === 0) {
        continue
      }

      if (isArray && !isArrayValid) {
        const message = `Parameter at index [${index}] should be an array.`
        const error = { value: SchemaValue, message }

        allErrors.push(error)

        continue
      }

      if (isArray) {
        const items = SchemaValue

        for (const item of items) {
          errors = await ParametersValidator.process({ type, isRequired, value: item }, index)

          allErrors.push(...errors)
        }
      } else {
        errors = await ParametersValidator.process(schema, index)

        allErrors.push(...errors)
      }
    }

    if (allErrors.length > 0) {
      throw new SdkError('COR-1', { errors: allErrors })
    }
  }

  static validatePrimitive(schema: string, value: any) {
    let message: string
    let isValid: boolean = true

    switch (schema) {
      case did:
        isValid = matches(value, DID)
        message = `Parameter "${value}" is not a valid. Valid format: (${DID}).`
        break

      case didMethod:
        isValid = matches(value, DID_METHOD)
        message = `Parameter "${value}" is not a valid. Valid format: (${DID_METHOD}).`
        break

      case jwt:
        isValid = matches(value, JWT)
        message = `Parameter "${value}" is not a valid JWT. Valid format: (${JWT}).`
        break

      case array:
        isValid = isArray(value)
        message = `Parameter "${value}" should be an array.`
        break

      case number:
        isValid = isNumber(value)
        message = `Parameter "${value}" should be a number.`
        break

      case object:
        isValid = isObject(value)
        message = `Parameter "${value}" should be an object.`
        break

      case string:
        isValid = isString(value)
        message = `Parameter "${value}" should be a string.`
        break

      case boolean:
        isValid = isBoolean(value)
        message = `Parameter "${value}" should be a boolean.`
        break

      case isoString:
        isValid = isISO8601(value)
        message = `Parameter "${value}" is not a valid ISO 8601 date string.`
        break

      case confirmationCode:
        isValid = matches(value, COGNITO_CONFIRMATION_CODE)
        message = `Parameter "${value}" is not a valid confirmation code. Valid format: (${COGNITO_CONFIRMATION_CODE}).`
        break

      case password:
        isValid = matches(value, PASSWORD)
        message = `Parameter "${value}" is not a password. Valid format: (${PASSWORD}).`
        break
    }

    return { isValid, message }
  }

  static async process(schema: any, index: number) {
    const { type: Schema, isRequired, value: SchemaValue } = schema

    const allErrors: any = []

    const isUndefined = !isDefined(SchemaValue)

    if (isRequired && isUndefined) {
      allErrors.push({ value: SchemaValue, message: `Required parameter at index [${index}] is missing.` })
    }

    if (isUndefined) {
      return allErrors
    }

    if (isPrimitive(Schema)) {
      const { isValid, message } = ParametersValidator.validatePrimitive(Schema, SchemaValue)

      if (!isValid) {
        allErrors.push({ value: SchemaValue, message })
      }
    } else if (Object.keys(jsonSchemas).indexOf(Schema) !== -1) {
      try {
        const ajv = new Ajv()
        const isValid = ajv.validate(jsonSchemas[Schema as keyof typeof jsonSchemas].valueOf(), SchemaValue)

        if (!isValid) {
          allErrors.push({ value: SchemaValue, message: ajv.errorsText() })
        }
      } catch (error) {
        allErrors.push({ value: SchemaValue, message: error })
      }
    } else {
      const schema = new Schema()

      for (const [key, value] of Object.entries(SchemaValue)) {
        schema[key] = value
      }

      const errors = await validate(schema)
      const schemaErrors = []

      for (const error of errors) {
        const { property, value, constraints } = error

        schemaErrors.push({
          argument: property,
          value: value,
          message: constraints,
        })
      }

      if (schemaErrors.length > 0) {
        allErrors.push(schemaErrors)
      }
    }

    return allErrors
  }
}
