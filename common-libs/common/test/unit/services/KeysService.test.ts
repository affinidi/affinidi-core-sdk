'use strict'

import { expect } from 'chai'

import KeysService from '../../../src/services/KeysService'
import { DEFAULT_DID_METHOD } from '../../../src/_defaultConfig'

import { generateTestDIDs } from '../../factory/didFactory'

let seedHex: string
let password: string
let encryptedSeed: string
let publicKeyFromSeed: string
let publicEthereumKeyFromSeed: string
let elemRSAEncryptedSeed: string
let elemRSASeedHex: string

import { didDocument } from '../../factory/didDocument'

const doc = {
  firstName: 'Denis',
  lastName: 'Smith',
}

describe('KeysService', () => {
  before(async () => {
    const testDids = await generateTestDIDs()
    password = testDids.password

    encryptedSeed = testDids.jolo.encryptedSeed
    seedHex = testDids.jolo.seedHex
    publicKeyFromSeed = testDids.jolo.publicKey
    publicEthereumKeyFromSeed = testDids.jolo.publicEthereumKey
    elemRSAEncryptedSeed = testDids.elemWithRSA.encryptedSeed
    elemRSASeedHex = testDids.elemWithRSA.seedHex
  })

  it('#decryptSeed', async () => {
    const keysService = new KeysService(encryptedSeed, password)

    const { seed: seedBuffer, didMethod } = keysService.decryptSeed()
    const recoveredSeedHex = seedBuffer.toString('hex')

    expect(didMethod).to.exist
    expect(recoveredSeedHex).to.exist
    expect(recoveredSeedHex).to.be.equal(seedHex)
  })

  it('#decryptSeed with externalKeys', async () => {
    const keysService = new KeysService(elemRSAEncryptedSeed, password)

    const { seed: seedBuffer, externalKeys } = keysService.decryptSeed()
    const recoveredSeedHex = seedBuffer.toString('hex')

    const originalPublicKey = externalKeys[0].public
    const derivedPublicKeyBuffer = keysService.getExternalPublicKey('rsa')
    const derivedPublicKey = derivedPublicKeyBuffer.toString()

    expect(recoveredSeedHex).to.exist
    expect(recoveredSeedHex).to.be.equal(elemRSASeedHex)
    expect(derivedPublicKey).to.be.equal(originalPublicKey)
  })

  it('#decryptSeed with hex password', async () => {
    const hexPassword = Buffer.from(password).toString('hex')

    const keysService = new KeysService(encryptedSeed, hexPassword)

    const { seed: seedBuffer } = keysService.decryptSeed()
    const recoveredSeedHex = seedBuffer.toString('hex')

    expect(recoveredSeedHex).to.exist
    expect(recoveredSeedHex).to.be.equal(seedHex)
  })

  it('#normalizePassword (when password correct length)', async () => {
    const passwordBuffer = KeysService.normalizePassword(password)

    expect(passwordBuffer).to.exist
    expect(passwordBuffer.toString()).to.be.equal(password)
  })

  it('#normalizePassword (when password wrong length)', async () => {
    const passwordBuffer = KeysService.normalizePassword('password')

    expect(passwordBuffer).to.exist
    expect(passwordBuffer.toString()).to.not.be.equal(password)
  })

  it('#getPublicKey', async () => {
    const publicKey = KeysService.getPublicKey(seedHex, 'jolo')
    const publicKeyHex = publicKey.toString('hex')

    expect(publicKeyHex).to.exist
    expect(publicKeyHex).to.be.equal(publicKeyFromSeed)
  })

  it('#getAnchorTransactionPublicKey', async () => {
    const publicEthereumKey = KeysService.getAnchorTransactionPublicKey(seedHex, 'jolo')
    const publicEthereumKeyHex = publicEthereumKey.toString('hex')

    expect(publicEthereumKeyHex).to.exist
    expect(publicEthereumKeyHex).to.be.equal(publicEthereumKeyFromSeed)
  })

  it('#signDidDocument', async () => {
    const keysService = new KeysService(encryptedSeed, password)
    const signedDocument = await keysService.signDidDocument(didDocument)

    expect(signedDocument).to.exist
    expect(signedDocument.proof.signatureValue).to.exist
  })

  it('.encryptSeed/.decryptSeed (when seed without didMethod)', async () => {
    const encryptionKeyBuffer = Buffer.from(password)
    const encryptedSeed = await KeysService.encryptSeed(seedHex, encryptionKeyBuffer)
    expect(encryptedSeed).to.exist

    const { seed: decryptedSeed, didMethod } = KeysService.decryptSeed(encryptedSeed, password)
    expect(didMethod).to.exist
    expect(decryptedSeed).to.exist

    const decryptedSeedHex = decryptedSeed.toString('hex')
    expect(decryptedSeedHex).to.be.equal(seedHex)
    expect(didMethod).to.be.equal(DEFAULT_DID_METHOD)
  })

  it('.encryptSeed/.decryptSeed (when seed with elem didMethod)', async () => {
    const elemDidMethod = 'elem'
    const encryptionKeyBuffer = Buffer.from(password)
    const seedWithMethod = `${seedHex}++${elemDidMethod}`
    const encryptedSeed = await KeysService.encryptSeed(seedWithMethod, encryptionKeyBuffer)
    expect(encryptedSeed).to.exist

    const { seed: decryptedSeed, didMethod } = KeysService.decryptSeed(encryptedSeed, password)
    expect(didMethod).to.exist
    expect(decryptedSeed).to.exist

    const decryptedSeedHex = decryptedSeed.toString('hex')
    expect(decryptedSeedHex).to.be.equal(seedHex)
    expect(didMethod).to.be.equal(elemDidMethod)
  })

  it('#signJWT', async () => {
    const jwtObject = {
      header: {
        typ: 'JWT',
        alg: 'ES256K',
      },
      payload: {
        data: 'data',
        exp: Date.now(),
        typ: 'type',
        jti: '',
        aud: '',
      },
    }

    const keysService = new KeysService(encryptedSeed, password)
    const signedJwtObject = keysService.signJWT(jwtObject)
    expect(signedJwtObject).to.exist
    expect(signedJwtObject.signature).to.exist
    expect(signedJwtObject.payload.iss).to.exist
  })

  it('#sign should return signature for document', async () => {
    const keysService = new KeysService(encryptedSeed, password)

    const stringifiedDocument = JSON.stringify(doc)

    const digest = KeysService.sha256(Buffer.from(stringifiedDocument))
    const signature = keysService.sign(digest)

    expect(signature).to.exist
  })

  it('#verify should return true (valid signature for document)', async () => {
    const keysService = new KeysService(encryptedSeed, password)

    const stringifiedDocument = JSON.stringify(doc)
    const digest = KeysService.sha256(Buffer.from(stringifiedDocument))
    const signature = keysService.sign(digest)

    const { seed, didMethod } = keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    const publicKey = KeysService.getPublicKey(seedHex, didMethod)
    const result = KeysService.verify(digest, publicKey, signature)

    expect(result).to.exist
    expect(result).to.be.equal(true)
  })

  it('#verify should return false (signature not valid for document)', async () => {
    const keysService = new KeysService(encryptedSeed, password)

    const stringifiedOriginalDocument = JSON.stringify(doc)
    const originalDigest = KeysService.sha256(Buffer.from(stringifiedOriginalDocument))
    const signature = keysService.sign(originalDigest)

    const updatedDocument = Object.assign(doc, { lastName: 'Baker' })
    const stringifiedUpdatedDocument = JSON.stringify(updatedDocument)
    const updatedDigest = KeysService.sha256(Buffer.from(stringifiedUpdatedDocument))

    const { seed, didMethod } = KeysService.decryptSeed(encryptedSeed, password)
    const seedHex = seed.toString('hex')
    const publicKey = KeysService.getPublicKey(seedHex, didMethod)
    const result = KeysService.verify(updatedDigest, publicKey, signature)

    expect(result).to.be.equal(false)
  })

  it('#verify should return false (signature length is not valid > 64 characters)', async () => {
    const stringifiedOriginalDocument = JSON.stringify(doc)
    const digest = KeysService.sha256(Buffer.from(stringifiedOriginalDocument))
    const signature = Buffer.from(encryptedSeed) // 128 chars

    const { seed, didMethod } = KeysService.decryptSeed(encryptedSeed, password)

    const seedHex = seed.toString('hex')
    const publicKey = KeysService.getPublicKey(seedHex, didMethod)
    const result = KeysService.verify(digest, publicKey, signature)

    expect(result).to.be.equal(false)
  })
})
