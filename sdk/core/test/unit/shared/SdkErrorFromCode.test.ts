import { expect } from 'chai'
import SdkErrorFromCode from '../../../src/shared/SdkErrorFromCode'

describe('SdkError', () => {
  it('Throws `Invalid operation error code` if error code not found', async () => {
    const errorCode = 'BAD_CODE'

    let responseError

    try {
      throw new SdkErrorFromCode(errorCode)
    } catch (error) {
      responseError = error
    }

    const expectedErrorMessage = `Invalid operation error code: ${errorCode}`

    expect(responseError.message).to.equal(expectedErrorMessage)
  })
})
