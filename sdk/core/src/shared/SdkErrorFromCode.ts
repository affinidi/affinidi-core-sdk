import { SdkError, commonErrors } from '@affinidi/tools-common'

export default class SdkErrorFromCode extends SdkError {
  constructor(code: string, context: unknown = {}, originalError: unknown = {}) {
    const error = SdkErrorFromCode.errors[code]

    if (!error) {
      throw new Error(`Invalid operation error code: ${code}`)
    }

    super({ ...error, code }, context, originalError)
  }

  static get errors(): any {
    return {
      ...commonErrors,
      // NOTE: errors related to SDK only should be added here with a separate prefix SDK-XXX (SDK-1), not to commonErrors
    }
  }
}
