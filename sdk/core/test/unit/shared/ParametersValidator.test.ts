import { expect } from 'chai'
import { ParametersValidator } from '../../../src/shared/ParametersValidator'

describe('ParametersValidator', () => {
  it('Throws `COR-1 / 400` when bad parameters passed', async () => {
    let validationError
    const badArray = '123'
    const badNumber = '123'

    try {
      await ParametersValidator.validate([
        { isArray: false, type: 'array', isRequired: true, value: badArray },
        { isArray: false, type: 'number', isRequired: true, value: badNumber },
      ])
    } catch (error) {
      validationError = error
    }

    const { code, message, context, httpStatusCode } = validationError

    const { message: errorMessage1, value: errorValue1 } = context.errors[0]
    const { message: errorMessage2, value: errorValue2 } = context.errors[1]

    const expectedErrorMessage1 = `Parameter "${badArray}" should be an array.`
    const expectedErrorMessage2 = `Parameter "${badNumber}" should be a number.`

    expect(code).to.equal('COR-1')
    expect(message).to.equal('Invalid operation parameters.')
    expect(httpStatusCode).to.equal(400)
    expect(errorValue1).to.equal(badNumber)
    expect(errorMessage1).to.equal(expectedErrorMessage1)
    expect(errorValue2).to.equal(badNumber)
    expect(errorMessage2).to.equal(expectedErrorMessage2)
  })

  it('#validatePrimitive throws validation error when invalid DID is provided', async () => {
    const { isValid, message } = await ParametersValidator.validatePrimitive('did', 'did:my|method:hello|world')

    expect(isValid).to.be.false
    expect(message).to.have.string('Parameter "did:my|method:hello|world" is not a valid. Valid format: ')
  })
})
