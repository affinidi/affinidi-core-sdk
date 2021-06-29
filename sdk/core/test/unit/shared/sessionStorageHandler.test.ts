import { expect } from 'chai'
import { SessionStorageService } from '../../../src/shared/sessionStorageHandler'

import { getAllOptionsForEnvironment } from '../../helpers'

import cognitoUserTokens from '../../factory/cognitoUserTokens'

const { userPoolId } = getAllOptionsForEnvironment()
const service = new SessionStorageService(userPoolId)

describe('SessionStorageHandler', () => {
  it('Saves cognito user tokens to sessionStorage', () => {
    service.saveUserTokens(cognitoUserTokens)

    const tokens = service.readUserTokens()

    expect(tokens).to.eql(cognitoUserTokens)
  })

  it('Throws `COR-9 / 422` when user is not logged in (tokens not found in the sessionStorage)', () => {
    let responseError

    service.clearUserTokens()

    try {
      service.readUserTokens()
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-9')
    expect(httpStatusCode).to.equal(422)
  })
})
