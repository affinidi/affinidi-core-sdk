'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { KeysService } from '@affinidi/common'
import { hmacSha256Verify } from 'eccrypto-js'

import platformEncryptionTools, { PlatformEncryptionTools } from '../../src/PlatformEncryptionTools'
import { generateTestDIDs } from '../factory/didFactory'
import { stubDecryptSeed } from '../unit/stubs'
const signedCredential = require('../factory/signedCredential')

let seed: string
let password: string
let encryptedSeed: string

describe('PlatformEncryptionTools', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    password = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
    seed = testDids.elem.seedHex
  })
  afterEach(() => {
    sinon.restore()
  })

  it('#getEphemKeyPair', async () => {
    const stub = sinon.stub(PlatformEncryptionTools.prototype, 'isValidPrivateKey')

    stub.onFirstCall().returns(false)
    stub.onSecondCall().returns(true)

    const response = await platformEncryptionTools.getEphemKeyPair()

    expect(response).to.exist
  })

  it('#decryptByPrivateKey', async () => {
    stubDecryptSeed(seed, 'elem')

    const badEncryptedDataObject = { mac: 'iv, ephemPublicKey, ciphertext - missing' }

    const badEncryptedDataObjectString = JSON.stringify(badEncryptedDataObject)

    const keysService = new KeysService(encryptedSeed, password)
    const privateKeyBuffer = keysService.getOwnPrivateKey()
    const response = await platformEncryptionTools.decryptByPrivateKey(privateKeyBuffer, badEncryptedDataObjectString)

    expect(response).to.eql(badEncryptedDataObject)
  })

  it('#computePersonalHash', async () => {
    const keysService = new KeysService(encryptedSeed, password)
    const privateKey = keysService.getOwnPrivateKey()

    const hash = await platformEncryptionTools.computePersonalHash(privateKey, signedCredential.id)
    const result = await hmacSha256Verify(privateKey, Buffer.from(signedCredential.id), Buffer.from(hash, 'hex'))

    expect(result).to.true
  })
})
