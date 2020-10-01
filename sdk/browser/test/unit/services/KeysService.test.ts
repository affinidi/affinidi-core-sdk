'use strict'

import sinon from 'sinon'
import { expect } from 'chai'

import KeysService from '../../../src/services/KeysService'

import { generateTestDIDs } from '../../factory/didFactory'

import { stubDecryptSeed } from '../../unit/stubs'

let seed: string
let password: string
let encryptedSeed: string

describe('KeysService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    password = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
    seed = testDids.elem.seedHex
  })
  afterEach(() => {
    sinon.restore()
  })

  it('#decryptSeed', async () => {
    const keysService = new KeysService(encryptedSeed, password)

    const { seed: decryptSeed, didMethod } = keysService.decryptSeed()
    const seedHex = decryptSeed.toString('hex')

    expect(didMethod).to.exist
    expect(seedHex).to.exist
    expect(seedHex).to.be.equal(seed)
  })

  it('#getEphemKeyPair', async () => {
    const stub = sinon.stub(KeysService.prototype as any, 'isValidPrivateKey')

    stub.onFirstCall().returns(false)
    stub.onSecondCall().returns(true)

    const keysService = new KeysService(encryptedSeed, password)
    const response = await keysService.getEphemKeyPair()

    expect(response).to.exist
  })

  it('#decryptByPrivateKey', async () => {
    stubDecryptSeed(seed, 'elem')

    const badEncryptedDataObject = { mac: 'iv, ephemPublicKey, ciphertext - missing' }

    const badEncryptedDataObjectString = JSON.stringify(badEncryptedDataObject)

    const keysService = new KeysService(encryptedSeed, password)
    const response = await keysService.decryptByPrivateKey(badEncryptedDataObjectString)

    expect(response).to.eql(badEncryptedDataObject)
  })
})
