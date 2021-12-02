'use strict'

// TODO: Move this integration test to @affinidi/user-management package itself.
//       It requires testSecrets and _defaultConfig usage from SDK source code & environment,
//       which causes circular dependency.

import { expect } from 'chai'
import { UserManagementService } from '@affinidi/user-management'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'
import { testSecrets, getAllOptionsForEnvironment } from '../../helpers'
import { DEFAULT_COGNITO_REGION } from '../../../src/_defaultConfig'

const { COGNITO_PASSWORD, COGNITO_USERNAME, COGNITO_USERNAME_UNCONFIRMED } = testSecrets

let username: string
const randomPassword: string = 'P4ssw0rd'

const email = COGNITO_USERNAME as string
const password = COGNITO_PASSWORD as string

const existingConfirmedCognitoUser = email
const existingUnconfirmedCognitoUser = COGNITO_USERNAME_UNCONFIRMED as string
const nonExistingCognitoUser = 'non_existing_user'

const { clientId, userPoolId, keyStorageUrl, accessApiKey } = getAllOptionsForEnvironment()

const options = {
  region: DEFAULT_COGNITO_REGION,
  clientId,
  userPoolId,
}

const dependencies = {
  keyStorageApiService: new KeyStorageApiService({
    accessApiKey,
    keyStorageUrl,
  }),
}

// NOTE: consider having special pool for test users
describe('UserManagementService', () => {
  it('#signIn', async () => {
    username = email

    const userManagementService = new UserManagementService(options, dependencies)
    const accessToken = await userManagementService.logInWithPassword(username, password)

    expect(accessToken).to.exist
  })

  it('#signIn throws `COR-4 / 404` if user does not exists', async () => {
    username = nonExistingCognitoUser

    const userManagementService = new UserManagementService(options, dependencies)

    let responseError: any

    try {
      await userManagementService.logInWithPassword(username, password)
    } catch (error) {
      responseError = error
    }

    const { name, message } = responseError

    expect(name).to.eql('COR-4')
    expect(message).to.eql('User not found.')
  })

  it.skip('#signUp throws `COR-7 / 409` if called twice', async () => {
    username = nonExistingCognitoUser
    const password = randomPassword

    const userManagementService = new UserManagementService(options, dependencies)
    const result = await userManagementService.signUpWithUsernameAndConfirm(username, password)

    expect(result).to.be.a('string')

    let responseError: any

    try {
      await userManagementService.signUpWithUsernameAndConfirm(username, password)
    } catch (error) {
      responseError = error
    }

    const { name, message } = responseError

    expect(name).to.eql('COR-7')
    expect(message).to.eql('User with the given username already exists.')
  })

  it('#confirmSignUp throws `COR-4 / 404` if user not found', async () => {
    const email = 'non_existing@email.com'

    const confirmationCode = '777777'
    const userManagementService = new UserManagementService(options, dependencies)

    let responseError: any

    try {
      await userManagementService.completeSignUpForEmailOrPhone(email, confirmationCode)
    } catch (error) {
      responseError = error
    }

    const { name, message } = responseError

    expect(name).to.eql('COR-4')
    expect(message).to.eql('User not found.')
  })

  it('#isUserUnconfirmed returns `true` WHEN user is UNCONFIRMED', async () => {
    const cognitoUsername = existingUnconfirmedCognitoUser
    const userManagementService = new UserManagementService(options, dependencies)
    const isUserUnconfirmed = await userManagementService.doesUnconfirmedUserExist(cognitoUsername)

    expect(isUserUnconfirmed).to.equal(true)
  })

  it('#isUserUnconfirmed returns `false` WHEN user not UNCONFIRMED', async () => {
    const cognitoUsername = existingConfirmedCognitoUser
    const userManagementService = new UserManagementService(options, dependencies)
    const isUserUnconfirmed = await userManagementService.doesUnconfirmedUserExist(cognitoUsername)

    expect(isUserUnconfirmed).to.equal(false)
  })
})
