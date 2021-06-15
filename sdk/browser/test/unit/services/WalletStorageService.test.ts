'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { KeysService } from '@affinidi/common'
import { __dangerous } from '@affinidi/wallet-core-sdk'

import { stubDecryptSeed } from '../../unit/stubs'
import { generateTestDIDs } from '../../factory/didFactory'
import platformEncryptionTools, { PlatformEncryptionTools } from '../../../src/PlatformEncryptionTools'

const { WalletStorageService } = __dangerous

let seed: string
let password: string

let encryptedSeed: string

let walletStorageService: InstanceType<typeof WalletStorageService>

describe('WalletStorageService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    password = testDids.password
    encryptedSeed = testDids.elem.encryptedSeed
    seed = testDids.elem.seedHex
  })
  beforeEach(() => {
    stubDecryptSeed(seed, 'elem')
    sinon.stub(KeysService, 'getPublicKey')
    sinon.stub(PlatformEncryptionTools.prototype, 'encryptByPublicKey').resolves('encryptedMessage')
    sinon.stub(WalletStorageService.prototype, 'saveCredentials').resolves([])

    const keysService = new KeysService(encryptedSeed, password)
    walletStorageService = new WalletStorageService(keysService, platformEncryptionTools)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#saveUnencryptedCredentials', async () => {
    const response = await walletStorageService.saveUnencryptedCredentials([{ foo: 'bar' }])

    expect(response).to.exist
  })
})
