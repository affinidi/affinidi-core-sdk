type ValidatorResponse = true | { message: string }

export type Validator<V = any, D = any> =
  | ((value: V, data: D) => ValidatorResponse)
  | ((value: V, data: D) => Promise<ValidatorResponse>)

type Unvalidated<T> = { [key in keyof T]?: any }

type ValidatiedSuccess<T> = {
  kind: 'valid'
  data: T
}

export type ErrorConfig = {
  kind: string
  message: string
}

type ValidatiedInvalid = {
  kind: 'invalid'
  errors: ErrorConfig[]
}

export type Validatied<T> = ValidatiedSuccess<T> | ValidatiedInvalid

type Validations<T> = { [k in keyof T]: Validator | Validator[] }

export type ValidateFn<T> = (data: Unvalidated<T>) => Promise<Validatied<T>>

export const genValidateFn = <T>(validations: Validations<T>): ValidateFn<T> => {
  return async (data) => {
    const keys = Object.keys(validations)
    const errors: ErrorConfig[] = []

    for (const _fieldName of keys) {
      const fieldName = _fieldName as keyof T
      const validator: Validator | Validator[] = validations[fieldName]
      const validators: Validator[] = validator instanceof Array ? validator : [validator]

      for (const validator of validators) {
        try {
          const outcome = await validator(data[fieldName], data)

          if (outcome !== true) {
            errors.push({
              kind: 'invalid_param',
              message: `Invalid value for field "${fieldName}": ${outcome.message}`,
            })
          }
        } catch (err) {
          errors.push({
            kind: 'validation_error',
            message: `Error while validating field "${fieldName}": ${err}`,
          })
        }
      }
    }

    if (errors.length > 0) {
      return {
        kind: 'invalid',
        errors: errors,
      }
    }

    return {
      kind: 'valid',
      data: data as T,
    }
  }
}

export const isValid = <T>(validatorFn: ValidateFn<T>) => {
  return async (data: T): Promise<ValidatorResponse> => {
    const resp = await validatorFn(data)

    if (resp.kind === 'valid') {
      return true
    } else {
      return {
        message: `The following errors have occurred:\n${resp.errors
          .map((error) => `${error.kind}: ${error.message}`)
          .join('\n')}`,
      }
    }
  }
}

export const createValidatorResponse = (condition: boolean, message: string): ValidatorResponse => {
  if (condition) return true
  return { message }
}

type TypeOfTypes = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function'

export const isTypeOf =
  (type: TypeOfTypes): Validator =>
  (value) => {
    return createValidatorResponse(typeof value === type, `Expected to be typeof: "${type}"`)
  }

export const isUndefinedOr =
  <T>(validator: Validator<T>): Validator<T> =>
  async (value, data) => {
    if (typeof value === 'undefined') return true
    return validator(value, data)
  }

export const isArrayOf =
  <T>(validator: Validator<T>, rejectEmpty = true): Validator<T> =>
  async (value, data) => {
    if (!Array.isArray(value)) return { message: 'Expected to be an array' }
    if (rejectEmpty && value.length === 0) return { message: 'Expected to be a non-empty array' }

    let outcome: ValidatorResponse = true

    for (const v of value) {
      outcome = await validator(v, data)
      if (outcome !== true) break
    }

    if (outcome === true) return true

    return { message: `One or more items failed validation: ${outcome.message}` }
  }

export const isOneOf =
  <T>(...validators: Validator<T>[]): Validator<T> =>
  async (value, data) => {
    const invalid: { message: string }[] = []
    for (const validator of validators) {
      const outcome = await validator(value, data)
      if (outcome !== true) {
        invalid.push(outcome)
      } else {
        break
      }
    }

    if (invalid.length >= validators.length) {
      return { message: `Item failed all validators:\n${invalid.map(({ message }) => message).join('\nOR\n')}` }
    }

    return true
  }

export const isNonEmptyString: Validator = async (value, data) => {
  const res = await isTypeOf('string')(value, data)
  if (res !== true) return res
  return createValidatorResponse(value.trim().length > 0, 'Expected non empty string')
}

export const isEnum =
  <T>(values: T[]): Validator =>
  async (value) => {
    return createValidatorResponse(values.includes(value), `Expected a value to be one of: ${values.join(', ')}`)
  }

export const isArrayOfNonEmptyStrings = isArrayOf(isNonEmptyString)

export const isArrayIncluding =
  <T>(item: T): Validator<any[]> =>
  (value) => {
    return createValidatorResponse(value.includes(item), `Expected to contain: "${item}"`)
  }

export const isObject: Validator = (value) => {
  return createValidatorResponse(value !== null && typeof value === 'object', 'Expected an object')
}
