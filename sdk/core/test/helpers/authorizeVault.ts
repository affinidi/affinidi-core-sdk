import nock from 'nock'
import sinon from 'sinon'

import * as ethereumjsUtils from 'ethereumjs-util'
import { KeysService } from '@affinidi/common'
import { resolveUrl, Service } from '@affinidi/url-resolver'
import { DEFAULT_DID_METHOD } from '../../src/_defaultConfig'
import bip32fromSeedResponse from '../factory/bip32fromSeedResponse'

const bip32 = require('bip32')
const secp256k1 = require('secp256k1')

const bloomVaultUrl = resolveUrl(Service.BLOOM_VAUlT, 'staging')
const didMethod = DEFAULT_DID_METHOD
const seed = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const seedHex = seed.toString('hex')
const seedHexWithMethod = `${seedHex}++${didMethod}`
const decryptSeedResponse: ReturnType<typeof KeysService.decryptSeed> = {
  seed: Buffer.from(seed),
  didMethod,
  seedHexWithMethod,
  externalKeys: null,
  fullSeedHex: null,
}

export const authorizeVault = async () => {
  const token = 'token'

  sinon.stub(KeysService.prototype, 'decryptSeed').returns(decryptSeedResponse)
  sinon.stub(bip32, 'fromSeed').returns(bip32fromSeedResponse)
  sinon.stub(secp256k1, 'publicKeyCreate').returns('publicKey')

  const requestTokenPath = '/auth/request-token'

  nock(bloomVaultUrl)
    .filteringPath(() => requestTokenPath)
    .post(requestTokenPath)
    .reply(200, { token })

  sinon.stub(ethereumjsUtils, 'ecsign').returns({ v: 'v', r: 'r', s: 's' })
  sinon.stub(ethereumjsUtils, 'toRpcSig').returns('signature')

  const validateTokenPath = '/auth/validate-token'

  nock(bloomVaultUrl)
    .filteringPath(() => validateTokenPath)
    .post(validateTokenPath)
    .reply(200, {})

  return token
}

export const authorizeVaultEndpoints = async () => {
  const token = 'token'
  const requestTokenPath = '/auth/request-token'
  const validateTokenPath = '/auth/validate-token'

  nock(bloomVaultUrl)
    .filteringPath(() => requestTokenPath)
    .post(requestTokenPath)
    .reply(200, { token })

  nock(bloomVaultUrl)
    .filteringPath(() => validateTokenPath)
    .post(validateTokenPath)
    .reply(200, {})

  return token
}
