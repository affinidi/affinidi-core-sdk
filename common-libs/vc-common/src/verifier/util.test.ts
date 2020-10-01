import {
  createValidatorResponse,
  isTypeOf,
  isUndefinedOr,
  isArrayOf,
  isNonEmptyString,
  isArrayOfNonEmptyStrings,
  isArrayIncluding,
  genValidateFn,
  isOneOf,
} from './util'

describe('createValidatorResponse', () => {
  it('returns true if condition is true', () => {
    const res = createValidatorResponse(true, 'message')

    expect(res).toBeTruthy()
  })

  it('returns the message if condition is false', () => {
    const res = createValidatorResponse(false, 'message')

    expect(res).toEqual({ message: 'message' })
  })
})

describe('isTypeOf', () => {
  describe('validates undefined', () => {
    it('when given "undefined"', async () => {
      expect.assertions(1)

      const res = await isTypeOf('undefined')(undefined, {})

      expect(res).toBeTruthy()
    })

    it('when not given a string', async () => {
      expect.assertions(1)

      const res = await isTypeOf('undefined')(1, {})

      expect(res).toEqual({ message: 'Expected to be typeof: "undefined"' })
    })
  })

  describe('validates object', () => {
    it('when given an object', async () => {
      expect.assertions(1)

      const res = await isTypeOf('object')({}, {})

      expect(res).toBeTruthy()
    })

    it('when not given a string', async () => {
      expect.assertions(1)

      const res = await isTypeOf('object')(1, {})

      expect(res).toEqual({ message: 'Expected to be typeof: "object"' })
    })
  })

  describe('validates boolean', () => {
    it('when given a boolean', async () => {
      expect.assertions(1)

      const res = await isTypeOf('boolean')(true, {})

      expect(res).toBeTruthy()
    })

    it('when not given a string', async () => {
      expect.assertions(1)

      const res = await isTypeOf('boolean')(1, {})

      expect(res).toEqual({ message: 'Expected to be typeof: "boolean"' })
    })
  })

  describe('validates bigint', () => {
    it('when given a bigint', async () => {
      expect.assertions(1)

      const res = await isTypeOf('bigint')(BigInt(9007199254740991), {})

      expect(res).toBeTruthy()
    })

    it('when not given a string', async () => {
      expect.assertions(1)

      const res = await isTypeOf('bigint')('string', {})

      expect(res).toEqual({ message: 'Expected to be typeof: "bigint"' })
    })
  })

  describe('validates string', () => {
    it('when given a string', async () => {
      expect.assertions(1)

      const res = await isTypeOf('string')('hello', {})

      expect(res).toBeTruthy()
    })

    it('when not given a string', async () => {
      expect.assertions(1)

      const res = await isTypeOf('string')(1, {})

      expect(res).toEqual({ message: 'Expected to be typeof: "string"' })
    })
  })

  describe('validates symbol', () => {
    it('when given a symbol', async () => {
      expect.assertions(1)

      const res = await isTypeOf('symbol')(Symbol(), {})

      expect(res).toBeTruthy()
    })

    it('when not given a symbol', async () => {
      const res = await isTypeOf('symbol')(1, {})

      expect(res).toEqual({ message: 'Expected to be typeof: "symbol"' })
    })
  })

  describe('validates function', () => {
    it('when given a function', async () => {
      expect.assertions(1)

      const res = await isTypeOf('function')(() => ({}), {})

      expect(res).toBeTruthy()
    })

    it('when not given a function', async () => {
      expect.assertions(1)

      const res = await isTypeOf('function')(1, {})

      expect(res).toEqual({ message: 'Expected to be typeof: "function"' })
    })
  })
})

describe('isUndefinedOr', () => {
  it('validates when given undefined', async () => {
    expect.assertions(1)

    const res = await isUndefinedOr(isTypeOf('string'))(undefined, {})

    expect(res).toBeTruthy()
  })

  it('validates when given a valid value', async () => {
    expect.assertions(1)

    const res = await isUndefinedOr(isTypeOf('string'))('string', {})

    expect(res).toBeTruthy()
  })

  it('fails when given an invalid value', async () => {
    expect.assertions(1)

    const res = await isUndefinedOr(isTypeOf('string'))(1, {})

    expect(res).toEqual({ message: 'Expected to be typeof: "string"' })
  })
})

