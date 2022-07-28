import { SdkError } from '@affinidi/tools-common'

// TODO: synchronize these errors with defined in /sdk/core/src/shared/SdkErrorFromCode
const errors = {
  'COR-2': {
    type: 'InvalidParametersError',
    message: 'Confirmation code expired.',
    httpStatusCode: 400,
  },
  'COR-3': {
    type: 'InvalidParametersError',
    message: 'Username should be valid email or phone number.',
    httpStatusCode: 400,
  },
  'COR-4': {
    type: 'OperationError',
    message: 'User not found.',
    httpStatusCode: 404,
  },
  'COR-5': {
    type: 'InvalidParametersError',
    message: 'Confirmation code is invalid.',
    httpStatusCode: 400,
  },
  'COR-6': {
    type: 'InvalidParametersError',
    message: 'Password requirements are not met (min length 8, number, uppercase, lowercase).',
    httpStatusCode: 400,
  },
  'COR-7': {
    type: 'OperationError',
    message: 'User with the given username already exists.',
    httpStatusCode: 409,
  },
  'COR-8': {
    type: 'OperationError',
    message: 'User already confirmed.',
    httpStatusCode: 409,
  },
  'COR-9': {
    type: 'UnprocessableEntityError',
    message: 'User must be logged in.',
    httpStatusCode: 422,
  },
  'COR-13': {
    type: 'InvalidParametersError',
    message: 'You can enter OTP not more than 3 times. Please sign in again.',
    httpStatusCode: 400,
  },
  'COR-16': {
    type: 'OperationError',
    message: 'User was created but not confirmed. Please sign up again to complete registration.',
    httpStatusCode: 400,
  },
  'COR-17': {
    type: 'InvalidParametersError',
    message: 'Confirmation code expired. Please sign in again.',
    httpStatusCode: 400,
  },
  'COR-26': {
    type: 'OperationError',
    message: 'User registration was not completed, the old user record is deleted. Please run registration flow again.',
    httpStatusCode: 409,
  },
  'COR-27': {
    type: 'OperationError',
    message: 'Invalid refresh token',
    httpStatusCode: 401,
  },
}

export default class SdkErrorFromCode extends SdkError {
  constructor(code: keyof typeof errors, context: unknown = {}, originalError: unknown = {}) {
    const error = errors[code]

    if (!error) {
      throw new Error(`Invalid operation error code: ${code}`)
    }

    super({ ...error, code }, context, originalError)
  }
}
