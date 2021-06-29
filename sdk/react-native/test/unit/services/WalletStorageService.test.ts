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

// const seed = 'e775df62d6ed8a82068a070a2a7283aac978c6f38c5001ce1e5da41604fde998'
// const didMethod = 'elem'
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
    walletStorageService = new WalletStorageService(keysService, platformEncryptionTools, {
      accessApiKey: undefined,
      vaultUrl: undefined,
      storageRegion: undefined,
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('encryptAndSaveCredentials', async () => {
    const response = await walletStorageService.encryptAndSaveCredentials([{ foo: 'bar' }])

    expect(response).to.exist
  })
})
