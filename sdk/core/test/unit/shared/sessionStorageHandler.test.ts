import { expect } from 'chai'
import {
  saveUserTokensToSessionStorage,
  readUserTokensFromSessionStorage,
  clearUserTokensFromSessionStorage,
} from '../../../src/shared/sessionStorageHandler'

import { getOptionsForEnvironment } from '../../helpers'

const cognitoUserTokens = require('../../factory/cognitoUserTokens')

const { userPoolId } = getOptionsForEnvironment()

describe('SessionStorageHandler', () => {
  it('Saves cognito user tokens to sessionStorage', () => {
    saveUserTokensToSessionStorage(userPoolId, cognitoUserTokens)

    const tokens = readUserTokensFromSessionStorage(userPoolId)

    expect(tokens).to.eql(cognitoUserTokens)
  })

  it('Throws `COR-9 / 422` when user is not logged in (tokens not found in the sessionStorage)', () => {
    let responseError

    clearUserTokensFromSessionStorage(userPoolId)

    try {
      readUserTokensFromSessionStorage(userPoolId)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-9')
    expect(httpStatusCode).to.equal(422)
  })
})
