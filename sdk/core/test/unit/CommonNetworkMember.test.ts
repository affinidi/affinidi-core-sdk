'use strict'

import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'
import { Affinity, JwtService, KeysService, DidDocumentService } from '@affinidi/common'
import { buildVCV1Skeleton, buildVCV1Unsigned } from '@affinidi/vc-common'
import {
  VCSPhonePersonV1,
  getVCPhonePersonV1Context,
  VCSEmailPersonV1,
  getVCEmailPersonV1Context,
} from '@affinidi/vc-data'

import CognitoService from '../../src/services/CognitoService'
import WalletStorageService from '../../src/services/WalletStorageService'
import { PhoneIssuerService } from '../../src/services/PhoneIssuerService'
import { EmailIssuerService } from '../../src/services/EmailIssuerService'
import { CommonNetworkMember } from '../../src/CommonNetworkMember'

import { SdkOptions } from '../../src/dto/shared.dto'

import { getOptionsForEnvironment } from '../helpers'

import { generateTestDIDs } from '../factory/didFactory'
import { DEFAULT_DID_METHOD } from '../../src/_defaultConfig'
import SdkError from '../../src/shared/SdkError'

const signedCredential = require('../factory/signedCredential')
const didDocument = require('../factory/didDocument')
const credentialShareRequestToken = require('../factory/credentialShareRequestToken')
const parsedCredentialShareRequestToken = require('../factory/parsedCredentialShareRequestToken')
const parsedCredentialShareResponseToken = require('../factory/parsedCredentialShareResponseToken')
const cognitoAuthSuccessResponse = require('../factory/cognitoAuthSuccessResponse')

let walletPassword: string

const email = 'user@email.com'
const username = 'test_user'
let encryptedSeedJolo: string
let encryptedSeedElem: string
let encryptedSeedElemAlt: string
let seedHex: string
const didMethod = DEFAULT_DID_METHOD
let joloDidDocument: { id: string }

let didElem: string
let didElemShortForm: string
let didElemAlt: string

const confirmationCode = '123456'
const signUpResponseToken = `${username}::${walletPassword}`
const signUpWithEmailResponseToken = `${email}::${walletPassword}`
const signInResponseToken =
  `${email}::eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1Nksif` +
  'G9zX29mZmVyaW5nLyJ9LCJleHAiOjE2MTI5NjE5NTY3NzAsInR5cCI6ImNyZWRlbnRpYWxSZX' +
  'c44eac73f350b739ac0e5eb4add1961c88d9f0486b37be928bccf2b19fb5a1d2b7c9bbe'

const credentialOfferToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnR' +
  'lcmFjdGlvblRva2VuIjp7ImNhbGxiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFj' +
  'a2VuZC5hZmZpbml0eS1wcm9qZWN0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJvZmZlcmVkQ3JlZ' +
  'GVudGlhbHMiOlt7InR5cGUiOiJUZXN0RGVuaXNDcmVkIn1dfSwiZXhwIjoxNjEyOTYyMzg5OD' +
  'M3LCJ0eXAiOiJjcmVkZW50aWFsT2ZmZXJSZXF1ZXN0IiwianRpIjoiMWYyMjE1YzI3OWQ3M2V' +
  'mOSIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0MzVmYTc5N2Fk' +
  'NDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5cy0xIn0.372a5abdc3948e25f5635' +
  '9ca4d411a5fb94e39e1d394873ee106b534784925054db80fb78d01dfb08e0c198671d234' +
  'aeb313ac971e558fe83c8b8a394d931431'

const jwt =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2Vu' +
  'Ijp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOlsiQ3JlZGVudGlhbCIsIlByb' +
  '2ZpbGVDcmVkZW50aWFsIl19XSwiY2FsbGJhY2tVUkwiOiJodHRwczovL2FwaS5kZXYuYWZmaW' +
  '5pdHktcHJvamVjdC5vcmcifSwidHlwIjoiY3JlZGVudGlhbFJlcXVlc3QiLCJpYXQiOjE1ODE' +
  'wNjI4ODg1OTQsImV4cCI6MTU4MTA2NjQ4ODU5NCwianRpIjoiNDE2YzQ3ZDcwZjc5ZDdkYiIs' +
  'ImlzcyI6ImRpZDpqb2xvOjA4MjZiNmU0NmIzZGY1NWMyOWY1MmIyMjIyMWRhYzgyZjU5NjhmY' +
  'zdmNDkxYTJhYzQ3NGEzYWQ5Y2Q4MGVlY2Qja2V5cy0xIn0.e35eb6cf513540a7ebd4f3f07e' +
  '472cf2764c9996a6c794018cbd9cc6934aa03228d4c61e765d159cd4496775301438b3311' +
  '36b05029b5339305b33f1bad3efa5'

const idToken =
  'byJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlv' +
  'blRva2VuIjp7ImNhbGxiYWNrVVJMIjoiIiwic2VsZWN0ZWRDcmVkZW50aWFscyI6W3sidHlwZ' +
  'SI6IkVtYWlsQ3JlZGVudGlhbFBlcnNvblYxIn1dfSwiZXhwIjoxNTkxMTU4NzUxMDk4LCJ0eX' +
  'AiOiJjcmVkZW50aWFsT2ZmZXJSZXNwb25zZSIsImp0aSI6IjViN2Y1OTcyYzIxNzUxZmUiLCJ' +
  'hdWQiOiJkaWQ6am9sbzpmNTU5MjY1YjZjMWJlY2Q1NjEwOWM1NjIzNDM1ZmE3OTdhZDQzMDhh' +
  'NGE2ODZmOGVkYTcwOWYzMzg3ZDMwM2U2IiwiaXNzIjoiZGlkOmVsZW06RWlCYmZFcnJncVNTd' +
  'kFrX2wzakRJeFdxSGFFYkNBSUpPZTFvYkswcHlmampSdztlbGVtOmluaXRpYWwtc3RhdGU9ZX' +
  'lKd2NtOTBaV04wWldRaU9pSmxlVXAyWTBkV2VWbFlVbkJpTWpScFQybEthbU50Vm1oa1IxVnB' +
  'URU5LY21GWFVXbFBhVWxxWTBoS2NHSlhSbmxsVTBselNXMUdjMXA1U1RaSmExWlVUV3BWTWxO' +
  'NVNqa2lMQ0p3WVhsc2IyRmtJam9pWlhsS1FWa3lPWFZrUjFZMFpFTkpOa2x0YURCa1NFSjZUM' +
  'ms0ZG1SNlRuQmFRelYyWTIxamRscEhiR3RNTTFsNFNXbDNhV05JVm1saVIyeHFVekpXTlVscW' +
  'NHSmxlVXB3V2tOSk5rbHBUbmRqYld4MFdWaEtOVWxwZDJsa1dFNW9XakpWYVU5cFNucGhWMlI' +
  'xWVZjMWJrbHBkMmxrU0d4M1dsTkpOa2xzVG14Wk0wRjVUbFJhY2sxV1dteGpiV3h0WVZkT2FH' +
  'UkhiSFppYTNSc1pWUkpkMDFVWjJsTVEwcDNaRmRLYzJGWFRreGFXR3hKV2xobmFVOXBTWGROT' +
  'WxsNFRVZE9iRmx0V1RCWmFrVXdUbXBCZUUxVVJYbE9hbWQ1V1hwT2JVNUVVWGxOTWxWNFdWZG' +
  'FiRTlYU1RCWk1rVjNXbFJOZWsxcVVYaE9iVXB0V1ZSamQwNUVWbXBPZWtKcFdrUkdhVTVIU1R' +
  'WWmFrVnBabE40TjBsdGJHdEphbTlwU1ROS2JGa3lPVEphV0VvMVNXbDNhV1JZVG1oYU1sVnBU' +
  'MmxLZVZwWFRuWmtiVlo1WlZOSmMwbHVValZqUjFWcFQybEtWRnBYVG5kTmFsVXlZWHBHVjFwW' +
  'VNuQmFiV3hxV1ZoU2NHSXlOVXhhV0d0NVRVUkZORWxwZDJsalNGWnBZa2RzYWxNeVZqVlRSMV' +
  'kwU1dwdmFVMUVUVEZOTWswMVQxUkdhRTR5V1RSTk1scHBXVmRTYlZwcVVYbFpNbFpzVDFSV2J' +
  'GcHFVVFJPUjBsM1QxUmtiVTVVUlRGYVZFcHJXa2RWTVUxVVZYZE9hbXhyVGxSQk1sbFhUWGhO' +
  'VkVrMVRVUmFhRmxYVVRWSmJqRmtabEVpTENKemFXZHVZWFIxY21VaU9pSlVNVTVpVWkxWGF6Z' +
  'GFaM1pOTkZaMlFVOXFOMHRIWlU5T1lVbHhhMjFrUnpCRGQxVTJYME5RWWpWSldXdzNiREY1Vl' +
  'RBeFFuaHdVVmh6YlU1RGFXSXpjbEJ4VkVaVGFIUkZYekpNVDJaaWIyMUJXVTlUVVNKOSNwcml' +
  'tYXJ5In0.3c1068e2ce500f768eb6ad5090b2442fbf0a36ddee7d66d451779d71fe3d9793' +
  '3a36ceb13aa49b5403e3ed73a1c88718fed3531753d60173f0155fc0ef5aa1d1'