describe('isArrayOf', () => {
  it('validates an array of values', async () => {
    expect.assertions(1)

    const res = await isArrayOf(isTypeOf('string'))(['hello'], {})

    expect(res).toBeTruthy()
  })

  it('fails an empty array', async () => {
    expect.assertions(1)

    const res = await isArrayOf(isTypeOf('string'))([], {})

    expect(res).toEqual({ message: 'Expected to be a non-empty array' })
  })

  it('validates an empty array when rejectEmpty is false', async () => {
    const res = await isArrayOf(isTypeOf('string'), false)([], {})

    expect(res).toBeTruthy()
  })

  it('fails when the array is filled with invalid values', async () => {
    expect.assertions(1)

    const res = await isArrayOf(isTypeOf('string'), false)([1], {})

    expect(res).toEqual({
      message: 'One or more items failed validation: Expected to be typeof: "string"',
    })
  })

  it('fails when not given an array', async () => {
    expect.assertions(1)

    const res = await isArrayOf(isTypeOf('string'), false)('string', {})

    expect(res).toEqual({
      message: 'Expected to be an array',
    })
  })
})

describe('isNonEmptyString', () => {
  it('validates a non-empty string', async () => {
    expect.assertions(1)

    const res = await isNonEmptyString('string', {})

    expect(res).toBeTruthy()
  })

  it('fails when value is empty string', async () => {
    expect.assertions(1)

    const res = await isNonEmptyString('', {})

    expect(res).toEqual({ message: 'Expected non empty string' })
  })

  it('fails when value is string with just spaces', async () => {
    expect.assertions(1)

    const res = await isNonEmptyString('  ', {})

    expect(res).toEqual({ message: 'Expected non empty string' })
  })

  it('fails when value is not a string', async () => {
    expect.assertions(1)

    const res = await isNonEmptyString(1, {})

    expect(res).toEqual({ message: 'Expected to be typeof: "string"' })
  })
})

describe('isOneOf', () => {
  it('validates when it passes one validator', async () => {
    expect.assertions(1)

    const res = await isOneOf(isNonEmptyString, isArrayOfNonEmptyStrings)('string', {})

    expect(res).toBeTruthy()
  })

  it('validates when it passes multiple validators', async () => {
    expect.assertions(1)

    const res = await isOneOf(isNonEmptyString, (value) =>
      createValidatorResponse(value === 'string', 'Expected to be "string"'),
    )('string', {})

    expect(res).toBeTruthy()
  })

  it('fails when it passes all validators', async () => {
    expect.assertions(1)

    const res = await isOneOf(isTypeOf('number'), isArrayOfNonEmptyStrings)('string', {})

    expect(res).toEqual({
      message: 'Item failed all validators:\nExpected to be typeof: "number"\nOR\nExpected to be an array',
    })
  })
})

describe('isArrayOfNonEmptyStrings', () => {
  it('validates an array of non-empty strings', async () => {
    expect.assertions(1)

    const res = await isArrayOfNonEmptyStrings(['hello', 'world'], {})

    expect(res).toBeTruthy()
  })

  it('fails when one entry is empty', async () => {
    expect.assertions(1)

    const res = await isArrayOfNonEmptyStrings(['hello', ''], {})

    expect(res).toEqual({
      message: 'One or more items failed validation: Expected non empty string',
    })
  })

  it('fails array is empty', async () => {
    expect.assertions(1)

    const res = await isArrayOfNonEmptyStrings([], {})

    expect(res).toEqual({ message: 'Expected to be a non-empty array' })
  })

  it('fails when not given an array', async () => {
    expect.assertions(1)

    const res = await isArrayOfNonEmptyStrings('', {})

    expect(res).toEqual({ message: 'Expected to be an array' })
  })
})

