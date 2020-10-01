'use strict'

import { expect } from 'chai'
import * as jwt from 'jsonwebtoken'
import { Affinity } from '@affinidi/common'
import { buildVCV1Unsigned, buildVCV1Skeleton } from '@affinidi/vc-common'
import { VCSPhonePersonV1, getVCPhonePersonV1Context } from '@affinidi/vc-data'
import { CommonNetworkMember } from '../../src/CommonNetworkMember'
import CognitoService from '../../src/services/CognitoService'

const { TEST_SECRETS } = process.env
const {
  PASSWORD,
  COGNITO_PASSWORD,
  COGNITO_USERNAME,
  COGNITO_PHONE_NUMBER,
  COGNITO_USERNAME_NO_KEY,
  COGNITO_USERNAME_UNCONFIRMED,
  COGNITO_USERNAME_EXISTS,
  ENCRYPTED_SEED_JOLO,
  ENCRYPTED_SEED_ELEM,
  DID_ELEM_SHORT,
  DID_ELEM_PARAMS,
  DID_JOLO,
  ISSUER_ENCRYPTED_SEED,
  HOLDER_PASSWORD,
  HOLDER_ENCRYPTED_SEED,
  UPDATING_ENCRYPTED_SEED,
  UPDATING_DID,
} = JSON.parse(TEST_SECRETS)
const password = PASSWORD
const encryptedSeed = ENCRYPTED_SEED_JOLO
const encryptedSeedElem = ENCRYPTED_SEED_ELEM
const didElemShort = DID_ELEM_SHORT
const didElem = `${didElemShort};${DID_ELEM_PARAMS}`
const seedDid = DID_JOLO

const elemDidMethod = 'elem'
const joloDidMethod = 'jolo'

const phoneNumber = COGNITO_PHONE_NUMBER

const cognitoUsername = COGNITO_USERNAME
const cognitoPassword = COGNITO_PASSWORD

const userWithoutKey = COGNITO_USERNAME_NO_KEY
const emailUnconfirmed = COGNITO_USERNAME_UNCONFIRMED

import { SdkOptions } from '../../src/dto/shared.dto'

import { getOptionsForEnvironment } from '../helpers/getOptionsForEnvironment'
import { generateUsername } from '../helpers/generateUsername'

// test agains `dev | prod` // if nothing specified, staging is used by default
const options: SdkOptions = getOptionsForEnvironment()