let walletStub: sinon.SinonStub

// test agains `dev | prod` // if nothing specified, staging is used by default
const options: SdkOptions = getOptionsForEnvironment()

const { registryUrl } = options

const stubConfirmAuthRequests = async (opts: { password: string; seedHex: string; didDocument: { id: string } }) => {
  const { id: did } = opts.didDocument

  sinon.stub(CognitoService.prototype, 'confirmSignUp')
  sinon.stub(CognitoService.prototype, 'signIn').resolves(cognitoAuthSuccessResponse)
  sinon.stub(WalletStorageService, 'pullEncryptionKey').resolves(opts.password)
  sinon.stub(KeysService, 'normalizePassword').returns(Buffer.from(opts.password))
  sinon.stub(KeysService, 'encryptSeed').resolves(opts.seedHex)
  sinon.stub(DidDocumentService.prototype, 'getMyDid').resolves(did)
  sinon.stub(DidDocumentService.prototype, 'buildDidDocument').resolves(opts.didDocument)
  sinon.stub(KeysService.prototype, 'signDidDocument').resolves(opts.didDocument)

  nock(registryUrl).post('/api/v1/did/put-in-ipfs').reply(200, { hash: 'didDocumentAddress' })

  nock(registryUrl).post('/api/v1/did/anchor-transaction').reply(200, { digestHex: 'digestHex' })

  sinon.stub(KeysService.prototype, 'createTransactionSignature').resolves('transactionSignatureJson')
  sinon.stub(KeysService, 'getAnchorTransactionPublicKey').returns('publicKey')

  nock(registryUrl).post('/api/v1/did/anchor-did').reply(200, {})

  sinon
    .stub(KeysService, 'decryptSeed')
    .returns({ seed: Buffer.from(opts.seedHex), didMethod, seedHexWithMethod: `${seedHex}++${didMethod}` })
  sinon
    .stub(KeysService.prototype, 'decryptSeed')
    .returns({ seed: Buffer.from(opts.seedHex), didMethod, seedHexWithMethod: `${seedHex}++${didMethod}` })
  walletStub = sinon.stub(WalletStorageService.prototype, 'storeEncryptedSeed')
}

