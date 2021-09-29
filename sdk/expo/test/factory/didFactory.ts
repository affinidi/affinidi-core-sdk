const cryptoRandomString = require('crypto-random-string')

import { AffinidiWallet } from '../../'
import { KeysService, DidDocumentService, DidResolver } from '@affinidi/common'

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

export const generateTestDIDs = async (): Promise<{
  password: string
  jolo: TestJoloDid
  elem: TestDid
  elemAlt: TestDid
}> => {
  let keysService
  let didDocumentService
  const didResolverMock: DidResolver = {
    resolveDid: () => Promise.resolve({ id: 'did:elem:ushJhdunHuhsecb_hscudTYj2h2e' }),
  } as any
  const password = cryptoRandomString({ length: 32, type: 'ascii-printable' })

  const joloSeed = await AffinidiWallet.generateSeed('jolo')
  const joloSeedHex = joloSeed.toString('hex')
  const joloSeedWithMethod = `${joloSeedHex}++${'jolo'}`

  const { encryptedSeed: joloEncryptedSeed } = await AffinidiWallet.fromSeed(joloSeedWithMethod, options, password)

  keysService = new KeysService(joloEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const joloDidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const joloDid = joloDidDocument.id

  const joloPublicKey = KeysService.getPublicKey(joloSeedHex, 'jolo').toString('hex')
  const joloEthereumPublicKey = KeysService.getAnchorTransactionPublicKey(joloSeedHex, 'jolo').toString('hex')

  const elemSeed = await AffinidiWallet.generateSeed('elem')
  const elemSeedHex = elemSeed.toString('hex')
  const elemSeedWithMethod = `${elemSeedHex}++${'elem'}`

  const { encryptedSeed: elemEncryptedSeed } = await AffinidiWallet.fromSeed(elemSeedWithMethod, options, password)

  keysService = new KeysService(elemEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const elemDidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const elemDid = await didDocumentService.getMyDid()

  const elemPublicKey = KeysService.getPublicKey(elemSeedHex, 'elem').toString('hex')

  const elemAltSeed = await AffinidiWallet.generateSeed('elem')
  const elemAltSeedHex = elemSeed.toString('hex')
  const elemAltSeedWithMethod = `${elemAltSeedHex}++${'elem'}`

  const { encryptedSeed: elemAltEncryptedSeed } = await AffinidiWallet.fromSeed(
    elemAltSeedWithMethod,
    options,
    password,
  )

  keysService = new KeysService(elemAltEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const elemAltDidDocument = await didDocumentService.getDidDocument(didResolverMock)
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
