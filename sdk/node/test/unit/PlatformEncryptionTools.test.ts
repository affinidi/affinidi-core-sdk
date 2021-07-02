'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { KeysService } from '@affinidi/common'

import platformEncryptionTools, { PlatformEncryptionTools } from '../../src/PlatformEncryptionTools'
import { generateTestDIDs } from '../factory/didFactory'
import { stubDecryptSeed } from '../unit/stubs'

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
    const privateKey = keysService.getOwnPrivateKey()
    const response = await platformEncryptionTools.decryptByPrivateKey(privateKey, badEncryptedDataObjectString)

    expect(response).to.eql(badEncryptedDataObject)
  })
})
