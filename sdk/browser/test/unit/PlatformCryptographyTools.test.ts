'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { KeysService } from '@affinidi/common'
import { hmacSha256Verify } from 'eccrypto-js'

import platformCryptographyTools from '../../src/PlatformCryptographyTools'
import { generateTestDIDs } from '../factory/didFactory'
import { stubDecryptSeed } from '../unit/stubs'
const signedCredential = require('../factory/signedCredential')

let seed: string
let password: string
let encryptedSeed: string

describe('PlatformCryptographyTools', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    password = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
    seed = testDids.elem.seedHex
  })
  afterEach(() => {
    sinon.restore()
  })

  it('#decryptByPrivateKey', async () => {
    stubDecryptSeed(seed, 'elem')

    const badEncryptedDataObject = { mac: 'iv, ephemPublicKey, ciphertext - missing' }

    const badEncryptedDataObjectString = JSON.stringify(badEncryptedDataObject)

    const keysService = new KeysService(encryptedSeed, password)
    const privateKey = keysService.getOwnPrivateKey()
    const response = await platformCryptographyTools.decryptByPrivateKey(privateKey, badEncryptedDataObjectString)

    expect(response).to.eql(badEncryptedDataObject)
  })

  it('#computePersonalHash', async () => {
    const keysService = new KeysService(encryptedSeed, password)
    const privateKey = keysService.getOwnPrivateKey()

    const hash = await platformCryptographyTools.computePersonalHash(privateKey, signedCredential.id)
    const result = await hmacSha256Verify(privateKey, Buffer.from(signedCredential.id), Buffer.from(hash, 'hex'))

    expect(result).to.true
  })

  it('#computePersonalHashWithSameArguments', async () => {
    const keysService = new KeysService(encryptedSeed, password)
    const privateKey = keysService.getOwnPrivateKey()

    const firstHash = await platformCryptographyTools.computePersonalHash(privateKey, signedCredential.id)
    const secondHash = await platformCryptographyTools.computePersonalHash(privateKey, signedCredential.id)

    expect(firstHash).to.eql(secondHash)
  })
})
