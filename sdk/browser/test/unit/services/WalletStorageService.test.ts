'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { KeysService } from '@affinidi/common'

import { stubDecryptSeed } from '../../unit/stubs'
import { generateTestDIDs } from '../../factory/didFactory'
import { PlatformEncryptionTools } from '../../../src/PlatformEncryptionTools'
import WalletStorageService from '../../../src/services/WalletStorageService'

let seed: string
let password: string

let encryptedSeed: string

let walletStorageService: any

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

    walletStorageService = new WalletStorageService(encryptedSeed, password)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('#createEncryptedMessageByMyKey', async () => {
    const response = await walletStorageService.createEncryptedMessageByMyKey('message')

    expect(response).to.exist
  })

  it('#encryptCredentials', async () => {
    const response = await walletStorageService.encryptCredentials([{ foo: 'bar' }])

    expect(response).to.exist
  })
})
