const cryptoRandomString = require('crypto-random-string')

import { CommonNetworkMember } from '@affinidi/wallet-core-sdk'
import { KeysService, DidDocumentService } from '../../'

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

export const generateTestDIDs = async (): Promise<{
  password: string
  jolo: TestJoloDid
  elem: TestDid
}> => {
  let keysService
  let didDocumentService
  const password = cryptoRandomString({ length: 32, type: 'ascii-printable' })

  const joloSeed = await CommonNetworkMember.generateSeed('jolo')
  const joloSeedHex = joloSeed.toString('hex')
  const joloSeedWithMethod = `${joloSeedHex}++${'jolo'}`

  const { encryptedSeed: joloEncryptedSeed } = await CommonNetworkMember.fromSeed(joloSeedWithMethod, {}, password)

  keysService = new KeysService(joloEncryptedSeed, password)

  didDocumentService = new DidDocumentService(keysService)
  const joloDidDocument = await didDocumentService.buildDidDocument()
  const joloDid = joloDidDocument.id

  const joloPublicKey = KeysService.getPublicKey(joloSeedHex, 'jolo').toString('hex')
  const joloEthereumPublicKey = KeysService.getAnchorTransactionPublicKey(joloSeedHex, 'jolo').toString('hex')

  const elemSeed = await CommonNetworkMember.generateSeed('elem')
  const elemSeedHex = elemSeed.toString('hex')
  const elemSeedWithMethod = `${elemSeedHex}++${'elem'}`

  const { encryptedSeed: elemEncryptedSeed } = await CommonNetworkMember.fromSeed(elemSeedWithMethod, {}, password)

  keysService = new KeysService(elemEncryptedSeed, password)

  didDocumentService = new DidDocumentService(keysService)
  const elemDidDocument = await didDocumentService.buildDidDocument()
  const elemDid = await didDocumentService.getMyDid()

  const elemPublicKey = KeysService.getPublicKey(elemSeedHex, 'elem').toString('hex')

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
  }
}
