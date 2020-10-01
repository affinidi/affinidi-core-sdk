import { expect } from 'chai'
import SdkError from '../../../src/shared/SdkError'

describe('SdkError', () => {
  it('Throws `Invalid operation error code` if error code not found', async () => {
    const errorCode = 'BAD_CODE'

    let responseError

    try {
      throw new SdkError(errorCode)
    } catch (error) {
      responseError = error
    }

    const expectedErrorMessage = `Invalid operation error code: ${errorCode}`

    expect(responseError.message).to.equal(expectedErrorMessage)
  })
})
