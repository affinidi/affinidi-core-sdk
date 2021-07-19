type ErrorData = {
  code: string
  message: string
  httpStatusCode?: unknown
}

export default class SdkError extends Error {
  private readonly _code: string
  private readonly _context: unknown
  private readonly _originalError: unknown
  private readonly _httpStatusCode: unknown

  constructor(errorData: ErrorData, context: unknown = {}, originalError: unknown = {}) {
    if (!errorData) {
      throw new Error(`Empty error data`)
    }

    super(errorData.message)

    this._code = errorData.code
    this._context = context
    this._originalError = originalError
    this._httpStatusCode = (originalError as any).httpStatusCode || errorData.httpStatusCode
  }

  get code() {
    return this._code
  }

  get name() {
    return this._code
  }

  get context() {
    return this._context
  }

  get originalError() {
    return this._originalError
  }

  get httpStatusCode() {
    return this._httpStatusCode
  }
}
