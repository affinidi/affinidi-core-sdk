const cryptoRandomString = require('crypto-random-string')

import { KeysService, DidDocumentService } from '@affinidi/common'
import { createV5CompatibleWalletFactories, EventComponent, Util } from '@affinidi/wallet-core-sdk'
import platformEncryptionTools from '../../src/PlatformEncryptionTools'

interface TestDid {
  seed: string
  encryptedSeed: string
  seedHex: string
  did: string
  didDocument: { id: string }
  publicKey: string
}

interface TestJoloDid extends TestDid {
  publicEthereumKey: string
}

const options = { env: 'dev', apiKey: 'fakeApiKey' } as const

const AffinidiWallet = createV5CompatibleWalletFactories(
  Object.assign(platformEncryptionTools, {
    buildExternalKeysSectionForSeed: () => {
      throw new Error('Not implemented')
    },
  }),
  null,
  EventComponent.NotImplemented,
)

export const generateTestDIDs = async (): Promise<{
  password: string
  jolo: TestJoloDid
  elem: TestDid
  elemAlt: TestDid
}> => {
  let keysService
  let didDocumentService
  const password = cryptoRandomString({ length: 32, type: 'ascii-printable' })

  const joloSeed = await Util.generateSeed('jolo')
  const joloSeedHex = joloSeed.toString('hex')
  const joloSeedWithMethod = `${joloSeedHex}++${'jolo'}`

  const { encryptedSeed: joloEncryptedSeed } = await AffinidiWallet.fromSeed(joloSeedWithMethod, options, password)

  keysService = new KeysService(joloEncryptedSeed, password)

  didDocumentService = new DidDocumentService(keysService)
  const joloDidDocument = await didDocumentService.buildDidDocument()
  const joloDid = joloDidDocument.id

  const joloPublicKey = KeysService.getPublicKey(joloSeedHex, 'jolo').toString('hex')
  const joloEthereumPublicKey = KeysService.getAnchorTransactionPublicKey(joloSeedHex, 'jolo').toString('hex')

  const elemSeed = await Util.generateSeed('elem')
  const elemSeedHex = elemSeed.toString('hex')
  const elemSeedWithMethod = `${elemSeedHex}++${'elem'}`

  const { encryptedSeed: elemEncryptedSeed } = await AffinidiWallet.fromSeed(elemSeedWithMethod, options, password)

  keysService = new KeysService(elemEncryptedSeed, password)

  didDocumentService = new DidDocumentService(keysService)
  const elemDidDocument = await didDocumentService.buildDidDocument()
  const elemDid = await didDocumentService.getMyDid()

  const elemPublicKey = KeysService.getPublicKey(elemSeedHex, 'elem').toString('hex')

  const elemAltSeed = await Util.generateSeed('elem')
  const elemAltSeedHex = elemSeed.toString('hex')
  const elemAltSeedWithMethod = `${elemAltSeedHex}++${'elem'}`

  const { encryptedSeed: elemAltEncryptedSeed } = await AffinidiWallet.fromSeed(
    elemAltSeedWithMethod,
    options,
    password,
  )

  keysService = new KeysService(elemAltEncryptedSeed, password)

  didDocumentService = new DidDocumentService(keysService)
  const elemAltDidDocument = await didDocumentService.buildDidDocument()
  const elemAltDid = await didDocumentService.getMyDid()

  const elemAltPublicKey = KeysService.getPublicKey(elemSeedHex, 'elem').toString('hex')

  return {
    password,
    jolo: {
      seed: joloSeed,
      encryptedSeed: joloEncryptedSeed,
      seedHex: joloSeedHex,
      did: joloDid,
      didDocument: joloDidDocument,
      publicKey: joloPublicKey,
      publicEthereumKey: joloEthereumPublicKey,
    },
    elem: {
      seed: elemSeed,
      encryptedSeed: elemEncryptedSeed,
      seedHex: elemSeedHex,
      did: elemDid,
      didDocument: elemDidDocument,
      publicKey: elemPublicKey,
    },
    elemAlt: {
      seed: elemAltSeed,
      encryptedSeed: elemAltEncryptedSeed,
      seedHex: elemAltSeedHex,
      did: elemAltDid,
      didDocument: elemAltDidDocument,
      publicKey: elemAltPublicKey,
    },
  }
}
