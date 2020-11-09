'use strict'
import { expect } from 'chai'
import { randomBytes } from '../../../src/shared/randomBytes'
import CognitoService from '../../../src/services/CognitoService'

const { TEST_SECRETS } = process.env
const { COGNITO_PASSWORD, COGNITO_USERNAME, COGNITO_USERNAME_UNCONFIRMED } = JSON.parse(TEST_SECRETS)

let username: string
let randomPassword: string

const email = COGNITO_USERNAME
const password = COGNITO_PASSWORD

const existingConfirmedCognitoUser = email
const existingUnconfirmedCognitoUser = COGNITO_USERNAME_UNCONFIRMED
const nonExistingCognitoUser = 'non_existing_user'

// NOTE: consider having special pool for test users
describe('CognitoService', () => {
  beforeEach(async () => {
    const randomHex = (await randomBytes(32)).toString('hex')
    // Make first found letter uppercase because hex string doesn't meet password requirements
    randomPassword = randomHex.replace(/[a-f]/, 'A')
  })

  it('#signIn', async () => {
    username = email

    const cognitoService = new CognitoService()
    const accessToken = await cognitoService.signIn(username, password)

    expect(accessToken).to.exist
  })

  it('#signIn throws `COR-4 / 404` if user does not exists', async () => {
    username = nonExistingCognitoUser

    const cognitoService = new CognitoService()

    let responseError

    try {
      await cognitoService.signIn(username, password)
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

    const cognitoService = new CognitoService()
    const result = await cognitoService.signUp(username, password)

    expect(result).to.be.undefined

    let responseError

    try {
      await cognitoService.signUp(username, password)
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
    const cognitoService = new CognitoService()

    let responseError

    try {
      await cognitoService.confirmSignUp(username, confirmationCode)
    } catch (error) {
      responseError = error
    }

    const { name, message } = responseError

    expect(name).to.eql('COR-4')
    expect(message).to.eql('User not found.')
  })

  it('#isUserUnconfirmed returns `true` WHEN user is UNCONFIRMED', async () => {
    const cognitoUsername = existingUnconfirmedCognitoUser
    const cognitoService = new CognitoService()
    const isUserUnconfirmed = await cognitoService.isUserUnconfirmed(cognitoUsername)

    expect(isUserUnconfirmed).to.equal(true)
  })

  it('#isUserUnconfirmed returns `false` WHEN user not UNCONFIRMED', async () => {
    const cognitoUsername = existingConfirmedCognitoUser
    const cognitoService = new CognitoService()
    const isUserUnconfirmed = await cognitoService.isUserUnconfirmed(cognitoUsername)

    expect(isUserUnconfirmed).to.equal(false)
  })
})