describe('isArrayIncluding', () => {
  it('validates when an array contains an item', async () => {
    expect.assertions(1)

    const res = await isArrayIncluding('string')(['string'], {})

    expect(res).toBeTruthy()
  })

  it("fails when the array doesn't contain the item", async () => {
    expect.assertions(1)

    const res = await isArrayIncluding('string')(['hello'], {})

    expect(res).toEqual({ message: 'Expected to contain: "string"' })
  })
})

describe('genValidateFn', () => {
  it('validates an object with given validators', async () => {
    expect.assertions(1)

    const validate = genValidateFn<{
      hello: string
      world: number
      array: string[]
    }>({
      hello: isNonEmptyString,
      world: isTypeOf('number'),
      array: [isArrayOfNonEmptyStrings, isArrayIncluding('important')],
    })

    const res = await validate({
      hello: 'hello',
      world: 1,
      array: ['first', 'second', 'important'],
    })

    expect(res).toEqual({
      kind: 'valid',
      data: {
        hello: 'hello',
        world: 1,
        array: ['first', 'second', 'important'],
      },
    })
  })

  it('fails with a single invalid param error', async () => {
    expect.assertions(1)

    const validate = genValidateFn<{
      hello: string
      world: number
      array: string[]
    }>({
      hello: isNonEmptyString,
      world: isTypeOf('number'),
      array: [isArrayOfNonEmptyStrings, isArrayIncluding('important')],
    })

    const res = await validate({
      hello: '',
      world: 1,
      array: ['first', 'second', 'important'],
    })

    expect(res).toEqual({
      kind: 'invalid',
      errors: [
        {
          kind: 'invalid_param',
          message: 'Invalid value for field "hello": Expected non empty string',
        },
      ],
    })
  })

  it('fails with multiple invalid param errors', async () => {
    expect.assertions(1)

    const validate = genValidateFn<{
      hello: string
      world: number
      array: string[]
    }>({
      hello: isNonEmptyString,
      world: isTypeOf('number'),
      array: [isArrayOfNonEmptyStrings, isArrayIncluding('important')],
    })

    const res = await validate({
      hello: '',
      world: 1,
      array: ['first', 'second'],
    })

    expect(res).toEqual({
      kind: 'invalid',
      errors: [
        {
          kind: 'invalid_param',
          message: 'Invalid value for field "hello": Expected non empty string',
        },
        {
          kind: 'invalid_param',
          message: 'Invalid value for field "array": Expected to contain: "important"',
        },
      ],
    })
  })

  it('fails with a single validation error', async () => {
    expect.assertions(1)

    const validate = genValidateFn<{
      hello: string
      world: number
      array: string[]
    }>({
      hello: [
        isNonEmptyString,
        () => {
          throw new Error('Testing!')
        },
      ],
      world: isTypeOf('number'),
      array: [isArrayOfNonEmptyStrings, isArrayIncluding('important')],
    })

    const res = await validate({
      hello: 'hello',
      world: 1,
      array: ['first', 'second', 'important'],
    })

    expect(res).toEqual({
      kind: 'invalid',
      errors: [
        {
          kind: 'validation_error',
          message: 'Error while validating field "hello": Error: Testing!',
        },
      ],
    })
  })

  it('fails with a single validation error', async () => {
    expect.assertions(1)

    const validate = genValidateFn<{
      hello: string
      world: number
      array: string[]
    }>({
      hello: [
        isNonEmptyString,
        () => {
          throw new Error('Testing!')
        },
      ],
      world: [
        isTypeOf('number'),
        () => {
          throw new Error('Testing!')
        },
      ],
      array: [isArrayOfNonEmptyStrings, isArrayIncluding('important')],
    })

    const res = await validate({
      hello: 'hello',
      world: 1,
      array: ['first', 'second', 'important'],
    })

    expect(res).toEqual({
      kind: 'invalid',
      errors: [
        {
          kind: 'validation_error',
          message: 'Error while validating field "hello": Error: Testing!',
        },
        {
          kind: 'validation_error',
          message: 'Error while validating field "world": Error: Testing!',
        },
      ],
    })
  })
})