describe('CommonNetworkMember', () => {
  const callbackUrl = 'https://kudos-issuer-backend.affinity-project.org/kudos_offering/'

  const offeredCredentials = [
    {
      type: 'TestDenisCred',
    },
  ]

  const credentialRequirements = [
    {
      type: ['Credential', 'TestDenisCred'],
    },
  ]

  it('#throws `COR-4 / 400` when UNCONFIRMED user signs in', async () => {
    const username = emailUnconfirmed

    await CommonNetworkMember.signUp(username, cognitoPassword, options)

    let responseError

    try {
      await CommonNetworkMember.fromLoginAndPassword(username, cognitoPassword, options)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode, context } = responseError

    expect(code).to.equal('COR-4')
    expect(httpStatusCode).to.equal(404)
    expect(context.username).to.equal(username)
  })

  // This started failing with this error: LimitExceededException: Attempt limit exceeded, please try after some time.
  // Also it's not clear how this tests the resending of the OTP.
  it('resends OTP when UNCONFIRMED user signs up (for the Nth time)', async () => {
    const username = emailUnconfirmed

    await CommonNetworkMember.signUp(username, cognitoPassword)

    const token = await CommonNetworkMember.signUp(username, cognitoPassword)

    expect(token).to.equal(`${username}::${cognitoPassword}`)
  })

  it('.register (default did method)', async () => {
    const { did, encryptedSeed } = await CommonNetworkMember.register(password)

    expect(did).to.exist
    expect(encryptedSeed).to.exist
  })

  it('.register (elem did method)', async () => {
    const { did, encryptedSeed } = await CommonNetworkMember.register(password, { didMethod: elemDidMethod })

    expect(did).to.exist
    expect(encryptedSeed).to.exist
    const [, didMethod] = did.split(':')
    expect(didMethod).to.be.equal(elemDidMethod)
  })

  it('.register (jolo did method)', async () => {
    const { did, encryptedSeed } = await CommonNetworkMember.register(password, { didMethod: joloDidMethod })

    expect(did).to.exist
    expect(encryptedSeed).to.exist
    const [, didMethod] = did.split(':')
    expect(didMethod).to.be.equal(joloDidMethod)
  })

  it('#resolveDid', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const didDocument = await commonNetworkMember.resolveDid(seedDid)

    expect(didDocument).to.exist

    expect(didDocument.id).to.be.equal(seedDid)
  })

  it('#resolveDid throws `COR-1 / 400` invalid operation parameter passed (empty string)', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.resolveDid('')
    } catch (error) {
      responseError = error
    }

    const { code, message, httpStatusCode } = responseError

    expect(code).to.equal('COR-1')
    expect(httpStatusCode).to.equal(400)
    expect(message).to.equal('Invalid operation parameters.')
  })

  it('#resolveDid throws `REG-1 / 404` if seed not found', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    const badSeed = 'did:jolo:non_existing_seed'

    try {
      await commonNetworkMember.resolveDid(badSeed)
    } catch (error) {
      responseError = error
    }

    const { code, message, httpStatusCode } = responseError

    expect(code).to.equal('REG-1')
    expect(httpStatusCode).to.equal(404)
    expect(message).to.equal('Requested did:jolo:non_existing_seed not exists at the ledger.')
  })

  it('#resolveDid ignores extra parameter', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const didDocument = await commonNetworkMember.resolveDid(seedDid, '123')

    expect(didDocument).to.exist

    expect(didDocument.id).to.be.equal(seedDid)
  })

  it('#resolveDid (elem)', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeedElem, { didMethod: elemDidMethod })
    const didDocument = await commonNetworkMember.resolveDid(didElem)

    expect(didDocument).to.exist
    expect(didDocument.id).to.be.equal(didElemShort)
  })

  it('.updateDidDocument (jolo did method)', async () => {
    const updatingEncryoptedSeed = UPDATING_ENCRYPTED_SEED
    const updatingDid = UPDATING_DID

    expect(updatingDid).to.exist
    expect(updatingEncryoptedSeed).to.exist
    const [, didMethod] = updatingDid.split(':')
    expect(didMethod).to.be.equal(joloDidMethod)

    // TODO: when registry with conuntTransaction ednpoiont will be at staging - change to default env
    const commonNetworkMember = new CommonNetworkMember(password, updatingEncryoptedSeed, { env: 'dev' })
    const didDocument = await commonNetworkMember.resolveDid(updatingDid)

    const { authentication } = didDocument
    const keyId = authentication[0]
    const keyNumber = Number(keyId.split('-')[1])
    const updatedAuthentication = [`${updatingDid}#keys-${keyNumber + 1}`]
    didDocument.authentication = updatedAuthentication
    await commonNetworkMember.updateDidDocument(didDocument)

    const updatedDidDocument = await commonNetworkMember.resolveDid(updatingDid)
    expect(updatedDidDocument.authentication).to.be.deep.equal(updatedAuthentication)
  })

  it('#buildRevocationListStatus, #revokeCredential', async () => {
    const accessToken = 'token'
    const credId = new Date().toISOString()
    const unsignedCredential = buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
        id: `credId_${credId}`,
        credentialSubject: {
          data: {
            '@type': ['Person', 'PersonE', 'PhonePerson'],
            telephone: '+1 555 555 5555',
          },
        },
        holder: { id: 'placeholder' },
        type: 'PhoneCredentialPersonV1',
        context: getVCPhonePersonV1Context(),
      }),
      issuanceDate: new Date().toISOString(),
      expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
    })

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeedElem)
    const revokableUnsignedCredential = await commonNetworkMember.buildRevocationListStatus(
      unsignedCredential,
      accessToken,
    )

    expect(revokableUnsignedCredential.credentialStatus).to.exist

    let revocationError
    try {
      await commonNetworkMember.revokeCredential(revokableUnsignedCredential.id, 'Status changed', accessToken)
    } catch (error) {
      revocationError = error
    }

    expect(revocationError).to.not.exist
  })

  it('#register and #signUpWithExistsEntity (userName is arbitrary) and #fromLoginAndPassword', async () => {
    const { did, encryptedSeed } = await CommonNetworkMember.register(password, options)
    const keyParams = { encryptedSeed, password }
    const username = did

    const affinityWallet = await CommonNetworkMember.signUpWithExistsEntity(
      keyParams,
      username,
      cognitoPassword,
      options,
    )
    const walletShortDid = affinityWallet.did.split(';elem:')[0]
    expect(walletShortDid).to.equal(did)

    const affinityWalletAfterLogin = await CommonNetworkMember.fromLoginAndPassword(username, cognitoPassword, options)
    const walletAfterLoginShortDid = affinityWalletAfterLogin.did.split(';elem:')[0]
    expect(walletAfterLoginShortDid).to.equal(did)
  })

  it('#register and #signUpWithExistsEntity (userName is arbitrary with week password) and #fromLoginAndPassword', async () => {
    const userPassword = '092376'
    const { did, encryptedSeed } = await CommonNetworkMember.register(password, options)
    const keyParams = { encryptedSeed, password }
    const username = did

    const affinityWallet = await CommonNetworkMember.signUpWithExistsEntity(keyParams, username, userPassword, options)
    const walletShortDid = affinityWallet.did.split(';elem:')[0]
    expect(walletShortDid).to.equal(did)

    const affinityWalletAfterLogin = await CommonNetworkMember.fromLoginAndPassword(username, userPassword, options)
    const walletAfterLoginShortDid = affinityWalletAfterLogin.did.split(';elem:')[0]
    expect(walletAfterLoginShortDid).to.equal(did)
  })

  it('#generateCredentialOfferRequestToken', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const token = await commonNetworkMember.generateCredentialOfferRequestToken(offeredCredentials, { callbackUrl })

    expect(token).to.exist

    const commonNetworkMemberElem = new CommonNetworkMember(password, encryptedSeedElem, options)
    const tokenElem = await commonNetworkMemberElem.generateCredentialOfferRequestToken(offeredCredentials, {
      callbackUrl,
    })

    const jwtObject = CommonNetworkMember.fromJWT(tokenElem)

    const {
      payload: { interactionToken, iss, typ },
      signature,
    } = jwtObject
    const { offeredCredentials: credentials, callbackURL: url } = interactionToken

    expect(iss).to.exist
    expect(signature).to.exist
    expect(typ).to.equal('credentialOfferRequest')
    expect(offeredCredentials).to.deep.equal(credentials)
    expect(callbackUrl).to.equal(url)
  })

  it('#generateCredentialOfferRequestToken with JwtOptions', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const commonNetworkMemberElem = new CommonNetworkMember(password, encryptedSeedElem, options)

    const customExpiresAt = '2022-04-15T00:00:00.000Z'
    const customNonce = '123123123'
    const audienceDid = seedDid
    const jwtOptions = { audienceDid, expiresAt: customExpiresAt, nonce: customNonce, callbackUrl }

    const token = await commonNetworkMember.generateCredentialOfferRequestToken(offeredCredentials, jwtOptions)
    expect(token).to.exist

    const tokenObject = CommonNetworkMember.fromJWT(token)
    const { payload } = tokenObject
    expect(payload.aud).to.be.equal(audienceDid)
    expect(payload.jti).to.be.equal(customNonce)
    expect(payload.exp).to.be.equal(new Date(customExpiresAt).getTime())

    const tokenElem = await commonNetworkMemberElem.generateCredentialOfferRequestToken(offeredCredentials, jwtOptions)
    expect(tokenElem).to.exist
  })

  it('#generateCredentialOfferRequestToken throws `COM-5 / 500` when expiration date is the past', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    // const commonNetworkMemberElem = new CommonNetworkMember(password, encryptedSeedElem, options)

    const customExpiresAt = '2020-01-01T00:00:00.000Z'
    const jwtOptions = { expiresAt: customExpiresAt }

    let responseError

    try {
      await commonNetworkMember.generateCredentialOfferRequestToken(offeredCredentials, jwtOptions)
    } catch (error) {
      responseError = error
    }

    const { code, message, httpStatusCode } = responseError

    expect(code).to.equal('COM-5')
    expect(message).to.equal('ExpiresAt parameter should be in future.')
    expect(httpStatusCode).to.equal(500)
  })

  it('#generateCredentialOfferRequestToken throws `COR-1 / 400` when bad parameters passed', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await commonNetworkMember.generateCredentialOfferRequestToken(callbackUrl)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-1')
    expect(httpStatusCode).to.equal(400)
  })

  it('#generateCredentialShareRequestToken', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const issuerDid = seedDid
    const token = await commonNetworkMember.generateCredentialShareRequestToken(credentialRequirements, issuerDid, {
      callbackUrl,
    })

    expect(token).to.exist
  })

  it('#generateCredentialShareRequestToken when issuerDid not passed', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const token = await commonNetworkMember.generateCredentialShareRequestToken(credentialRequirements, undefined, {
      callbackUrl,
    })

    expect(token).to.exist
  })

  it('#generateCredentialShareRequestToken with jwtOptions', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const issuerDid = seedDid
    const customExpiresAt = '2022-04-15T00:00:00.000Z'
    const customNonce = '123123123'
    const audienceDid = 'did:jolo:testDID123'
    const jwtOptions = { audienceDid, expiresAt: customExpiresAt, nonce: customNonce, callbackUrl }

    const token = await commonNetworkMember.generateCredentialShareRequestToken(
      credentialRequirements,
      issuerDid,
      jwtOptions,
    )
    expect(token).to.exist

    const tokenObject = CommonNetworkMember.fromJWT(token)
    const { payload } = tokenObject

    expect(payload.aud).to.be.equal(audienceDid)
    expect(payload.jti).to.be.equal(customNonce)
    expect(payload.exp).to.be.equal(new Date(customExpiresAt).getTime())
  })

  it('#verifyCredentialShareResponseToken', async () => {
    const credentialShareResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJzdXBwbGllZENyZWRlbnRpYWxzIjpbeyJAY29udGV4dCI6W3siaWQiOiJAaWQiLCJ0eXBlIjoiQHR5cGUiLCJjcmVkIjoiaHR0cHM6Ly93M2lkLm9yZy9jcmVkZW50aWFscyMiLCJzY2hlbWEiOiJodHRwOi8vc2NoZW1hLm9yZy8iLCJkYyI6Imh0dHA6Ly9wdXJsLm9yZy9kYy90ZXJtcy8iLCJ4c2QiOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSMiLCJzZWMiOiJodHRwczovL3czaWQub3JnL3NlY3VyaXR5IyIsIkNyZWRlbnRpYWwiOiJjcmVkOkNyZWRlbnRpYWwiLCJpc3N1ZXIiOnsiQGlkIjoiY3JlZDppc3N1ZXIiLCJAdHlwZSI6IkBpZCJ9LCJpc3N1ZWQiOnsiQGlkIjoiY3JlZDppc3N1ZWQiLCJAdHlwZSI6InhzZDpkYXRlVGltZSJ9LCJjbGFpbSI6eyJAaWQiOiJjcmVkOmNsYWltIiwiQHR5cGUiOiJAaWQifSwiY3JlZGVudGlhbCI6eyJAaWQiOiJjcmVkOmNyZWRlbnRpYWwiLCJAdHlwZSI6IkBpZCJ9LCJleHBpcmVzIjp7IkBpZCI6InNlYzpleHBpcmF0aW9uIiwiQHR5cGUiOiJ4c2Q6ZGF0ZVRpbWUifSwicHJvb2YiOnsiQGlkIjoic2VjOnByb29mIiwiQHR5cGUiOiJAaWQifSwiRWNkc2FLb2JsaXR6U2lnbmF0dXJlMjAxNiI6InNlYzpFY2RzYUtvYmxpdHpTaWduYXR1cmUyMDE2IiwiY3JlYXRlZCI6eyJAaWQiOiJkYzpjcmVhdGVkIiwiQHR5cGUiOiJ4c2Q6ZGF0ZVRpbWUifSwiY3JlYXRvciI6eyJAaWQiOiJkYzpjcmVhdG9yIiwiQHR5cGUiOiJAaWQifSwiZG9tYWluIjoic2VjOmRvbWFpbiIsIm5vbmNlIjoic2VjOm5vbmNlIiwic2lnbmF0dXJlVmFsdWUiOiJzZWM6c2lnbmF0dXJlVmFsdWUifSx7IlByb29mT2ZOYW1lQ3JlZGVudGlhbCI6Imh0dHBzOi8vaWRlbnRpdHkuam9sb2NvbS5jb20vdGVybXMvUHJvb2ZPZk5hbWVDcmVkZW50aWFsIiwic2NoZW1hIjoiaHR0cDovL3NjaGVtYS5vcmcvIiwiZmFtaWx5TmFtZSI6InNjaGVtYTpmYW1pbHlOYW1lIiwiZ2l2ZW5OYW1lIjoic2NoZW1hOmdpdmVuTmFtZSJ9XSwiaWQiOiJjbGFpbUlkOjYzYjVkMTFjMGQxYjU1NjYiLCJpc3N1ZXIiOiJkaWQ6am9sbzo2ZGY2ZmQ0YTg3NmRjZDM3NWZiYzVkNjMwZTY0ZTc1MjlmMjdlOTYxMmFlY2JiYmYzMjEzODYxYTJiMGI3ZTlkIiwiaXNzdWVkIjoiMjAyMC0wMS0xN1QwNzowNjozNS40MDNaIiwidHlwZSI6WyJDcmVkZW50aWFsIiwiUHJvb2ZPZk5hbWVDcmVkZW50aWFsIl0sImV4cGlyZXMiOiIyMDIxLTAxLTE2VDA3OjA2OjM1LjMzN1oiLCJwcm9vZiI6eyJjcmVhdGVkIjoiMjAyMC0wMS0xN1QwNzowNjozNS40MDJaIiwidHlwZSI6IkVjZHNhS29ibGl0elNpZ25hdHVyZTIwMTYiLCJub25jZSI6ImNmODJmMWI0NDg1MTQyMjkiLCJzaWduYXR1cmVWYWx1ZSI6Ijg2NjE5MWViM2Y3YTg3MWI1OWQwYzY2NWVkOGE0YzNiNzk5MTI0YWE1NGU5ZmFmN2QyMTYzNDg2ZmQxNDZjMTQwNDdkM2Q0YTY4ODA1NmQ0YzZkMGFkMjIxMTcwYWY1NTU2MWQ4N2I4NzJlNDI4ZDMwYjVjMWZhOGZmZDI3ZjgzIiwiY3JlYXRvciI6ImRpZDpqb2xvOjZkZjZmZDRhODc2ZGNkMzc1ZmJjNWQ2MzBlNjRlNzUyOWYyN2U5NjEyYWVjYmJiZjMyMTM4NjFhMmIwYjdlOWQja2V5cy0xIn0sImNsYWltIjp7ImdpdmVuTmFtZSI6IkRlbmlzVXBkYXRlZCIsImZhbWlseU5hbWUiOiJQb3BvdiIsImlkIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCJ9LCJuYW1lIjoiTmFtZSJ9XX0sImV4cCI6MTYxMzAyMjk0MDQ1NCwidHlwIjoiY3JlZGVudGlhbFJlc3BvbnNlIiwiYXVkIjoiZGlkOmpvbG86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk3YWQ0MzA4YTRhNjg2ZjhlZGE3MDlmMzM4N2QzMDNlNiIsImp0aSI6IjQ5MjY1NzJlNjM1NGZiMTgiLCJpc3MiOiJkaWQ6am9sbzpmNTU5MjY1YjZjMWJlY2Q1NjEwOWM1NjIzNDM1ZmE3OTdhZDQzMDhhNGE2ODZmOGVkYTcwOWYzMzg3ZDMwM2U2I2tleXMtMSJ9.e983e5f6e162482b847dc7e843f132198c3a1fb7a23324d659bb122acd4feccb300a07dd528862c21b12afff1469cf393f58c1d8c3c121274165dc2425a66367'
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const { isValid, suppliedCredentials } = await commonNetworkMember.verifyCredentialShareResponseToken(
      credentialShareResponseToken,
      undefined,
      false,
    )

    expect(isValid).to.equal(true)
    expect(suppliedCredentials).to.exist
  })

  it('#verifyCredentialShareResponseToken function to pull request token passed', async () => {
    const credentialShareRequestToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJjb25zdHJhaW50cyI6W119XSwiY2FsbGJhY2tVUkwiOiJodHRwczovL2t1ZG9zLWlzc3Vlci1iYWNrZW5kLmFmZmluaXR5LXByb2plY3Qub3JnL3JlY2VpdmUvdGVzdGVyQmFkZ2UifSwiZXhwIjoxNjIxMDczMTg3MTc2LCJ0eXAiOiJjcmVkZW50aWFsUmVxdWVzdCIsImp0aSI6ImFhMzc2Y2M3OWQwYzMyNTkiLCJpc3MiOiJkaWQ6am9sbzo4YzMxMTcxMzViNjg5MmY0ZWE1ZDA1ZWMwYzI3NzhjM2RiNGQ5M2Q0YjI0YzQ5OTE2MDgzMWVmOTc0YWRmM2VmI2tleXMtMSJ9.613973e47018d0b6b8e52d4d93fd6721bd863502edd8a8d251a0faec34c27e2f613c95a5662a27b360f8424544b520804cf67e17395adff1b609c559cf6a319c'
    const credentialShareResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic3VwcGxpZWRDcmVkZW50aWFscyI6W3siQGNvbnRleHQiOlt7ImlkIjoiQGlkIiwidHlwZSI6IkB0eXBlIiwiY3JlZCI6Imh0dHBzOi8vdzNpZC5vcmcvY3JlZGVudGlhbHMjIiwic2NoZW1hIjoiaHR0cDovL3NjaGVtYS5vcmcvIiwiZGMiOiJodHRwOi8vcHVybC5vcmcvZGMvdGVybXMvIiwieHNkIjoiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjIiwic2VjIjoiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eSMiLCJDcmVkZW50aWFsIjoiY3JlZDpDcmVkZW50aWFsIiwiaXNzdWVyIjp7IkBpZCI6ImNyZWQ6aXNzdWVyIiwiQHR5cGUiOiJAaWQifSwiaXNzdWVkIjp7IkBpZCI6ImNyZWQ6aXNzdWVkIiwiQHR5cGUiOiJ4c2Q6ZGF0ZVRpbWUifSwiY2xhaW0iOnsiQGlkIjoiY3JlZDpjbGFpbSIsIkB0eXBlIjoiQGlkIn0sImNyZWRlbnRpYWwiOnsiQGlkIjoiY3JlZDpjcmVkZW50aWFsIiwiQHR5cGUiOiJAaWQifSwiZXhwaXJlcyI6eyJAaWQiOiJzZWM6ZXhwaXJhdGlvbiIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sInByb29mIjp7IkBpZCI6InNlYzpwcm9vZiIsIkB0eXBlIjoiQGlkIn0sIkVjZHNhS29ibGl0elNpZ25hdHVyZTIwMTYiOiJzZWM6RWNkc2FLb2JsaXR6U2lnbmF0dXJlMjAxNiIsImNyZWF0ZWQiOnsiQGlkIjoiZGM6Y3JlYXRlZCIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sImNyZWF0b3IiOnsiQGlkIjoiZGM6Y3JlYXRvciIsIkB0eXBlIjoiQGlkIn0sImRvbWFpbiI6InNlYzpkb21haW4iLCJub25jZSI6InNlYzpub25jZSIsInNpZ25hdHVyZVZhbHVlIjoic2VjOnNpZ25hdHVyZVZhbHVlIn0seyJQcm9vZk9mTmFtZUNyZWRlbnRpYWwiOiJodHRwczovL2lkZW50aXR5LmpvbG9jb20uY29tL3Rlcm1zL1Byb29mT2ZOYW1lQ3JlZGVudGlhbCIsInNjaGVtYSI6Imh0dHA6Ly9zY2hlbWEub3JnLyIsImZhbWlseU5hbWUiOiJzY2hlbWE6ZmFtaWx5TmFtZSIsImdpdmVuTmFtZSI6InNjaGVtYTpnaXZlbk5hbWUifV0sImlkIjoiY2xhaW1JZDo2M2I1ZDExYzBkMWI1NTY2IiwiaXNzdWVyIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCIsImlzc3VlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAzWiIsInR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJleHBpcmVzIjoiMjAyMS0wMS0xNlQwNzowNjozNS4zMzdaIiwicHJvb2YiOnsiY3JlYXRlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAyWiIsInR5cGUiOiJFY2RzYUtvYmxpdHpTaWduYXR1cmUyMDE2Iiwibm9uY2UiOiJjZjgyZjFiNDQ4NTE0MjI5Iiwic2lnbmF0dXJlVmFsdWUiOiI4NjYxOTFlYjNmN2E4NzFiNTlkMGM2NjVlZDhhNGMzYjc5OTEyNGFhNTRlOWZhZjdkMjE2MzQ4NmZkMTQ2YzE0MDQ3ZDNkNGE2ODgwNTZkNGM2ZDBhZDIyMTE3MGFmNTU1NjFkODdiODcyZTQyOGQzMGI1YzFmYThmZmQyN2Y4MyIsImNyZWF0b3IiOiJkaWQ6am9sbzo2ZGY2ZmQ0YTg3NmRjZDM3NWZiYzVkNjMwZTY0ZTc1MjlmMjdlOTYxMmFlY2JiYmYzMjEzODYxYTJiMGI3ZTlkI2tleXMtMSJ9LCJjbGFpbSI6eyJnaXZlbk5hbWUiOiJEZW5pc1VwZGF0ZWQiLCJmYW1pbHlOYW1lIjoiUG9wb3YiLCJpZCI6ImRpZDpqb2xvOjZkZjZmZDRhODc2ZGNkMzc1ZmJjNWQ2MzBlNjRlNzUyOWYyN2U5NjEyYWVjYmJiZjMyMTM4NjFhMmIwYjdlOWQifSwibmFtZSI6Ik5hbWUifV19LCJleHAiOjE2MjEwNzMxODc5OTIsInR5cCI6ImNyZWRlbnRpYWxSZXNwb25zZSIsImF1ZCI6ImRpZDpqb2xvOjhjMzExNzEzNWI2ODkyZjRlYTVkMDVlYzBjMjc3OGMzZGI0ZDkzZDRiMjRjNDk5MTYwODMxZWY5NzRhZGYzZWYiLCJqdGkiOiJhYTM3NmNjNzlkMGMzMjU5IiwiaXNzIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCNrZXlzLTEifQ.c483e3b589c82f96f65c8bd3e356979743968b965f01be1f2ca67b76283000065ba37893dd267d85d86adb60ae60fcd23ef1c06bd1efbceab5816bd261103b5b'

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    const pullFunction = () => {
      return credentialShareRequestToken
    }
    const { isValid, suppliedCredentials } = await commonNetworkMember.verifyCredentialShareResponseToken(
      credentialShareResponseToken,
      pullFunction,
      true,
    )

    expect(isValid).to.equal(true)
    expect(suppliedCredentials).to.exist
  })

  it('#verifyCredentialShareResponseToken function to pull request token passed and its not returned JWT', async () => {
    const credentialShareResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic3VwcGxpZWRDcmVkZW50aWFscyI6W3siQGNvbnRleHQiOlt7ImlkIjoiQGlkIiwidHlwZSI6IkB0eXBlIiwiY3JlZCI6Imh0dHBzOi8vdzNpZC5vcmcvY3JlZGVudGlhbHMjIiwic2NoZW1hIjoiaHR0cDovL3NjaGVtYS5vcmcvIiwiZGMiOiJodHRwOi8vcHVybC5vcmcvZGMvdGVybXMvIiwieHNkIjoiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjIiwic2VjIjoiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eSMiLCJDcmVkZW50aWFsIjoiY3JlZDpDcmVkZW50aWFsIiwiaXNzdWVyIjp7IkBpZCI6ImNyZWQ6aXNzdWVyIiwiQHR5cGUiOiJAaWQifSwiaXNzdWVkIjp7IkBpZCI6ImNyZWQ6aXNzdWVkIiwiQHR5cGUiOiJ4c2Q6ZGF0ZVRpbWUifSwiY2xhaW0iOnsiQGlkIjoiY3JlZDpjbGFpbSIsIkB0eXBlIjoiQGlkIn0sImNyZWRlbnRpYWwiOnsiQGlkIjoiY3JlZDpjcmVkZW50aWFsIiwiQHR5cGUiOiJAaWQifSwiZXhwaXJlcyI6eyJAaWQiOiJzZWM6ZXhwaXJhdGlvbiIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sInByb29mIjp7IkBpZCI6InNlYzpwcm9vZiIsIkB0eXBlIjoiQGlkIn0sIkVjZHNhS29ibGl0elNpZ25hdHVyZTIwMTYiOiJzZWM6RWNkc2FLb2JsaXR6U2lnbmF0dXJlMjAxNiIsImNyZWF0ZWQiOnsiQGlkIjoiZGM6Y3JlYXRlZCIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sImNyZWF0b3IiOnsiQGlkIjoiZGM6Y3JlYXRvciIsIkB0eXBlIjoiQGlkIn0sImRvbWFpbiI6InNlYzpkb21haW4iLCJub25jZSI6InNlYzpub25jZSIsInNpZ25hdHVyZVZhbHVlIjoic2VjOnNpZ25hdHVyZVZhbHVlIn0seyJQcm9vZk9mTmFtZUNyZWRlbnRpYWwiOiJodHRwczovL2lkZW50aXR5LmpvbG9jb20uY29tL3Rlcm1zL1Byb29mT2ZOYW1lQ3JlZGVudGlhbCIsInNjaGVtYSI6Imh0dHA6Ly9zY2hlbWEub3JnLyIsImZhbWlseU5hbWUiOiJzY2hlbWE6ZmFtaWx5TmFtZSIsImdpdmVuTmFtZSI6InNjaGVtYTpnaXZlbk5hbWUifV0sImlkIjoiY2xhaW1JZDo2M2I1ZDExYzBkMWI1NTY2IiwiaXNzdWVyIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCIsImlzc3VlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAzWiIsInR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJleHBpcmVzIjoiMjAyMS0wMS0xNlQwNzowNjozNS4zMzdaIiwicHJvb2YiOnsiY3JlYXRlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAyWiIsInR5cGUiOiJFY2RzYUtvYmxpdHpTaWduYXR1cmUyMDE2Iiwibm9uY2UiOiJjZjgyZjFiNDQ4NTE0MjI5Iiwic2lnbmF0dXJlVmFsdWUiOiI4NjYxOTFlYjNmN2E4NzFiNTlkMGM2NjVlZDhhNGMzYjc5OTEyNGFhNTRlOWZhZjdkMjE2MzQ4NmZkMTQ2YzE0MDQ3ZDNkNGE2ODgwNTZkNGM2ZDBhZDIyMTE3MGFmNTU1NjFkODdiODcyZTQyOGQzMGI1YzFmYThmZmQyN2Y4MyIsImNyZWF0b3IiOiJkaWQ6am9sbzo2ZGY2ZmQ0YTg3NmRjZDM3NWZiYzVkNjMwZTY0ZTc1MjlmMjdlOTYxMmFlY2JiYmYzMjEzODYxYTJiMGI3ZTlkI2tleXMtMSJ9LCJjbGFpbSI6eyJnaXZlbk5hbWUiOiJEZW5pc1VwZGF0ZWQiLCJmYW1pbHlOYW1lIjoiUG9wb3YiLCJpZCI6ImRpZDpqb2xvOjZkZjZmZDRhODc2ZGNkMzc1ZmJjNWQ2MzBlNjRlNzUyOWYyN2U5NjEyYWVjYmJiZjMyMTM4NjFhMmIwYjdlOWQifSwibmFtZSI6Ik5hbWUifV19LCJleHAiOjE2MjEwNzMxODc5OTIsInR5cCI6ImNyZWRlbnRpYWxSZXNwb25zZSIsImF1ZCI6ImRpZDpqb2xvOjhjMzExNzEzNWI2ODkyZjRlYTVkMDVlYzBjMjc3OGMzZGI0ZDkzZDRiMjRjNDk5MTYwODMxZWY5NzRhZGYzZWYiLCJqdGkiOiJhYTM3NmNjNzlkMGMzMjU5IiwiaXNzIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCNrZXlzLTEifQ.c483e3b589c82f96f65c8bd3e356979743968b965f01be1f2ca67b76283000065ba37893dd267d85d86adb60ae60fcd23ef1c06bd1efbceab5816bd261103b5b'

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    const pullFunction = () => {
      return ''
    }
    let validationError
    try {
      await commonNetworkMember.verifyCredentialShareResponseToken(credentialShareResponseToken, pullFunction)
    } catch (error) {
      validationError = error
    }

    expect(validationError).to.exist
    expect(validationError.code).to.be.equal('COR-15')
  })

  it('#verifyCredentialShareResponseToken throws `COR-1 / 400` when bad parameters passed', async () => {
    const credentialShareResponseToken = 123
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await commonNetworkMember.verifyCredentialShareResponseToken(credentialShareResponseToken)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-1')
    expect(httpStatusCode).to.equal(400)
  })

  it('#verifyCredentialShareResponseToken throws `COR-19 / 400` when token is expired', async () => {
    const credentialShareResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7InN1cHBsaWVkQ3JlZGVudGlhbHMiOlt7IkBjb250ZXh0IjpbeyJpZCI6IkBpZCIsInR5cGUiOiJAdHlwZSIsImNyZWQiOiJodHRwczovL3czaWQub3JnL2NyZWRlbnRpYWxzIyIsInNjaGVtYSI6Imh0dHA6Ly9zY2hlbWEub3JnLyIsImRjIjoiaHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLyIsInhzZCI6Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIyIsInNlYyI6Imh0dHBzOi8vdzNpZC5vcmcvc2VjdXJpdHkjIiwiQ3JlZGVudGlhbCI6ImNyZWQ6Q3JlZGVudGlhbCIsImlzc3VlciI6eyJAaWQiOiJjcmVkOmlzc3VlciIsIkB0eXBlIjoiQGlkIn0sImlzc3VlZCI6eyJAaWQiOiJjcmVkOmlzc3VlZCIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sImNsYWltIjp7IkBpZCI6ImNyZWQ6Y2xhaW0iLCJAdHlwZSI6IkBpZCJ9LCJjcmVkZW50aWFsIjp7IkBpZCI6ImNyZWQ6Y3JlZGVudGlhbCIsIkB0eXBlIjoiQGlkIn0sImV4cGlyZXMiOnsiQGlkIjoic2VjOmV4cGlyYXRpb24iLCJAdHlwZSI6InhzZDpkYXRlVGltZSJ9LCJwcm9vZiI6eyJAaWQiOiJzZWM6cHJvb2YiLCJAdHlwZSI6IkBpZCJ9LCJFY2RzYUtvYmxpdHpTaWduYXR1cmUyMDE2Ijoic2VjOkVjZHNhS29ibGl0elNpZ25hdHVyZTIwMTYiLCJjcmVhdGVkIjp7IkBpZCI6ImRjOmNyZWF0ZWQiLCJAdHlwZSI6InhzZDpkYXRlVGltZSJ9LCJjcmVhdG9yIjp7IkBpZCI6ImRjOmNyZWF0b3IiLCJAdHlwZSI6IkBpZCJ9LCJkb21haW4iOiJzZWM6ZG9tYWluIiwibm9uY2UiOiJzZWM6bm9uY2UiLCJzaWduYXR1cmVWYWx1ZSI6InNlYzpzaWduYXR1cmVWYWx1ZSJ9LHsiUHJvb2ZPZk5hbWVDcmVkZW50aWFsIjoiaHR0cHM6Ly9pZGVudGl0eS5qb2xvY29tLmNvbS90ZXJtcy9Qcm9vZk9mTmFtZUNyZWRlbnRpYWwiLCJzY2hlbWEiOiJodHRwOi8vc2NoZW1hLm9yZy8iLCJmYW1pbHlOYW1lIjoic2NoZW1hOmZhbWlseU5hbWUiLCJnaXZlbk5hbWUiOiJzY2hlbWE6Z2l2ZW5OYW1lIn1dLCJpZCI6ImNsYWltSWQ6MjYwZjMwY2U5MDM3OWExMyIsImlzc3VlciI6ImRpZDpqb2xvOjA4ODE2M2I0MmVjODA4ZjgzOGI4MDY5NGRlODFmYjZiNWRjOTZhMzNkMDg0Yjk4ZWIwMzkyZWE1NDg0MDRmZDciLCJpc3N1ZWQiOiIyMDIwLTAxLTE0VDA3OjI3OjI2LjI3N1oiLCJ0eXBlIjpbIkNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZUNyZWRlbnRpYWwiXSwiZXhwaXJlcyI6IjIwMjEtMDEtMTNUMDc6Mjc6MjYuMjc2WiIsInByb29mIjp7ImNyZWF0ZWQiOiIyMDIwLTAxLTE0VDA3OjI3OjI2LjI3N1oiLCJ0eXBlIjoiRWNkc2FLb2JsaXR6U2lnbmF0dXJlMjAxNiIsIm5vbmNlIjoiZWRlZWRjNzVkMmY3ZTk5OSIsInNpZ25hdHVyZVZhbHVlIjoiZTgwMjk2MTYxZDE2Njk0Mzc5ZjU1YTQ2ZWVlNDgzZDgzZjhhMDkyODQzMzVkYzBmNjlmZjY3YmUwYzkzOGJjYTQ2ZmViMTlmMTA0Yzk4NGEyODViNmFlZmQ4NDUxMTAwODliMGY4NmFmODZjOTY2ZjA1MTg3ODY4ZDVlODQ3ZWUiLCJjcmVhdG9yIjoiZGlkOmpvbG86MDg4MTYzYjQyZWM4MDhmODM4YjgwNjk0ZGU4MWZiNmI1ZGM5NmEzM2QwODRiOThlYjAzOTJlYTU0ODQwNGZkNyNrZXlzLTEifSwiY2xhaW0iOnsiZ2l2ZW5OYW1lIjoiUm9tYW4iLCJmYW1pbHlOYW1lIjoiVGVzdCIsImlkIjoiZGlkOmpvbG86MDg4MTYzYjQyZWM4MDhmODM4YjgwNjk0ZGU4MWZiNmI1ZGM5NmEzM2QwODRiOThlYjAzOTJlYTU0ODQwNGZkNyJ9LCJuYW1lIjoiTmFtZSJ9XSwiY2FsbGJhY2tVUkwiOiJodHRwczovL2t1ZG9zLWlzc3Vlci1iYWNrZW5kLmFmZmluaXR5LXByb2plY3Qub3JnL2t1ZG9zX29mZmVyaW5nLyJ9LCJ0eXAiOiJjcmVkZW50aWFsUmVzcG9uc2UiLCJpYXQiOjE1NzkxNzk3NjMwNjksImV4cCI6MTU3OTE4MzM2MzA2OSwiYXVkIjoiZGlkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmOWY0NjJkMWZjOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjMzNTVjYjYyZDNjMTYiLCJpc3MiOiJkaWQ6am9sbzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0NjljODIwMDdmZmYxM2UwNzY1NjQxI2tleXMtMSJ9.f3dc3a3bc23dcde38409d50962da664e60235b6599af3b749ee12d2b1aed14891ac560dd0a26b89fd7798fffd631fedc5b977cca6abf5a81bcab69c558788ccf'
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.verifyCredentialShareResponseToken(credentialShareResponseToken)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode, message } = responseError

    expect(code).to.equal('COR-19')
    expect(message).to.equal('Token expired')
    expect(httpStatusCode).to.equal(400)
  })

  // TODO: need here update request/response token, response token should be generated with exp in several years
  it.skip('#verifyCredentialShareResponseToken throws `COM-0 / 500` when issuer did does not exist on the ledger', async () => {
    const credentialShareRequestToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJjb25zdHJhaW50cyI6W119XSwiY2FsbGJhY2tVUkwiOiJodHRwczovL2t1ZG9zLWlzc3Vlci1iYWNrZW5kLmFmZmluaXR5LXByb2plY3Qub3JnL3JlY2VpdmUvdGVzdGVyQmFkZ2UifSwiZXhwIjoxNTg5NTM1Mjk3NDI4LCJ0eXAiOiJjcmVkZW50aWFsUmVxdWVzdCIsImp0aSI6IjcwNDU2YTFjOTMyODYzOWEiLCJpc3MiOiJkaWQ6am9sbzo5MTA0Njg1NmIwMjhmYjUyNDMzZjZkZWY2MTcwOWI1YzEyYWMxMzBjNDUwYjJjN2I1Y2I0ZThjM2ZjZjM3NjRhI2tleXMtMSJ9.cf89170160c02f2158e5cf8c80f28488fe291a4373e1dcc5edcaa97896ee678039303c3077f4a5d30b01b89f373c98fa11b6f938261d5495ceee3845c7359fc2'
    const credentialShareResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic3VwcGxpZWRDcmVkZW50aWFscyI6W3siQGNvbnRleHQiOlt7ImlkIjoiQGlkIiwidHlwZSI6IkB0eXBlIiwiY3JlZCI6Imh0dHBzOi8vdzNpZC5vcmcvY3JlZGVudGlhbHMjIiwic2NoZW1hIjoiaHR0cDovL3NjaGVtYS5vcmcvIiwiZGMiOiJodHRwOi8vcHVybC5vcmcvZGMvdGVybXMvIiwieHNkIjoiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjIiwic2VjIjoiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eSMiLCJDcmVkZW50aWFsIjoiY3JlZDpDcmVkZW50aWFsIiwiaXNzdWVyIjp7IkBpZCI6ImNyZWQ6aXNzdWVyIiwiQHR5cGUiOiJAaWQifSwiaXNzdWVkIjp7IkBpZCI6ImNyZWQ6aXNzdWVkIiwiQHR5cGUiOiJ4c2Q6ZGF0ZVRpbWUifSwiY2xhaW0iOnsiQGlkIjoiY3JlZDpjbGFpbSIsIkB0eXBlIjoiQGlkIn0sImNyZWRlbnRpYWwiOnsiQGlkIjoiY3JlZDpjcmVkZW50aWFsIiwiQHR5cGUiOiJAaWQifSwiZXhwaXJlcyI6eyJAaWQiOiJzZWM6ZXhwaXJhdGlvbiIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sInByb29mIjp7IkBpZCI6InNlYzpwcm9vZiIsIkB0eXBlIjoiQGlkIn0sIkVjZHNhS29ibGl0elNpZ25hdHVyZTIwMTYiOiJzZWM6RWNkc2FLb2JsaXR6U2lnbmF0dXJlMjAxNiIsImNyZWF0ZWQiOnsiQGlkIjoiZGM6Y3JlYXRlZCIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sImNyZWF0b3IiOnsiQGlkIjoiZGM6Y3JlYXRvciIsIkB0eXBlIjoiQGlkIn0sImRvbWFpbiI6InNlYzpkb21haW4iLCJub25jZSI6InNlYzpub25jZSIsInNpZ25hdHVyZVZhbHVlIjoic2VjOnNpZ25hdHVyZVZhbHVlIn0seyJQcm9vZk9mTmFtZUNyZWRlbnRpYWwiOiJodHRwczovL2lkZW50aXR5LmpvbG9jb20uY29tL3Rlcm1zL1Byb29mT2ZOYW1lQ3JlZGVudGlhbCIsInNjaGVtYSI6Imh0dHA6Ly9zY2hlbWEub3JnLyIsImZhbWlseU5hbWUiOiJzY2hlbWE6ZmFtaWx5TmFtZSIsImdpdmVuTmFtZSI6InNjaGVtYTpnaXZlbk5hbWUifV0sImlkIjoiY2xhaW1JZDo2M2I1ZDExYzBkMWI1NTY2IiwiaXNzdWVyIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCIsImlzc3VlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAzWiIsInR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJleHBpcmVzIjoiMjAyMS0wMS0xNlQwNzowNjozNS4zMzdaIiwicHJvb2YiOnsiY3JlYXRlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAyWiIsInR5cGUiOiJFY2RzYUtvYmxpdHpTaWduYXR1cmUyMDE2Iiwibm9uY2UiOiJjZjgyZjFiNDQ4NTE0MjI5Iiwic2lnbmF0dXJlVmFsdWUiOiI4NjYxOTFlYjNmN2E4NzFiNTlkMGM2NjVlZDhhNGMzYjc5OTEyNGFhNTRlOWZhZjdkMjE2MzQ4NmZkMTQ2YzE0MDQ3ZDNkNGE2ODgwNTZkNGM2ZDBhZDIyMTE3MGFmNTU1NjFkODdiODcyZTQyOGQzMGI1YzFmYThmZmQyN2Y4MyIsImNyZWF0b3IiOiJkaWQ6am9sbzo2ZGY2ZmQ0YTg3NmRjZDM3NWZiYzVkNjMwZTY0ZTc1MjlmMjdlOTYxMmFlY2JiYmYzMjEzODYxYTJiMGI3ZTlkI2tleXMtMSJ9LCJjbGFpbSI6eyJnaXZlbk5hbWUiOiJEZW5pc1VwZGF0ZWQiLCJmYW1pbHlOYW1lIjoiUG9wb3YiLCJpZCI6ImRpZDpqb2xvOjZkZjZmZDRhODc2ZGNkMzc1ZmJjNWQ2MzBlNjRlNzUyOWYyN2U5NjEyYWVjYmJiZjMyMTM4NjFhMmIwYjdlOWQifSwibmFtZSI6Ik5hbWUifV19LCJleHAiOjE1ODk1MzUyOTgxMzIsInR5cCI6ImNyZWRlbnRpYWxSZXNwb25zZSIsImF1ZCI6ImRpZDpqb2xvOjkxMDQ2ODU2YjAyOGZiNTI0MzNmNmRlZjYxNzA5YjVjMTJhYzEzMGM0NTBiMmM3YjVjYjRlOGMzZmNmMzc2NGEiLCJqdGkiOiI3MDQ1NmExYzkzMjg2MzlhIiwiaXNzIjoiZGlkOmVsZW06RWlEVll1SzR1YklMYjdXdUUtWkt2RVRlU0ZqZ2F1Nm1WenE3Sm5zTmJwVUQ4ZztlbGVtOmluaXRpYWwtc3RhdGU9ZXlKd2NtOTBaV04wWldRaU9pSmxlVXAyWTBkV2VWbFlVbkJpTWpScFQybEthbU50Vm1oa1IxVnBURU5LY21GWFVXbFBhVWxxWTBoS2NHSlhSbmxsVTBselNXMUdjMXA1U1RaSmExWlVUV3BWTWxONVNqa2lMQ0p3WVhsc2IyRmtJam9pWlhsS1FWa3lPWFZrUjFZMFpFTkpOa2x0YURCa1NFSjZUMms0ZG1SNlRuQmFRelYyWTIxamRscEhiR3RNTTFsNFNXbDNhV05JVm1saVIyeHFVekpXTlVscWNHSmxlVXB3V2tOSk5rbHBUbmRqYld4MFdWaEtOVWxwZDJsa1dFNW9XakpWYVU5cFNucGhWMlIxWVZjMWJrbHBkMmxrU0d4M1dsTkpOa2xzVG14Wk0wRjVUbFJhY2sxV1dteGpiV3h0WVZkT2FHUkhiSFppYTNSc1pWUkpkMDFVWjJsTVEwcDNaRmRLYzJGWFRreGFXR3hKV2xobmFVOXBTWGROYW1ob1RUSkdhazVFWXpWTlZHY3lUa1JDYUU1dFJYZGFSRkUxV1ZkS2FVMVVUWGxhYlZGM1RXMU9hRnBVVFhoT2VsVjNXbGRPYVUxWFZUTk9lbHBvV1cxVmVVNVVUWGxhYWtacFQxZFpOVmw2YXpCT2FtdHBabE40TjBsdGJHdEphbTlwU1ROS2JGa3lPVEphV0VvMVNXbDNhV1JZVG1oYU1sVnBUMmxLZVZwWFRuWmtiVlo1WlZOSmMwbHVValZqUjFWcFQybEtWRnBYVG5kTmFsVXlZWHBHVjFwWVNuQmFiV3hxV1ZoU2NHSXlOVXhhV0d0NVRVUkZORWxwZDJsalNGWnBZa2RzYWxNeVZqVlRSMVkwU1dwdmFVMUVUbXhOTWxFeFRtcGpORmxxWjNkTmVtaHJXbXBqTlZreVNteE9lbVJvV1RKVk1rNXFRbWxaYWtwc1dXMUZNMDlFWXpKTlIxVjRUVVJyTUZwRVVYbFpNa1pwVGpKS2FrMUVhelZOUkZrMVRqSlZlVTVxWnpGSmJqRmtabEVpTENKemFXZHVZWFIxY21VaU9pSllWSEF6ZGxNemRHTlZYMUpHUlRGdWFtdFVaVlI0UmpsWGJtMXVTa2w0ZFRFd2VuRjBNemxpTXkxbmQwWnlkREZJZVdoeFkzUTJUV1l5U25kNlRtVmZRWGx6VVdoSmNXWk5iMWhLVFVvd1MyOWhZVTFvVVNKOSNwcmltYXJ5In0.56419bf1583f66e89f8c544c39b6b76bd5f873019d926ad189e67d0c16932aa62102be9b8000e533e1db71274a40e49ab73ead94b979da766ba1cf54bd73d236'

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.verifyCredentialShareResponseToken(
        credentialShareResponseToken,
        credentialShareRequestToken,
        true,
      )
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode, message } = responseError

    expect(code).to.equal('COM-0')
    expect(message).to.equal('DID of this token issuer does not exists at the ledger')
    expect(httpStatusCode).to.equal(500)
  })

  it('#verifyCredentialShareResponseToken when holder must be a subject', async () => {
    const credentialShareRequestToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJjb25zdHJhaW50cyI6W119XSwiY2FsbGJhY2tVUkwiOiJodHRwczovL2t1ZG9zLWlzc3Vlci1iYWNrZW5kLmFmZmluaXR5LXByb2plY3Qub3JnL3JlY2VpdmUvdGVzdGVyQmFkZ2UifSwiZXhwIjoxNjIxMDczMTg3MTc2LCJ0eXAiOiJjcmVkZW50aWFsUmVxdWVzdCIsImp0aSI6ImFhMzc2Y2M3OWQwYzMyNTkiLCJpc3MiOiJkaWQ6am9sbzo4YzMxMTcxMzViNjg5MmY0ZWE1ZDA1ZWMwYzI3NzhjM2RiNGQ5M2Q0YjI0YzQ5OTE2MDgzMWVmOTc0YWRmM2VmI2tleXMtMSJ9.613973e47018d0b6b8e52d4d93fd6721bd863502edd8a8d251a0faec34c27e2f613c95a5662a27b360f8424544b520804cf67e17395adff1b609c559cf6a319c'
    const credentialShareResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic3VwcGxpZWRDcmVkZW50aWFscyI6W3siQGNvbnRleHQiOlt7ImlkIjoiQGlkIiwidHlwZSI6IkB0eXBlIiwiY3JlZCI6Imh0dHBzOi8vdzNpZC5vcmcvY3JlZGVudGlhbHMjIiwic2NoZW1hIjoiaHR0cDovL3NjaGVtYS5vcmcvIiwiZGMiOiJodHRwOi8vcHVybC5vcmcvZGMvdGVybXMvIiwieHNkIjoiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjIiwic2VjIjoiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eSMiLCJDcmVkZW50aWFsIjoiY3JlZDpDcmVkZW50aWFsIiwiaXNzdWVyIjp7IkBpZCI6ImNyZWQ6aXNzdWVyIiwiQHR5cGUiOiJAaWQifSwiaXNzdWVkIjp7IkBpZCI6ImNyZWQ6aXNzdWVkIiwiQHR5cGUiOiJ4c2Q6ZGF0ZVRpbWUifSwiY2xhaW0iOnsiQGlkIjoiY3JlZDpjbGFpbSIsIkB0eXBlIjoiQGlkIn0sImNyZWRlbnRpYWwiOnsiQGlkIjoiY3JlZDpjcmVkZW50aWFsIiwiQHR5cGUiOiJAaWQifSwiZXhwaXJlcyI6eyJAaWQiOiJzZWM6ZXhwaXJhdGlvbiIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sInByb29mIjp7IkBpZCI6InNlYzpwcm9vZiIsIkB0eXBlIjoiQGlkIn0sIkVjZHNhS29ibGl0elNpZ25hdHVyZTIwMTYiOiJzZWM6RWNkc2FLb2JsaXR6U2lnbmF0dXJlMjAxNiIsImNyZWF0ZWQiOnsiQGlkIjoiZGM6Y3JlYXRlZCIsIkB0eXBlIjoieHNkOmRhdGVUaW1lIn0sImNyZWF0b3IiOnsiQGlkIjoiZGM6Y3JlYXRvciIsIkB0eXBlIjoiQGlkIn0sImRvbWFpbiI6InNlYzpkb21haW4iLCJub25jZSI6InNlYzpub25jZSIsInNpZ25hdHVyZVZhbHVlIjoic2VjOnNpZ25hdHVyZVZhbHVlIn0seyJQcm9vZk9mTmFtZUNyZWRlbnRpYWwiOiJodHRwczovL2lkZW50aXR5LmpvbG9jb20uY29tL3Rlcm1zL1Byb29mT2ZOYW1lQ3JlZGVudGlhbCIsInNjaGVtYSI6Imh0dHA6Ly9zY2hlbWEub3JnLyIsImZhbWlseU5hbWUiOiJzY2hlbWE6ZmFtaWx5TmFtZSIsImdpdmVuTmFtZSI6InNjaGVtYTpnaXZlbk5hbWUifV0sImlkIjoiY2xhaW1JZDo2M2I1ZDExYzBkMWI1NTY2IiwiaXNzdWVyIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCIsImlzc3VlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAzWiIsInR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb29mT2ZOYW1lQ3JlZGVudGlhbCJdLCJleHBpcmVzIjoiMjAyMS0wMS0xNlQwNzowNjozNS4zMzdaIiwicHJvb2YiOnsiY3JlYXRlZCI6IjIwMjAtMDEtMTdUMDc6MDY6MzUuNDAyWiIsInR5cGUiOiJFY2RzYUtvYmxpdHpTaWduYXR1cmUyMDE2Iiwibm9uY2UiOiJjZjgyZjFiNDQ4NTE0MjI5Iiwic2lnbmF0dXJlVmFsdWUiOiI4NjYxOTFlYjNmN2E4NzFiNTlkMGM2NjVlZDhhNGMzYjc5OTEyNGFhNTRlOWZhZjdkMjE2MzQ4NmZkMTQ2YzE0MDQ3ZDNkNGE2ODgwNTZkNGM2ZDBhZDIyMTE3MGFmNTU1NjFkODdiODcyZTQyOGQzMGI1YzFmYThmZmQyN2Y4MyIsImNyZWF0b3IiOiJkaWQ6am9sbzo2ZGY2ZmQ0YTg3NmRjZDM3NWZiYzVkNjMwZTY0ZTc1MjlmMjdlOTYxMmFlY2JiYmYzMjEzODYxYTJiMGI3ZTlkI2tleXMtMSJ9LCJjbGFpbSI6eyJnaXZlbk5hbWUiOiJEZW5pc1VwZGF0ZWQiLCJmYW1pbHlOYW1lIjoiUG9wb3YiLCJpZCI6ImRpZDpqb2xvOjZkZjZmZDRhODc2ZGNkMzc1ZmJjNWQ2MzBlNjRlNzUyOWYyN2U5NjEyYWVjYmJiZjMyMTM4NjFhMmIwYjdlOWQifSwibmFtZSI6Ik5hbWUifV19LCJleHAiOjE2MjEwNzMxODc5OTIsInR5cCI6ImNyZWRlbnRpYWxSZXNwb25zZSIsImF1ZCI6ImRpZDpqb2xvOjhjMzExNzEzNWI2ODkyZjRlYTVkMDVlYzBjMjc3OGMzZGI0ZDkzZDRiMjRjNDk5MTYwODMxZWY5NzRhZGYzZWYiLCJqdGkiOiJhYTM3NmNjNzlkMGMzMjU5IiwiaXNzIjoiZGlkOmpvbG86NmRmNmZkNGE4NzZkY2QzNzVmYmM1ZDYzMGU2NGU3NTI5ZjI3ZTk2MTJhZWNiYmJmMzIxMzg2MWEyYjBiN2U5ZCNrZXlzLTEifQ.c483e3b589c82f96f65c8bd3e356979743968b965f01be1f2ca67b76283000065ba37893dd267d85d86adb60ae60fcd23ef1c06bd1efbceab5816bd261103b5b'

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    const { isValid, suppliedCredentials } = await commonNetworkMember.verifyCredentialShareResponseToken(
      credentialShareResponseToken,
      credentialShareRequestToken,
      true,
    )

    expect(isValid).to.equal(true)
    expect(suppliedCredentials).to.exist
  })

  it('#verifyCredentialOfferResponseToken', async () => {
    const credentialOfferRequestToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJvZmZlcmVkQ3JlZGVudGlhbHMiOlt7InR5cGUiOiJUZXN0RGVuaXNDcmVkIn1dfSwiZXhwIjoxNjQ5OTgwODAwMDAwLCJ0eXAiOiJjcmVkZW50aWFsT2ZmZXJSZXF1ZXN0IiwianRpIjoxMjMxMjMxMjMsImF1ZCI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYiLCJpc3MiOiJkaWQ6am9sbzpmNTU5MjY1YjZjMWJlY2Q1NjEwOWM1NjIzNDM1ZmE3OTdhZDQzMDhhNGE2ODZmOGVkYTcwOWYzMzg3ZDMwM2U2I2tleXMtMSJ9.1a4f2ec0a6f1804d98a4b6531b6ad5da6f8401067501cb7d4ccc4089c60ac59c52b384fc096df9db6f2d31fbbf89be4e45e880d03bd15b6872b67b45c2408981'
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJzZWxlY3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoiVGVzdERlbmlzQ3JlZCJ9XX0sImV4cCI6MTY1MDkwNzI3NzMxOCwidHlwIjoiY3JlZGVudGlhbE9mZmVyUmVzcG9uc2UiLCJqdGkiOjEyMzEyMzEyMywiYXVkIjoiZGlkOmpvbG86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk3YWQ0MzA4YTRhNjg2ZjhlZGE3MDlmMzM4N2QzMDNlNiIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5cy0xIn0.e917793ca5b3505176c6d2c12487c2c49f9f65ec5bb7a8e5cbd5029a5c804cf150013af4f661b1e8efa9916ec2955e556e44d3e639f8945b2d2567265e7beb94'

    const tokenObject = CommonNetworkMember.fromJWT(credentialOfferResponseToken)

    const {
      payload: { interactionToken },
    } = tokenObject
    const { selectedCredentials: credentials } = interactionToken

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    const { isValid, did, nonce, selectedCredentials } = await commonNetworkMember.verifyCredentialOfferResponseToken(
      credentialOfferResponseToken,
      credentialOfferRequestToken,
    )

    expect(did).to.exist
    expect(selectedCredentials).to.deep.equal(credentials)
    expect(nonce).to.exist
    expect(isValid).to.equal(true)
    expect(selectedCredentials).to.exist
  })

  it('#verifyCredentialOfferResponseToken throws `COR-1 / 400` when bad parameters passed', async () => {
    const credentialOfferRequestToken = 123
    const credentialOfferResponseToken = 456
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.verifyCredentialOfferResponseToken(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        credentialOfferResponseToken,
        credentialOfferRequestToken,
      )
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-1')
    expect(httpStatusCode).to.equal(400)
  })

  it('#verifyCredentialOfferResponseToken throws `COM-0 / 500` when token is not valid (no suppliedCredentials)', async () => {
    const credentialOfferResponseToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.verifyCredentialOfferResponseToken(credentialOfferResponseToken)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode, message } = responseError

    expect(code).to.equal('COM-0')
    expect(message).to.equal("Cannot read property 'selectedCredentials' of undefined")
    expect(httpStatusCode).to.equal(500)
  })

  it('#generateCredentialOfferRequestToken, #verifyCredentialOfferResponseToken, #signCredentials, #validateCredential', async () => {
    const issuerPassword = password
    const issuerEncryptedSeed = ISSUER_ENCRYPTED_SEED

    const holderPassword = HOLDER_PASSWORD
    const holderEncryptedSeed = HOLDER_ENCRYPTED_SEED

    const renderInfo = {}
    const callbackUrl = 'https://kudos-issuer-backend.affinity-project.org/receive/testerBadge'

    const offeredCredentials = [
      {
        type: 'EntityCredential',
        renderInfo,
      },
      {
        type: 'PhoneCredentialPersonV1',
        renderInfo,
      },
    ]

    const commonNetworkMemberIssuer = new CommonNetworkMember(issuerPassword, issuerEncryptedSeed, options)
    const commonNetworkMemberHolder = new CommonNetworkMember(holderPassword, holderEncryptedSeed, options)
    const credentialOfferRequestToken = await commonNetworkMemberIssuer.generateCredentialOfferRequestToken(
      offeredCredentials,
      {
        callbackUrl,
      },
    )

    const credentialOfferResponseToken = await commonNetworkMemberHolder.createCredentialOfferResponseToken(
      credentialOfferRequestToken,
    )

    const {
      isValid,
      did: requesterDid,
      nonce,
      selectedCredentials,
    } = await commonNetworkMemberIssuer.verifyCredentialOfferResponseToken(
      credentialOfferResponseToken,
      credentialOfferRequestToken,
    )

    expect(requesterDid).to.exist
    expect(selectedCredentials).to.deep.equal(offeredCredentials)
    expect(nonce).to.exist
    expect(isValid).to.equal(true)
    expect(selectedCredentials).to.exist

    const unsignedCredentials = [
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'placeholder',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '+1 555 555 5555',
            },
          },
          holder: { id: 'placeholder' },
          type: 'PhoneCredentialPersonV1',
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
      }),
    ]

    const signedCredentials = await commonNetworkMemberIssuer.signCredentials(
      credentialOfferResponseToken,
      unsignedCredentials,
    )

    expect(signedCredentials).to.exist
    expect(signedCredentials).have.lengthOf(1)

    const affinity = new Affinity()
    const validateCredentialsResponse = await affinity.validateCredential(signedCredentials[0])

    expect(validateCredentialsResponse).to.deep.equal({ result: true, error: '' })
  })

  it('#storeEncryptedSeed throws `WAL-2 / 409` WHEN key for userId already exists', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.storeEncryptedSeed(cognitoUsername, cognitoPassword)
      await commonNetworkMember.storeEncryptedSeed(cognitoUsername, cognitoPassword)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('WAL-2')
    expect(httpStatusCode).to.equal(409)
  })

  it('#pullEncryptedSeed', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    const pulledEncryptedSeed = await commonNetworkMember.pullEncryptedSeed(cognitoUsername, cognitoPassword)

    expect(pulledEncryptedSeed).to.exist
  })

  it('#pullEncryptedSeed throws `COR-4 / 404` when seed not found', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.pullEncryptedSeed('non_existing_user', cognitoPassword)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-4')
    expect(httpStatusCode).to.equal(404)
  })

  it('#pullEncryptedSeed throws `COR-1 / 400` when bad parameters passed', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError
    const wrongParameter1 = 123
    const wrongParameter2 = 456

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await commonNetworkMember.pullEncryptedSeed(wrongParameter1, wrongParameter2)
    } catch (error) {
      responseError = error
    }

    const {
      code,
      httpStatusCode,
      message,
      context: { errors },
    } = responseError

    const [error1, error2] = errors

    const expectedError1 = { value: wrongParameter1, message: `Parameter "${wrongParameter1}" should be a string.` }
    const expectedError2 = { value: wrongParameter2, message: `Parameter "${wrongParameter2}" should be a string.` }

    expect(code).to.equal('COR-1')
    expect(message).to.equal('Invalid operation parameters.')
    expect(httpStatusCode).to.equal(400)
    expect(error1).to.deep.equal(expectedError1)
    expect(error2).to.deep.equal(expectedError2)
  })

  it('Auth flow', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)
    const customNonce = '1231sdfd23123s'
    const audienceDid = seedDid
    const jwtOptions = { audienceDid, nonce: customNonce, callbackUrl }

    const requestToken = await commonNetworkMember.generateDidAuthRequest(jwtOptions)
    expect(requestToken).to.exist

    const requestTokenObject = CommonNetworkMember.fromJWT(requestToken)
    const { payload: requestPayload } = requestTokenObject
    expect(requestPayload.aud).to.be.equal(audienceDid)
    expect(requestPayload.jti).to.be.equal(customNonce)

    const responseToken = await commonNetworkMember.createDidAuthResponse(requestToken)
    expect(responseToken).to.exist
    const responseTokenObject = CommonNetworkMember.fromJWT(responseToken)

    expect(responseTokenObject.payload.jti).to.be.equal(customNonce)

    const { isValid } = await commonNetworkMember.verifyDidAuthResponse(responseToken, requestToken)
    expect(isValid).to.be.equal(true)
  })

  it('#signUp when user registers with arbitrary username', async () => {
    const cognitoUsername = generateUsername()

    let networkMember
    networkMember = await CommonNetworkMember.signUp(cognitoUsername, cognitoPassword)

    expect(networkMember.did).to.exist
    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)

    await networkMember.signOut()

    networkMember = await CommonNetworkMember.fromLoginAndPassword(cognitoUsername, cognitoPassword)

    expect(networkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#pullEncryptedSeed throws `WAL-1 / 404` WHEN key for userId does not exist', async () => {
    const cognitoUsername = userWithoutKey

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.pullEncryptedSeed(cognitoUsername, cognitoPassword)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('WAL-1')
    expect(httpStatusCode).to.equal(404)
  })

  it('#storeEncryptedSeed throws `COR-4 / 404` WHEN userId does not exists', async () => {
    const cognitoUsername = 'non_existing@email.com'

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let responseError

    try {
      await commonNetworkMember.storeEncryptedSeed(cognitoUsername, cognitoPassword)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode } = responseError

    expect(code).to.equal('COR-4')
    expect(httpStatusCode).to.equal(404)
  })

  it('#changeUsername throws `COR-7 / 409` when new username exists', async () => {
    const newCognitoUsername = COGNITO_USERNAME_EXISTS

    const networkMember = await CommonNetworkMember.fromLoginAndPassword(cognitoUsername, cognitoPassword)

    let responseError

    try {
      await networkMember.changeUsername(cognitoUsername, newCognitoUsername)
    } catch (error) {
      responseError = error
    }

    const { code, message, httpStatusCode } = responseError

    expect(code).to.equal('COR-7')
    expect(message).to.equal('User with the given username already exists.')
    expect(httpStatusCode).to.equal(409)
  })

  it('#signIn with phoneNumber returns token', async () => {
    const token = await CommonNetworkMember.signIn(phoneNumber, options)

    expect(token).to.exist
  })

  it('#pullEncryptedSeed when bad parameters passed', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await commonNetworkMember.pullEncryptedSeed(123)
    } catch (error) {
      validationError = error
    }

    const { name, message, context, httpStatusCode } = validationError
    const { message: contextMessage1 } = context.errors[0]
    const { message: contextMessage2 } = context.errors[1]

    expect(name).to.eql('COR-1')
    expect(httpStatusCode).to.eql(400)
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Parameter "123" should be a string.')
    expect(contextMessage2).to.eql('Required parameter at index [1] is missing.')
  })

  it('#createCredentialShareResponseToken when bad parameters passed', async () => {
    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await commonNetworkMember.createCredentialShareResponseToken()
    } catch (error) {
      validationError = error
    }

    const { name, message, context, httpStatusCode } = validationError
    const { message: contextMessage1 } = context.errors[0]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Required parameter at index [0] is missing.')
    expect(httpStatusCode).to.eql(400)
  })

  it('#getSignupCredentials', async () => {
    // prettier-ignore
    const options = {
    //   issuerUrl:     'http://localhost:3001',
      // keyStorageUrl: 'http://localhost:3000',
    //   didMethod:     'elem'
    }

    const cognitoService = new CognitoService()
    const { idToken } = await cognitoService.signIn(cognitoUsername, cognitoPassword)

    const decoded = jwt.decode(idToken)

    if (typeof decoded === 'string') {
      throw Error
    }

    const commonNetworkMember = new CommonNetworkMember(password, encryptedSeed, options)

    const signedCredentials = await commonNetworkMember.getSignupCredentials(idToken, options)

    expect(signedCredentials).to.exist
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(signedCredentials[0].credentialSubject.data.email).to.eq(decoded.email)
  })
})