describe('CommonNetworkMember', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    walletPassword = testDids.password

    encryptedSeedJolo = testDids.jolo.encryptedSeed
    seedHex = testDids.jolo.seedHex
    joloDidDocument = testDids.jolo.didDocument

    encryptedSeedElem = testDids.elem.encryptedSeed
    didElem = testDids.elem.did
    didElemShortForm = didElem.substring(0, didElem.indexOf(';'))

    encryptedSeedElemAlt = testDids.elemAlt.encryptedSeed
    didElemAlt = testDids.elemAlt.did
    // elemDidDocument = testDids.elem.didDocument
  })
  // beforeEach(() => {
  //   nock(registryUrl).persist().post('/api/v1/did/resolve-did', /elem/gi).reply(200, { didDocument: elemDidDocument })
  //   nock(registryUrl).persist().post('/api/v1/did/resolve-did', /jolo/gi).reply(200, { didDocument: joloDidDocument })
  // })
  afterEach(() => {
    nock.cleanAll()
    sinon.restore()
  })

  it('#resolveDid', async () => {
    const { id: did } = didDocument

    nock(registryUrl).post('/api/v1/did/resolve-did').reply(200, { didDocument })

    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)
    const response = await networkMember.resolveDid(did)

    expect(response).to.eql(didDocument)
  })

  it('.generateSeed', async () => {
    const response = await CommonNetworkMember.generateSeed()

    expect(response).to.exist
  })

  it('.updateDidDocument /COR-20 (not supported elem did method)', async () => {
    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem)

    const didDcoument = { id: 'did:elem:...' }

    let updatedDocumentError
    try {
      await commonNetworkMember.updateDidDocument(didDcoument)
    } catch (error) {
      updatedDocumentError = error
    }

    expect(updatedDocumentError).to.exist
    expect(updatedDocumentError.code).to.be.equal('COR-20')
  })

  it('.updateDidDocument /COR-21 (did document has another did)', async () => {
    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    const didDcoument = { id: 'did:jolo:...' }

    let updatedDocumentError
    try {
      await commonNetworkMember.updateDidDocument(didDcoument)
    } catch (error) {
      updatedDocumentError = error
    }

    expect(updatedDocumentError).to.exist
    expect(updatedDocumentError.code).to.be.equal('COR-21')
  })

  it('#fromSeed create instance of class by the seed', async () => {
    const commonNetworkMember = await CommonNetworkMember.fromSeed(seedHex, options, walletPassword)

    expect(commonNetworkMember.encryptedSeed).to.exist
  })

  it('#fromSeed create instance of class by the seed when password is not provided', async () => {
    const commonNetworkMember = await CommonNetworkMember.fromSeed(seedHex)

    expect(commonNetworkMember.encryptedSeed).to.exist
  })

  it('Throws error if instance initializing without seed and password', async () => {
    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new CommonNetworkMember(options)
    } catch (error) {
      validationError = error
    }

    const expectedErrorMessage = '`password` and `encryptedSeed` must be provided!'

    expect(validationError.message).to.eql(expectedErrorMessage)
  })

  it('.passwordlessLogin (with default SDK options)', async () => {
    sinon.stub(CognitoService.prototype, 'signInWithUsername').resolves(signUpResponseToken)

    const response = await CommonNetworkMember.passwordlessLogin(username)

    expect(response).to.eql(signUpResponseToken)
  })

  it('.completeLoginChallenge', async () => {
    sinon.stub(CognitoService.prototype, 'completeLoginChallenge').resolves(cognitoAuthSuccessResponse)
    sinon.stub(WalletStorageService, 'pullEncryptedSeed').resolves(encryptedSeedJolo)
    sinon.stub(WalletStorageService, 'pullEncryptionKey').resolves(walletPassword)

    const response = await CommonNetworkMember.completeLoginChallenge('token', '123456', options)

    expect(response.did).to.exist
    expect(response).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#getShareCredential', () => {
    const credentials = [signedCredential]

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareRequestToken)

    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const filteredCredentials = networkMember.getShareCredential(credentialShareRequestToken, { credentials })

    expect(filteredCredentials).to.eql([signedCredential])
  })

  it('#signOut', async () => {
    sinon.stub(CognitoService.prototype, 'signOut')

    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const response = await networkMember.signOut()

    expect(response).to.be.undefined
  })

  it('#forgotPassword (with default SDK options)', async () => {
    sinon.stub(CognitoService.prototype, 'forgotPassword')

    const response = await CommonNetworkMember.forgotPassword(username)

    expect(response).to.be.undefined
  })

  it('#forgotPasswordSubmit (with default SDK options)', async () => {
    sinon.stub(CognitoService.prototype, 'forgotPasswordSubmit')

    const response = await CommonNetworkMember.forgotPasswordSubmit(username, confirmationCode, walletPassword)

    expect(response).to.be.undefined
  })

  it('#signUp with username (with default SDK options)', async () => {
    sinon.stub(CognitoService.prototype, 'signUp')

    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(WalletStorageService, 'adminConfirmUser')

    const response = await CommonNetworkMember.signUp(username, walletPassword)

    expect(response.did).to.exist
    expect(response).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#resendSignUpConfirmationCode (with default SDK options)', async () => {
    sinon.stub(CognitoService.prototype, 'resendSignUp')

    const response = await CommonNetworkMember.resendSignUpConfirmationCode(username)

    expect(response).to.be.undefined
  })

  it('#signIn when CognitoService throws error (with default SDK options)', async () => {
    const username = email
    const signUpError = { foo: 'bar' }

    sinon.stub(CognitoService.prototype, 'signIn')
    sinon.stub(CognitoService.prototype, 'signInWithUsername').resolves(signUpResponseToken)
    sinon.stub(CognitoService.prototype, 'signUp').rejects(signUpError)
    sinon.stub(CognitoService.prototype, 'isUserUnconfirmed').resolves(false)
    sinon.stub(WalletStorageService, 'adminDeleteUnconfirmedUser')

    let responseError

    try {
      await CommonNetworkMember.signIn(username)
    } catch (error) {
      responseError = error
    }

    expect(responseError).to.eql(signUpError)
  })

  it('#signIn when user exists, and CognitoService throws `COR-7`', async () => {
    const username = email
    const signUpError = { code: 'COR-7' }

    sinon.stub(CognitoService.prototype, 'signIn')
    sinon.stub(CognitoService.prototype, 'signInWithUsername').resolves(signUpResponseToken)
    sinon.stub(CognitoService.prototype, 'signUp').rejects(signUpError)
    sinon.stub(CognitoService.prototype, 'isUserUnconfirmed').resolves(false)
    sinon.stub(WalletStorageService, 'adminDeleteUnconfirmedUser')

    const response = await CommonNetworkMember.signIn(username, options)

    expect(response).to.eql(signUpResponseToken)
  })

  it('#confirmSignUp when username is email (with default SDK options)', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    const response = await CommonNetworkMember.confirmSignUp(signUpWithEmailResponseToken, confirmationCode)

    expect(response.did).to.exist
    expect(response).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#confirmSignUp with arbitrary username', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(WalletStorageService, 'adminConfirmUser')

    const response = await CommonNetworkMember.confirmSignUp(signUpResponseToken, confirmationCode, options)

    expect(response.did).to.exist
    expect(response).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#confirmSignIn signUp scenario', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(
      signUpWithEmailResponseToken,
      confirmationCode,
      options,
    )

    expect(isNew).to.be.true
    expect(commonNetworkMember.did).to.exist
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#confirmSignIn logIn scenario', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(CognitoService.prototype, 'completeLoginChallenge').resolves(cognitoAuthSuccessResponse)
    sinon.stub(WalletStorageService, 'pullEncryptedSeed').resolves(encryptedSeedJolo)

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(
      signInResponseToken,
      confirmationCode,
      options,
    )

    expect(isNew).to.be.true
    expect(commonNetworkMember.did).to.exist
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#confirmSignIn logIn scenario (with default SDK options)', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(CognitoService.prototype, 'completeLoginChallenge').resolves(cognitoAuthSuccessResponse)
    sinon.stub(WalletStorageService, 'pullEncryptedSeed').resolves(encryptedSeedJolo)

    const { isNew, commonNetworkMember } = await CommonNetworkMember.confirmSignIn(
      signInResponseToken,
      confirmationCode,
    )

    expect(isNew).to.be.true
    expect(commonNetworkMember.did).to.exist
    expect(commonNetworkMember).to.be.an.instanceof(CommonNetworkMember)
  })

  it('#getPublicKeyHexFromDidDocument', async () => {
    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)
    const publicKeyHex = commonNetworkMember.getPublicKeyHexFromDidDocument(didDocument)

    expect(publicKeyHex).to.exist
  })

  it('#createCredentialShareResponseToken', async () => {
    const suppliedCredentials = [signedCredential]
    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const token = await commonNetworkMember.createCredentialShareResponseToken(
      credentialShareRequestToken,
      suppliedCredentials,
    )

    expect(token).to.exist
  })

  it('#createCredentialOfferResponseToken', async () => {
    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const token = await commonNetworkMember.createCredentialOfferResponseToken(credentialOfferToken)

    expect(token).to.exist
  })

  it('#verifyCredentialShareResponseToken throws `COR-15 / 404` when credentialShareRequestToken is wrong', async () => {
    const pullFunction = () => jwt
    const credentialShareResponseToken = jwt

    const stub = sinon.stub(JwtService, 'fromJWT')

    stub.onFirstCall().returns(parsedCredentialShareRequestToken)
    stub.onSecondCall().throws({ code: 'COR-15', httpStatusCode: 404 })

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    let responseError

    try {
      await commonNetworkMember.verifyCredentialShareResponseToken(credentialShareResponseToken, pullFunction)
    } catch (error) {
      responseError = error
    }

    const { code, httpStatusCode, context } = responseError

    expect(code).to.equal('COR-15')
    expect(httpStatusCode).to.equal(404)
    expect(context.credentialShareRequestToken).to.exist
  })

  it('#verifyCredentialShareResponseToken throws error if JWT validation failed', async () => {
    const expectedErrorMessage = 'Unhandled error'

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareResponseToken)
    sinon.stub(Affinity.prototype, 'validateJWT').throws({ message: expectedErrorMessage })
    sinon.stub(Affinity.prototype, 'resolveDid').resolves(didDocument)
    sinon.stub(DidDocumentService, 'keyIdToDid').returns(didDocument.id)

    const credentialShareResponseToken = jwt

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    let responseError

    try {
      await commonNetworkMember.verifyCredentialShareResponseToken(credentialShareResponseToken)
    } catch (error) {
      responseError = error
    }

    const { message } = responseError

    expect(message).to.equal(expectedErrorMessage)
  })

  it('#verifyCredentialShareResponseToken returns error VC validation failed', async () => {
    const expectedErrorMessage = 'Unhandled error'

    sinon.stub(JwtService, 'fromJWT').returns(parsedCredentialShareResponseToken)
    sinon.stub(DidDocumentService, 'keyIdToDid').returns(didDocument.id)
    sinon.stub(Affinity.prototype, 'validateJWT')
    sinon.stub(Affinity.prototype, 'resolveDid').resolves(didDocument)
    sinon.stub(Affinity.prototype, 'validateCredential').resolves({ result: false, error: expectedErrorMessage })

    const credentialShareResponseToken = jwt

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const result = await commonNetworkMember.verifyCredentialShareResponseToken(credentialShareResponseToken)

    const { isValid, did, errors } = result

    expect(isValid).to.eql(false)
    expect(did).to.eql(didDocument.id)
    expect(errors).to.include(expectedErrorMessage)
  })

  it('.did', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const myDid = networkMember.did

    expect(myDid).to.exist
  })

  it('#getDidFromToken', async () => {
    const didFromToken = 'did:jolo:0826b6e46b3df55c29f52b22221dac82f5968fc7f491a2ac474a3ad9cd80eecd'

    const did = CommonNetworkMember.getDidFromToken(jwt)

    expect(did).to.exist
    expect(did).to.be.equal(didFromToken)
  })

  // test parameter validation errors
  it('throws error when a requried parameter is missing', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.resolveDid()
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage } = context.errors[0]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage).to.eql('Required parameter at index [0] is missing.')
  })

  it('throws error when parameter type is wrong (with default SDK options)', async () => {
    const badConfirmationCode = 'BAD_CODE'

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await CommonNetworkMember.completeLoginChallenge('token', badConfirmationCode)
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage } = context.errors[0]

    const expectedErrorMessage =
      `Parameter "${badConfirmationCode}" is not a valid` + ' confirmation code. Valid format: (/^\\d{6}$/).'

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage).to.eql(expectedErrorMessage)
  })

  it('throws error when multiple requried parameters are missing', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.pullEncryptedSeed()
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage1 } = context.errors[0]
    const { message: contextMessage2 } = context.errors[1]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Required parameter at index [0] is missing.')
    expect(contextMessage2).to.eql('Required parameter at index [1] is missing.')
  })

  it('throws error when 2nd requried parameters is missing', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.pullEncryptedSeed('username')
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage1 } = context.errors[0]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Required parameter at index [1] is missing.')
  })

  it('throws error when parameter should an array of objects', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const offeredCredentials = {
      // should be an array
      type: ['Credential', 'TestCred'],
    }

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.generateCredentialOfferRequestToken(offeredCredentials)
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage1 } = context.errors[0]

    expect(name).to.equal('COR-1')
    expect(message).to.equal('Invalid operation parameters.')
    expect(contextMessage1).to.equal('Parameter at index [0] should be an array.')
  })

  it('throws error when parameter of an array of objects has a wrong type', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const badType = ['Credential', 'TestCred'] // should be string

    const offeredCredentials = [{ type: badType }]

    const expectedError = [
      {
        argument: 'type',
        value: ['Credential', 'TestCred'],
        message: { isString: 'type must be a string' },
      },
    ]

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.generateCredentialOfferRequestToken(offeredCredentials)
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(context.errors[0]).to.eql(expectedError)
  })

  it('throws error when multiple parameters have wrong format', async () => {
    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const pwd = 12345678
    const token = '!@#$%^'

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.storeEncryptedSeed(undefined, pwd, token)
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage1 } = context.errors[0]
    const { message: contextMessage2 } = context.errors[1]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Required parameter at index [0] is missing.')
    expect(contextMessage2).to.eql('Parameter "12345678" should be a string.')
  })

  it("doesn't retry storeEncryptedSeed method when a known error occurs during confirm signup", async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(WalletStorageService, 'adminConfirmUser')

    walletStub.onCall(0).throws({ code: 'COR-1' })

    let errorCode

    try {
      await CommonNetworkMember.confirmSignUp(signUpResponseToken, confirmationCode, options)
    } catch (error) {
      errorCode = error.code
      // catching error so the test doesn't throw
    }

    expect(errorCode).to.eq('COR-1')
    expect(walletStub.callCount).to.eql(1)
  })

  it('retries storeEncryptedSeed method until successful when an unkown error occurs during confirm signup', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(WalletStorageService, 'adminConfirmUser')

    walletStub.onCall(0).throws('UNKNOWN')
    walletStub.onCall(1).throws('UNKNOWN')
    walletStub.onCall(2).throws('UNKNOWN')

    await CommonNetworkMember.confirmSignUp(signUpResponseToken, confirmationCode, options)

    expect(walletStub.callCount).to.eql(4)
  })

  it('retries storeEncryptedSeed method until successful when an unkown error occurs during confirm signup, but only 3 times', async () => {
    await stubConfirmAuthRequests({ password: walletPassword, seedHex, didDocument: joloDidDocument })

    sinon.stub(WalletStorageService, 'adminConfirmUser')

    walletStub.onCall(0).throws('UNKNOWN')
    walletStub.onCall(1).throws('UNKNOWN')
    walletStub.onCall(2).throws('UNKNOWN')
    walletStub.onCall(3).throws('UNKNOWN')
    walletStub.onCall(4).throws('UNKNOWN')

    let errorCode

    try {
      await CommonNetworkMember.confirmSignUp(signUpResponseToken, confirmationCode, options)
    } catch (error) {
      errorCode = error.code
    }

    expect(errorCode).to.eq('COR-18')
    expect(walletStub.callCount).to.eql(4)
  })

  it('throws error when multiple parameters have wrong format for static method', async () => {
    const token = 12345678
    const options = { didMethod: 'nacl' }

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await CommonNetworkMember.completeLoginChallenge(token, null, options, options)
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage1 } = context.errors[0]
    const { message: contextMessage2 } = context.errors[1]
    const [
      {
        message: { isIn },
      },
    ] = context.errors[2]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Parameter "12345678" should be a string.')
    expect(contextMessage2).to.eql('Required parameter at index [1] is missing.')
    expect(isIn).to.eql('didMethod must be one of the following values: jolo,elem')
  })

  it('#getSignedCredentials', async () => {
    sinon.stub(WalletStorageService, 'pullEncryptedSeed').resolves(encryptedSeedJolo)
    sinon.stub(WalletStorageService, 'pullEncryptionKey').resolves(walletPassword)
    sinon.stub(WalletStorageService, 'getCredentialOffer').resolves(credentialOfferToken)
    sinon.stub(WalletStorageService, 'getSignedCredentials').resolves([signedCredential])

    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const returnedCredentials = await networkMember.getSignupCredentials(idToken)

    expect(returnedCredentials[0]).to.equal(signedCredential)
  })

  it('#getSignedCredentials throws error when multiple parameters have wrong format', async () => {
    const options = {}
    const badToken = 12345678

    const networkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    let validationError

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await networkMember.getSignupCredentials(badToken, options)
    } catch (error) {
      validationError = error
    }

    const { name, message, context } = validationError
    const { message: contextMessage1 } = context.errors[0]

    expect(name).to.eql('COR-1')
    expect(message).to.eql('Invalid operation parameters.')
    expect(contextMessage1).to.eql('Parameter "12345678" should be a string.')
  })

  it('#signCredentials', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJzZWxlY3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoi' +
      'VGVzdERlbmlzQ3JlZCJ9XX0sImV4cCI6MTU4NDUxODk4MTE0OSwidHlwIjoiY3JlZGVudGlhb' +
      'E9mZmVyUmVzcG9uc2UiLCJqdGkiOiIxZjIyMTVjMjc5ZDczZWY5IiwiYXVkIjoiZGlkOmpvbG' +
      '86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk3YWQ0MzA4YTRhNjg2ZjhlZGE3MDl' +
      'mMzM4N2QzMDNlNiIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0' +
      'MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5cy0xIn0.5c144a384' +
      'f5fb69501e92c8251eea4f065f02b19c9af39f9e0cffd66c400462a460f1e03955a55af9b' +
      'df600459628ed7d11da9cafc255c4e9a89b4baea4e083f'

    const credentials = [
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '+1 555 555 5555',
            },
          },
          holder: { id: 'placeholder' },
          type: ['PhoneCredentialPersonV1', 'TestDenisCred'],
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
      }),
    ]

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)
    const signedCredentials = await commonNetworkMember.signCredentials(credentialOfferResponseToken, credentials)

    expect(signedCredentials).to.exist
    expect(signedCredentials).have.lengthOf(1)
    expect(signedCredentials[0].type).to.deep.equal(credentials[0].type)

    if (Array.isArray(signedCredentials[0].credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(signedCredentials[0].credentialSubject.data).to.contain.keys('telephone')
      expect((signedCredentials[0].credentialSubject as VCSPhonePersonV1).data['telephone']).to.equal('+1 555 555 5555')
    }
  })

  it("#signCredentials throws a COR-22 error when the response token doesn't cover the provided credential", async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJzZWxlY3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoi' +
      'VGVzdERlbmlzQ3JlZCJ9XX0sImV4cCI6MTU4NDUxODk4MTE0OSwidHlwIjoiY3JlZGVudGlhb' +
      'E9mZmVyUmVzcG9uc2UiLCJqdGkiOiIxZjIyMTVjMjc5ZDczZWY5IiwiYXVkIjoiZGlkOmpvbG' +
      '86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk3YWQ0MzA4YTRhNjg2ZjhlZGE3MDl' +
      'mMzM4N2QzMDNlNiIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0' +
      'MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5cy0xIn0.5c144a384' +
      'f5fb69501e92c8251eea4f065f02b19c9af39f9e0cffd66c400462a460f1e03955a55af9b' +
      'df600459628ed7d11da9cafc255c4e9a89b4baea4e083f'

    const credentials = [
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
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

    let responseError

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)
    try {
      await commonNetworkMember.signCredentials(credentialOfferResponseToken, credentials)
    } catch (error) {
      responseError = error as SdkError
    }

    const { message, code } = responseError
    expect(message).to.equal(
      'Offered credential types do not match any supplied credentials for signing. Check for type name mismatch.',
    )
    expect(code).to.equal('COR-22')
  })

  it('#signCredentials (jolo)', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJzZWxlY3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoi' +
      'VGVzdERlbmlzQ3JlZCJ9XX0sImV4cCI6MTU4NDUxODk4MTE0OSwidHlwIjoiY3JlZGVudGlhb' +
      'E9mZmVyUmVzcG9uc2UiLCJqdGkiOiIxZjIyMTVjMjc5ZDczZWY5IiwiYXVkIjoiZGlkOmpvbG' +
      '86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk3YWQ0MzA4YTRhNjg2ZjhlZGE3MDl' +
      'mMzM4N2QzMDNlNiIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0' +
      'MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5cy0xIn0.5c144a384' +
      'f5fb69501e92c8251eea4f065f02b19c9af39f9e0cffd66c400462a460f1e03955a55af9b' +
      'df600459628ed7d11da9cafc255c4e9a89b4baea4e083f'

    const credentials = [
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '+1 555 555 5555',
            },
          },
          holder: { id: 'placeholder' },
          type: ['PhoneCredentialPersonV1', 'TestDenisCred'],
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
      }),
    ]

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)
    const signedCredentials = await commonNetworkMember.signCredentials(credentialOfferResponseToken, credentials)

    expect(signedCredentials).to.exist
    expect(signedCredentials).have.lengthOf(1)
    expect(signedCredentials[0].type).to.deep.equal(credentials[0].type)
    if (Array.isArray(signedCredentials[0].credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(signedCredentials[0].credentialSubject.data).to.contain.keys('telephone')
      expect((signedCredentials[0].credentialSubject as VCSPhonePersonV1).data['telephone']).to.equal('+1 555 555 5555')
    }
  })

  it('#signCredentials (elem)', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9rdWRvc19vZmZlcmluZy8iLCJzZWxlY3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoi' +
      'VGVzdERlbmlzQ3JlZCJ9XX0sImV4cCI6MTU4NDUxODk4MTE0OSwidHlwIjoiY3JlZGVudGlhb' +
      'E9mZmVyUmVzcG9uc2UiLCJqdGkiOiIxZjIyMTVjMjc5ZDczZWY5IiwiYXVkIjoiZGlkOmpvbG' +
      '86ZjU1OTI2NWI2YzFiZWNkNTYxMDljNTYyMzQzNWZhNzk3YWQ0MzA4YTRhNjg2ZjhlZGE3MDl' +
      'mMzM4N2QzMDNlNiIsImlzcyI6ImRpZDpqb2xvOmY1NTkyNjViNmMxYmVjZDU2MTA5YzU2MjM0' +
      'MzVmYTc5N2FkNDMwOGE0YTY4NmY4ZWRhNzA5ZjMzODdkMzAzZTYja2V5cy0xIn0.5c144a384' +
      'f5fb69501e92c8251eea4f065f02b19c9af39f9e0cffd66c400462a460f1e03955a55af9b' +
      'df600459628ed7d11da9cafc255c4e9a89b4baea4e083f'

    const credentials = [
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '+1 555 555 5555',
            },
          },
          holder: { id: 'placeholder' },
          type: ['PhoneCredentialPersonV1', 'TestDenisCred'],
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
        expirationDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
      }),
    ]

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem)
    const signedCredentials = await commonNetworkMember.signCredentials(credentialOfferResponseToken, credentials)

    expect(signedCredentials).to.exist
    expect(signedCredentials).have.lengthOf(1)
    expect(signedCredentials[0].type).to.deep.equal(credentials[0].type)
    if (Array.isArray(signedCredentials[0].credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(signedCredentials[0].credentialSubject.data).to.contain.keys('telephone')
      expect((signedCredentials[0].credentialSubject as VCSPhonePersonV1).data['telephone']).to.equal('+1 555 555 5555')
    }
  })

  it('#signCredential', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic2VsZWN0ZWRDcmVkZW50aWFscyI6W3sidHlw' +
      'ZSI6Ikt1ZG9zIiwicmVuZGVySW5mbyI6eyJsb2dvIjp7InVybCI6Imh0dHBzOi8vc3RhdGljL' +
      'mFmZmluaXR5LXByb2plY3Qub3JnL2xvZ28ucG5nIn0sImJhY2tncm91bmQiOnsidXJsIjoiaH' +
      'R0cHM6Ly9zdGF0aWMuYWZmaW5pdHktcHJvamVjdC5vcmcvYmFja2dyb3VuZC5wbmcifSwidGV' +
      '4dCI6eyJjb2xvciI6IiNmZmZmZmYifSwicmVuZGVyQXMiOiJkb2N1bWVudCJ9LCJtZXRhZGF0' +
      'YSI6eyJhc3luY2hyb25vdXMiOmZhbHNlfX1dfSwidHlwIjoiY3JlZGVudGlhbE9mZmVyUmVzc' +
      'G9uc2UiLCJpYXQiOjE1NzkxNzIzODUxMDEsImV4cCI6MTU3OTE3NTk4NTEwMSwiYXVkIjoiZG' +
      'lkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmOWY0NjJkMWZ' +
      'jOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjNiNzA4NDk5YWZmNDMiLCJpc3MiOiJkaWQ6am9s' +
      'bzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0NjljODIwMDdmZ' +
      'mYxM2UwNzY1NjQxI2tleXMtMSJ9.54953b6ae61625aa8be21a038707265efd9b03db20ad8' +
      '10356029519188e92ae7bc61763f23c1d01dcb45ab1be130cbe2ea45890fbe35649a58786' +
      'ee5bec8945'

    const credentialSubject: VCSPhonePersonV1 = {
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '+1 555 555 5555',
      },
    }

    const credentialMetadata = {
      context: [getVCPhonePersonV1Context()],
      name: 'Phone Number',
      type: ['PhoneCredentialPersonV1'],
    }

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    const credential = await commonNetworkMember.signCredential(credentialSubject, credentialMetadata, {
      credentialOfferResponseToken,
    })

    expect(credential).to.exist
    expect(credential.holder.id).to.eq('did:jolo:ba44e47bc593650e53b6925afa3ae5a66658a6edac469c82007fff13e0765641')
    expect(credential.proof).to.exist
    expect(credential.proof).to.have.property('jws')
    expect(credential.type[1]).to.deep.equal(credentialMetadata.type[0])
    if (Array.isArray(credential.credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(credential.credentialSubject.data).to.contain.keys('telephone')
    }
  })

  it('#signCredential (jolo)', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic2VsZWN0ZWRDcmVkZW50aWFscyI6W3sidHlw' +
      'ZSI6Ikt1ZG9zIiwicmVuZGVySW5mbyI6eyJsb2dvIjp7InVybCI6Imh0dHBzOi8vc3RhdGljL' +
      'mFmZmluaXR5LXByb2plY3Qub3JnL2xvZ28ucG5nIn0sImJhY2tncm91bmQiOnsidXJsIjoiaH' +
      'R0cHM6Ly9zdGF0aWMuYWZmaW5pdHktcHJvamVjdC5vcmcvYmFja2dyb3VuZC5wbmcifSwidGV' +
      '4dCI6eyJjb2xvciI6IiNmZmZmZmYifSwicmVuZGVyQXMiOiJkb2N1bWVudCJ9LCJtZXRhZGF0' +
      'YSI6eyJhc3luY2hyb25vdXMiOmZhbHNlfX1dfSwidHlwIjoiY3JlZGVudGlhbE9mZmVyUmVzc' +
      'G9uc2UiLCJpYXQiOjE1NzkxNzIzODUxMDEsImV4cCI6MTU3OTE3NTk4NTEwMSwiYXVkIjoiZG' +
      'lkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmOWY0NjJkMWZ' +
      'jOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjNiNzA4NDk5YWZmNDMiLCJpc3MiOiJkaWQ6am9s' +
      'bzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0NjljODIwMDdmZ' +
      'mYxM2UwNzY1NjQxI2tleXMtMSJ9.54953b6ae61625aa8be21a038707265efd9b03db20ad8' +
      '10356029519188e92ae7bc61763f23c1d01dcb45ab1be130cbe2ea45890fbe35649a58786' +
      'ee5bec8945'

    const credentialSubject: VCSPhonePersonV1 = {
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '+1 555 555 5555',
      },
    }

    const credentialMetadata = {
      context: [getVCPhonePersonV1Context()],
      name: 'Phone Number',
      type: ['PhoneCredentialPersonV1'],
    }

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    const credential = await commonNetworkMember.signCredential(credentialSubject, credentialMetadata, {
      credentialOfferResponseToken,
    })

    expect(credential).to.exist
    expect(credential.proof).to.exist
    expect(credential.proof).to.have.property('jws')
    expect(credential.type[1]).to.deep.equal(credentialMetadata.type[0])
    if (Array.isArray(credential.credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(credential.credentialSubject.data).to.contain.keys('telephone')
    }
  })

  it('#signCredential (elem)', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic2VsZWN0ZWRDcmVkZW50aWFscyI6W3sidHlw' +
      'ZSI6Ikt1ZG9zIiwicmVuZGVySW5mbyI6eyJsb2dvIjp7InVybCI6Imh0dHBzOi8vc3RhdGljL' +
      'mFmZmluaXR5LXByb2plY3Qub3JnL2xvZ28ucG5nIn0sImJhY2tncm91bmQiOnsidXJsIjoiaH' +
      'R0cHM6Ly9zdGF0aWMuYWZmaW5pdHktcHJvamVjdC5vcmcvYmFja2dyb3VuZC5wbmcifSwidGV' +
      '4dCI6eyJjb2xvciI6IiNmZmZmZmYifSwicmVuZGVyQXMiOiJkb2N1bWVudCJ9LCJtZXRhZGF0' +
      'YSI6eyJhc3luY2hyb25vdXMiOmZhbHNlfX1dfSwidHlwIjoiY3JlZGVudGlhbE9mZmVyUmVzc' +
      'G9uc2UiLCJpYXQiOjE1NzkxNzIzODUxMDEsImV4cCI6MTU3OTE3NTk4NTEwMSwiYXVkIjoiZG' +
      'lkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmOWY0NjJkMWZ' +
      'jOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjNiNzA4NDk5YWZmNDMiLCJpc3MiOiJkaWQ6am9s' +
      'bzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0NjljODIwMDdmZ' +
      'mYxM2UwNzY1NjQxI2tleXMtMSJ9.54953b6ae61625aa8be21a038707265efd9b03db20ad8' +
      '10356029519188e92ae7bc61763f23c1d01dcb45ab1be130cbe2ea45890fbe35649a58786' +
      'ee5bec8945'

    const credentialSubject: VCSPhonePersonV1 = {
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '+1 555 555 5555',
      },
    }

    const credentialMetadata = {
      context: [getVCPhonePersonV1Context()],
      name: 'Phone Number',
      type: ['PhoneCredentialPersonV1'],
    }

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem)

    const credential = await commonNetworkMember.signCredential(credentialSubject, credentialMetadata, {
      credentialOfferResponseToken,
    })

    expect(credential).to.exist
    expect(credential.holder.id).to.eq('did:jolo:ba44e47bc593650e53b6925afa3ae5a66658a6edac469c82007fff13e0765641')
    expect(credential.proof).to.exist
    expect(credential.proof).to.have.property('jws')
    expect(credential.type[1]).to.deep.equal(credentialMetadata.type[0])
    if (Array.isArray(credential.credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(credential.credentialSubject.data).to.contain.keys('telephone')
    }
  })

  it('#signCredential (elem) without credentialOfferResponseToken', async () => {
    const credentialSubject: VCSPhonePersonV1 = {
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '+1 555 555 5555',
      },
    }

    const credentialMetadata = {
      context: [getVCPhonePersonV1Context()],
      name: 'Phone Number',
      type: ['PhoneCredentialPersonV1'],
    }

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem)

    const credential = await commonNetworkMember.signCredential(credentialSubject, credentialMetadata, {
      requesterDid: didElem,
    })

    expect(credential).to.exist
    expect(credential.holder.id).to.eq(didElemShortForm)
    expect(credential.proof).to.exist
    expect(credential.proof).to.have.property('jws')
    expect(credential.type[1]).to.deep.equal(credentialMetadata.type[0])
    if (Array.isArray(credential.credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(credential.credentialSubject.data).to.contain.keys('telephone')
    }
  })

  it('#signCredential throws when expiresAt is in the past', async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic2VsZWN0ZWRDcmVkZW50aWFscyI6W3sidHlw' +
      'ZSI6Ikt1ZG9zIiwicmVuZGVySW5mbyI6eyJsb2dvIjp7InVybCI6Imh0dHBzOi8vc3RhdGljL' +
      'mFmZmluaXR5LXByb2plY3Qub3JnL2xvZ28ucG5nIn0sImJhY2tncm91bmQiOnsidXJsIjoiaH' +
      'R0cHM6Ly9zdGF0aWMuYWZmaW5pdHktcHJvamVjdC5vcmcvYmFja2dyb3VuZC5wbmcifSwidGV' +
      '4dCI6eyJjb2xvciI6IiNmZmZmZmYifSwicmVuZGVyQXMiOiJkb2N1bWVudCJ9LCJtZXRhZGF0' +
      'YSI6eyJhc3luY2hyb25vdXMiOmZhbHNlfX1dfSwidHlwIjoiY3JlZGVudGlhbE9mZmVyUmVzc' +
      'G9uc2UiLCJpYXQiOjE1NzkxNzIzODUxMDEsImV4cCI6MTU3OTE3NTk4NTEwMSwiYXVkIjoiZG' +
      'lkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmOWY0NjJkMWZ' +
      'jOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjNiNzA4NDk5YWZmNDMiLCJpc3MiOiJkaWQ6am9s' +
      'bzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0NjljODIwMDdmZ' +
      'mYxM2UwNzY1NjQxI2tleXMtMSJ9.54953b6ae61625aa8be21a038707265efd9b03db20ad8' +
      '10356029519188e92ae7bc61763f23c1d01dcb45ab1be130cbe2ea45890fbe35649a58786' +
      'ee5bec8945'

    const credentialSubject: VCSPhonePersonV1 = {
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '+1 555 555 5555',
      },
    }

    const credentialMetadata = {
      context: [getVCPhonePersonV1Context()],
      name: 'Phone Number',
      type: ['PhoneCredentialPersonV1'],
    }

    const expiresAt = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    let responseError

    try {
      await commonNetworkMember.signCredential(
        credentialSubject,
        credentialMetadata,
        { credentialOfferResponseToken },
        expiresAt,
      )
    } catch (error) {
      responseError = error
    }

    const { message } = responseError

    expect(message).to.equal('Expiry date should be greater than current date')
  })

  it("#signCredential doesn't throw when expiresAt is in the future", async () => {
    const credentialOfferResponseToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNhbG' +
      'xiYWNrVVJMIjoiaHR0cHM6Ly9rdWRvcy1pc3N1ZXItYmFja2VuZC5hZmZpbml0eS1wcm9qZWN' +
      '0Lm9yZy9yZWNlaXZlL3Rlc3RlckJhZGdlIiwic2VsZWN0ZWRDcmVkZW50aWFscyI6W3sidHlw' +
      'ZSI6Ikt1ZG9zIiwicmVuZGVySW5mbyI6eyJsb2dvIjp7InVybCI6Imh0dHBzOi8vc3RhdGljL' +
      'mFmZmluaXR5LXByb2plY3Qub3JnL2xvZ28ucG5nIn0sImJhY2tncm91bmQiOnsidXJsIjoiaH' +
      'R0cHM6Ly9zdGF0aWMuYWZmaW5pdHktcHJvamVjdC5vcmcvYmFja2dyb3VuZC5wbmcifSwidGV' +
      '4dCI6eyJjb2xvciI6IiNmZmZmZmYifSwicmVuZGVyQXMiOiJkb2N1bWVudCJ9LCJtZXRhZGF0' +
      'YSI6eyJhc3luY2hyb25vdXMiOmZhbHNlfX1dfSwidHlwIjoiY3JlZGVudGlhbE9mZmVyUmVzc' +
      'G9uc2UiLCJpYXQiOjE1NzkxNzIzODUxMDEsImV4cCI6MTU3OTE3NTk4NTEwMSwiYXVkIjoiZG' +
      'lkOmpvbG86YjJkNWQ4ZDZjYzE0MDAzMzQxOWI1NGEyMzdhNWRiNTE3MTA0MzlmOWY0NjJkMWZ' +
      'jOThmNjk4ZWNhN2NlOTc3NyIsImp0aSI6IjNiNzA4NDk5YWZmNDMiLCJpc3MiOiJkaWQ6am9s' +
      'bzpiYTQ0ZTQ3YmM1OTM2NTBlNTNiNjkyNWFmYTNhZTVhNjY2NThhNmVkYWM0NjljODIwMDdmZ' +
      'mYxM2UwNzY1NjQxI2tleXMtMSJ9.54953b6ae61625aa8be21a038707265efd9b03db20ad8' +
      '10356029519188e92ae7bc61763f23c1d01dcb45ab1be130cbe2ea45890fbe35649a58786' +
      'ee5bec8945'

    const credentialSubject: VCSPhonePersonV1 = {
      data: {
        '@type': ['Person', 'PersonE', 'PhonePerson'],
        telephone: '+1 555 555 5555',
      },
    }

    const credentialMetadata = {
      context: [getVCPhonePersonV1Context()],
      name: 'Phone Number',
      type: ['PhoneCredentialPersonV1'],
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    const credential = await commonNetworkMember.signCredential(
      credentialSubject,
      credentialMetadata,
      { credentialOfferResponseToken },
      expiresAt,
    )

    expect(credential).to.exist
    expect(credential.proof).to.exist
    expect(credential.type[1]).to.deep.equal(credentialMetadata.type[0])
    if (Array.isArray(credential.credentialSubject)) {
      expect.fail('Should not be an array')
    } else {
      expect(credential.credentialSubject.data).to.contain.keys('telephone')
    }

    expect(credential).to.contain.keys('expirationDate')
  })

  it('#initiatePhoneCredential calls PhoneIssuerService.initiate with the correct params', async () => {
    const stub = sinon.stub(PhoneIssuerService.prototype, 'initiate')

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    await commonNetworkMember.initiatePhoneCredential({
      apiKey: 'apiKey',
      phoneNumber: 'phoneNumber',
      isWhatsAppNumber: true,
      id: 'id',
      holder: 'holder',
    })

    expect(stub.calledOnce).to.be.true
    expect(stub.getCalls()[0].args[0]).to.deep.eq({
      apiKey: 'apiKey',
      phoneNumber: 'phoneNumber',
      isWhatsAppNumber: true,
      id: 'id',
      holder: 'holder',
    })
  })

  it('#verifyPhoneCredential calls PhoneIssuerService.verify with the correct params', async () => {
    const stub = sinon.stub(PhoneIssuerService.prototype, 'verify')

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    await commonNetworkMember.verifyPhoneCredential({
      apiKey: 'apiKey',
      code: 'code',
      id: 'id',
      holder: 'holder',
    })

    expect(stub.calledOnce).to.be.true
    expect(stub.getCalls()[0].args[0]).to.deep.eq({
      apiKey: 'apiKey',
      code: 'code',
      id: 'id',
      holder: 'holder',
    })
  })

  it('#initiateEmailCredential calls EmailIssuerService.initiate with the correct params', async () => {
    const stub = sinon.stub(EmailIssuerService.prototype, 'initiate')

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    await commonNetworkMember.initiateEmailCredential({
      apiKey: 'apiKey',
      emailAddress: 'emailAddress',
      id: 'id',
      holder: 'holder',
    })

    expect(stub.calledOnce).to.be.true
    expect(stub.getCalls()[0].args[0]).to.deep.eq({
      apiKey: 'apiKey',
      emailAddress: 'emailAddress',
      id: 'id',
      holder: 'holder',
    })
  })

  it('#verifyEmailCredential calls EmailIssuerService.verify with the correct params', async () => {
    const stub = sinon.stub(EmailIssuerService.prototype, 'verify')

    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo)

    await commonNetworkMember.verifyEmailCredential({
      apiKey: 'apiKey',
      code: 'code',
      id: 'id',
      holder: 'holder',
    })

    expect(stub.calledOnce).to.be.true
    expect(stub.getCalls()[0].args[0]).to.deep.eq({
      apiKey: 'apiKey',
      code: 'code',
      id: 'id',
      holder: 'holder',
    })
  })

  it('#generatePresentationChallenge returns a jwt', async () => {
    const commonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)

    const presentationChallenge = await commonNetworkMember.generatePresentationChallenge([
      { type: ['PhoneCredentialPersonV1'] },
    ])

    expect(presentationChallenge).to.exist
  })

  it('#createPresentationFromChallenge returns a signed VPV1', async () => {
    const affinity = new Affinity()
    const requesterCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)
    const userCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem, options)

    const vc = await affinity.signCredential(
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '555 555 5555',
            },
          },
          holder: { id: didElem },
          type: 'PhoneCredentialPersonV1',
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
      }),
      encryptedSeedJolo,
      walletPassword,
    )

    const presentationChallenge = await requesterCommonNetworkMember.generatePresentationChallenge([
      { type: ['VerifiableCredential', 'PhoneCredentialPersonV1'] },
    ])

    const vp = await userCommonNetworkMember.createPresentationFromChallenge(presentationChallenge, [vc], 'domain')

    expect(vp).to.exist
    expect(vp.proof.challenge).to.eq(presentationChallenge)
    expect(vp.proof.domain).to.eq('domain')
    expect(vp.verifiableCredential).to.deep.eq([vc])
  })

  it('#createPresentationFromChallenge filters VCs based on the challenge', async () => {
    const affinity = new Affinity()
    const requesterCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)
    const userCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem, options)

    const emailVC = await affinity.signCredential(
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSEmailPersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'EmailPerson'],
              email: 'bob@bobsburgers.com',
            },
          },
          holder: { id: didElem },
          type: 'EmailCredentialPersonV1',
          context: getVCEmailPersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
      }),
      encryptedSeedJolo,
      walletPassword,
    )

    const phoneVC = await affinity.signCredential(
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '555 555 5555',
            },
          },
          holder: { id: didElem },
          type: 'PhoneCredentialPersonV1',
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
      }),
      encryptedSeedJolo,
      walletPassword,
    )

    const presentationChallenge = await requesterCommonNetworkMember.generatePresentationChallenge([
      { type: ['VerifiableCredential', 'PhoneCredentialPersonV1'] },
    ])

    const vp = await userCommonNetworkMember.createPresentationFromChallenge(
      presentationChallenge,
      [emailVC, phoneVC],
      'domain',
    )

    expect(vp).to.exist
    expect(vp.proof.challenge).to.eq(presentationChallenge)
    expect(vp.proof.domain).to.eq('domain')
    expect(vp.verifiableCredential).to.deep.eq([phoneVC])
  })

  it('#verifyPresentation', async () => {
    // TODO resolve why this is failing
    const affinity = new Affinity()
    const requesterCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem, options)
    const userCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElemAlt, options)

    const vc = await affinity.signCredential(
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '555 555 5555',
            },
          },
          holder: { id: didElemAlt },
          type: 'PhoneCredentialPersonV1',
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
      }),
      encryptedSeedElem,
      walletPassword,
    )

    const presentationChallenge = await requesterCommonNetworkMember.generatePresentationChallenge([
      { type: ['VerifiableCredential', 'PhoneCredentialPersonV1'] },
    ])

    const vp = await userCommonNetworkMember.createPresentationFromChallenge(presentationChallenge, [vc], 'domain')

    const result = await requesterCommonNetworkMember.verifyPresentation(vp)

    if (result.isValid === true) {
      expect(result.did).to.eq(didElem)
      expect(result.challenge).to.eq(presentationChallenge)
      expect(result.suppliedPresentation).to.deep.eq(vp)
    } else {
      expect(result.suppliedPresentation).to.deep.eq(vp)
      expect.fail(result.errors.join('\n'))
    }
  })

  it("#verifyPresentation fails when the challenge wasn't signed by the correct party", async () => {
    const affinity = new Affinity()
    const requesterCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)
    const userCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem, options)

    const vc = await affinity.signCredential(
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '555 555 5555',
            },
          },
          holder: { id: didElem },
          type: 'PhoneCredentialPersonV1',
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
      }),
      encryptedSeedJolo,
      walletPassword,
    )

    const presentationChallenge = await userCommonNetworkMember.generatePresentationChallenge([
      { type: ['VerifiableCredential', 'PhoneCredentialPersonV1'] },
    ])

    const vp = await userCommonNetworkMember.createPresentationFromChallenge(presentationChallenge, [vc], 'domain')

    const result = await requesterCommonNetworkMember.verifyPresentation(vp)

    expect(result.isValid).to.be.false
  })

  it('#verifyPresentation fails when the challenge is tampered with', async () => {
    const affinity = new Affinity()
    const requesterCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedJolo, options)
    const userCommonNetworkMember = new CommonNetworkMember(walletPassword, encryptedSeedElem, options)

    const vc = await affinity.signCredential(
      buildVCV1Unsigned({
        skeleton: buildVCV1Skeleton<VCSPhonePersonV1>({
          id: 'urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          credentialSubject: {
            data: {
              '@type': ['Person', 'PersonE', 'PhonePerson'],
              telephone: '555 555 5555',
            },
          },
          holder: { id: didElem },
          type: 'PhoneCredentialPersonV1',
          context: getVCPhonePersonV1Context(),
        }),
        issuanceDate: new Date().toISOString(),
      }),
      encryptedSeedJolo,
      walletPassword,
    )

    const presentationChallenge = await requesterCommonNetworkMember.generatePresentationChallenge([
      { type: ['VerifiableCredential', 'PhoneCredentialPersonV1'] },
    ])

    const token = Affinity.fromJwt(presentationChallenge)
    token.payload.interactionToken.credentialRequirements = []
    const tamperedChallenge = Affinity.encodeObjectToJWT(token)

    const vp = await userCommonNetworkMember.createPresentationFromChallenge(tamperedChallenge, [vc], 'domain')

    const result = await requesterCommonNetworkMember.verifyPresentation(vp)

    expect(result.isValid).to.be.false
  })
})
