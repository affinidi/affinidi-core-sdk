'use strict'
import { expect } from 'chai'
import { randomBytes } from '../../../src/shared/randomBytes'
import UserManagementService from '../../../src/services/UserManagementService'
import { getAllOptionsForEnvironment, testSecrets } from '../../helpers'

const { COGNITO_PASSWORD, COGNITO_USERNAME, COGNITO_USERNAME_UNCONFIRMED } = testSecrets

let username: string
let randomPassword: string

const email = COGNITO_USERNAME
const password = COGNITO_PASSWORD

const existingConfirmedCognitoUser = email
const existingUnconfirmedCognitoUser = COGNITO_USERNAME_UNCONFIRMED
const nonExistingCognitoUser = 'non_existing_user'

const { clientId, userPoolId, keyStorageUrl, accessApiKey } = getAllOptionsForEnvironment()
const constructorOptions = { clientId, userPoolId, keyStorageUrl, accessApiKey }

// NOTE: consider having special pool for test users
describe('UserManagementService', () => {
  beforeEach(async () => {
    const randomHex = (await randomBytes(32)).toString('hex')
    // Make first found letter uppercase because hex string doesn't meet password requirements
    randomPassword = randomHex.replace(/[a-f]/, 'A')
  })

  it('#signIn', async () => {
    username = email

    const userManagementService = new UserManagementService(constructorOptions)
    const accessToken = await userManagementService.signIn(username, password)

    expect(accessToken).to.exist
  })

  it('#signIn throws `COR-4 / 404` if user does not exists', async () => {
    username = nonExistingCognitoUser

    const userManagementService = new UserManagementService(constructorOptions)

    let responseError

    try {
      await userManagementService.signIn(username, password)
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

    const userManagementService = new UserManagementService(constructorOptions)
    const result = await userManagementService.signUp(username, password, undefined)

    expect(result).to.be.a('string')

    let responseError

    try {
      await userManagementService.signUp(username, password, undefined)
    } catch (error) {
      responseError = error
    }

    const { name, message } = responseError

    expect(name).to.eql('COR-7')
    expect(message).to.eql('User with the given username already exists.')
  })

  it('#confirmSignUp throws `COR-4 / 404` if user not found', async () => {
    username = 'non_existing@email.com'

    const confirmationCode = '777777'
    const userManagementService = new UserManagementService(constructorOptions)

    let responseError

    try {
      await userManagementService.confirmSignUp(username, confirmationCode)
    } catch (error) {
      responseError = error
    }

    const { name, message } = responseError

    expect(name).to.eql('COR-4')
    expect(message).to.eql('User not found.')
  })

  it('#isUserUnconfirmed returns `true` WHEN user is UNCONFIRMED', async () => {
    const cognitoUsername = existingUnconfirmedCognitoUser
    const userManagementService = new UserManagementService(constructorOptions)
    const isUserUnconfirmed = await userManagementService.isUserUnconfirmed(cognitoUsername)

    expect(isUserUnconfirmed).to.equal(true)
  })

  it('#isUserUnconfirmed returns `false` WHEN user not UNCONFIRMED', async () => {
    const cognitoUsername = existingConfirmedCognitoUser
    const userManagementService = new UserManagementService(constructorOptions)
    const isUserUnconfirmed = await userManagementService.isUserUnconfirmed(cognitoUsername)

    expect(isUserUnconfirmed).to.equal(false)
  })
})
