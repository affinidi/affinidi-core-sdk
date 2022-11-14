import { SdkError, commonErrors } from '@affinidi/tools-common'

const errors = {
  ...commonErrors,
  'UM-1': {
    type: 'NotAuthorizedException',
    message: 'User cannot be confirmed. Current status is CONFIRMED.',
    httpStatusCode: 400,
  },
  'UM-2': {
    type: 'TooManyRequestsException',
    message: 'Too many requests for operation.',
    httpStatusCode: 400,
  },
  'UM-3': {
    type: 'AliasExistsException',
    message: 'User with given email or phone exists. One email or phone can be attached to only one user record',
    httpStatusCode: 400,
  },
  'UM-4': {
    type: 'OperationError',
    message: 'Invalid response while fetching `Truecaller` public key.',
    httpStatusCode: 400,
  },
  'UM-5': {
    type: 'OperationError',
    message: 'URL could not be dereferenced, an error occurred. {{error}}',
    httpStatusCode: 400,
  },
  'UM-6': {
    type: 'OperationError',
    message: 'Validation failed. Invalid `TrueCaller` profile.',
    httpStatusCode: 400,
  },
  'UM-7': {
    type: 'OperationError',
    message: 'Phone number should exists and be valid.',
    httpStatusCode: 400,
  },
  // NOTE: errors related to user-management only should be added here with a separate prefix UM-XXX (UM-1), not to commonErrors
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
