'use strict'

import { expect } from 'chai'
import { decode as jwtDecode } from 'jsonwebtoken'
import { KeyStorageApiService } from '@affinidi/internal-api-clients'

import KeyManagementService from '../../../src/services/KeyManagementService'
import UserManagementService from '../../../src/services/UserManagementService'
import WalletStorageService from '../../../src/services/WalletStorageService'
import { normalizeUsername } from '../../../src/shared'

import { getAllOptionsForEnvironment, testSecrets } from '../../helpers'
import { CommonNetworkMember } from '../../helpers/CommonNetworkMember'
import { extractSDKVersion } from '../../../src/_helpers'

const options = getAllOptionsForEnvironment()

const { PASSWORD, COGNITO_PASSWORD, COGNITO_USERNAME, ENCRYPTED_SEED_JOLO } = testSecrets

const password = PASSWORD
const encryptedSeed = ENCRYPTED_SEED_JOLO

const cognitoUsernameStaging = COGNITO_USERNAME
const nonExistingUser = 'non_existing@email.com'
const cognitoPassword = COGNITO_PASSWORD
const cognitoUsername = cognitoUsernameStaging

const { keyStorageUrl } = options
let userManagementService: UserManagementService

const createKeyManagementService = () => {
  return new KeyManagementService(options)
}

describe('WalletStorageService', () => {
  beforeEach(() => {
    userManagementService = new UserManagementService(options)
  })

  it('#storeEncryptedSeed throws 409 exception WHEN key for userId already exists', async () => {
    const { accessToken } = await userManagementService.logInWithPassword(cognitoUsername, cognitoPassword)

    const keyStorageApiService = new KeyStorageApiService({
      keyStorageUrl: options.keyStorageUrl,
      accessApiKey: options.accessApiKey,
      sdkVersion: extractSDKVersion(),
    })

    let responseError

    try {
      await keyStorageApiService.storeMyKey(accessToken, { encryptedSeed })
      await keyStorageApiService.storeMyKey(accessToken, { encryptedSeed })
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
  })

  it('#pullEncryptedSeed', async () => {
    const keyManagementService = createKeyManagementService()
    const { accessToken } = await userManagementService.logInWithPassword(cognitoUsername, cognitoPassword)
    const { encryptedSeed } = await keyManagementService.pullKeyAndSeed(accessToken)

    expect(encryptedSeed).to.exist
  })

  it('#pullEncryptedSeed throws exception WHEN key for userId does not exist', async () => {
    const keyManagementService = createKeyManagementService()

    let responseError

    try {
      const { accessToken } = await userManagementService.logInWithPassword(nonExistingUser, cognitoPassword)
      await keyManagementService.pullKeyAndSeed(accessToken)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
  })

  it.skip('#storeEncryptedSeed throws exception WHEN userId does not exists', async () => {
    const { accessToken } = await userManagementService.logInWithPassword(nonExistingUser, cognitoPassword)

    const keyStorageApiService = new KeyStorageApiService({
      keyStorageUrl: options.keyStorageUrl,
      accessApiKey: options.accessApiKey,
      sdkVersion: extractSDKVersion(),
    })

    let responseError

    try {
      await keyStorageApiService.storeMyKey(accessToken, { encryptedSeed })
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.exist
  })

  it('#adminDeleteUnconfirmedUser', async () => {
    const email = 'different_test_user_to_delete@example.com'

    await userManagementService.initiateSignUpWithEmailOrPhone(email, password, null)
    const keyStorageApiService = new KeyStorageApiService({
      keyStorageUrl: options.keyStorageUrl,
      accessApiKey: options.accessApiKey,
      sdkVersion: extractSDKVersion(),
    })
    await keyStorageApiService.adminDeleteUnconfirmedUser({ username: normalizeUsername(email) })
    let responseError

    try {
      await userManagementService.logInWithPassword(email, password)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-4')
    expect(httpStatusCode).to.equal(404)
  })

  it('#adminConfirmUser throws `WAL-3 / 409` when user already confirmed', async () => {
    let responseError

    try {
      const keyStorageApiService = new KeyStorageApiService({
        keyStorageUrl: options.keyStorageUrl,
        accessApiKey: options.accessApiKey,
        sdkVersion: extractSDKVersion(),
      })
      await keyStorageApiService.adminConfirmUser({ username: cognitoUsername })
    } catch (error) {
      responseError = error
    }

    const {
      code,
      originalError: { httpStatusCode },
    } = responseError

    expect(code).to.equal('WAL-3')
    expect(httpStatusCode).to.eql(409)
  })

  it('#adminDeleteUnconfirmedUser throws `WAL-3 / 409` when user already confirmed', async () => {
    let responseError

    try {
      const keyStorageApiService = new KeyStorageApiService({
        keyStorageUrl: options.keyStorageUrl,
        accessApiKey: options.accessApiKey,
        sdkVersion: extractSDKVersion(),
      })
      await keyStorageApiService.adminDeleteUnconfirmedUser({ username: cognitoUsername })
    } catch (error) {
      responseError = error
    }

    const {
      code,
      originalError: { httpStatusCode },
    } = responseError

    expect(code).to.equal('WAL-3')
    expect(httpStatusCode).to.eql(409)
  })

  it('#getCredentialOffer', async () => {
    const { idToken } = await userManagementService.logInWithPassword(cognitoUsername, cognitoPassword)

    const offerToken = await WalletStorageService.getCredentialOffer(idToken, keyStorageUrl, options)

    const decoded = jwtDecode(offerToken, { complete: true })

    expect(offerToken).to.exist

    if (typeof decoded === 'string') {
      throw Error
    }

    expect(decoded.payload.interactionToken.offeredCredentials[0].type).to.equal('EmailCredentialPersonV1')
  })

  it('#getSignedCredential', async () => {
    const keyManagementService = createKeyManagementService()

    const { accessToken, idToken } = await userManagementService.logInWithPassword(cognitoUsername, cognitoPassword)
    const offerToken = await WalletStorageService.getCredentialOffer(idToken, keyStorageUrl, options)
    const { encryptedSeed, encryptionKey } = await keyManagementService.pullKeyAndSeed(accessToken)
    const networkMember = new CommonNetworkMember(encryptionKey, encryptedSeed, options)
    const offerResponse = await networkMember.createCredentialOfferResponseToken(offerToken)
    const signedCredentials = await WalletStorageService.getSignedCredentials(idToken, offerResponse, options)

    expect(signedCredentials).to.exist
  })
})
