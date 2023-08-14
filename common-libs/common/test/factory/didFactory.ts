import base64url from 'base64url'
const cryptoRandomString = require('crypto-random-string')

import { randomBytes } from '../../src/shared/randomBytes'
import { KeysService, DidDocumentService, DidResolver } from '../../src/index'

const elemDidForLocalResolving =
  'did:elem:EiA8XCSERPjEQQJkNz55d_UZDl3_uBNFDDaeowfY7-QrPQ;elem:' +
  'initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENK' +
  'cmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZX' +
  'lKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlM' +
  'Q0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcF' +
  'oyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4' +
  'T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpXTmpPRFZpT1dSbVl6aGtZMk0yWVdSaU1XRT' +
  'JOR1V6TVdVeVkyRTJaVEprTUdJeVlqSTRPR0l6WkRBMk9XVTJObVExWTJWaE5XSmpOell4TjJS' +
  'aE5TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaX' +
  'dpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RX' +
  'SnNhV05MWlhsSVpYZ2lPaUl3TWpZMk1tWTVaVFpoWkRVM1lqVTRNRE0wT1dObU16UmxOelpsTm' +
  '1ZeU1qSXhZVGxtTnprMk9XVTRaV001TXpFeE56a3paRGt6T1RJek9ERTRaVEk0T0RZaWZWMHNJ' +
  'bUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbG' +
  'RHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiSDZ4Y3VPU1A2bnp1MGho' +
  'ZUlsRm9YejhJQ09UUkVoak01NlItb3FFMDNaSXhoOS04emFUT0x3bXhNVlJZbndSR3I1aGI0bU' +
  'VkU2JrTjNpVnRVWWRteHcifQ'

export const generateTestDIDs = async () => {
  let keysService
  let didDocumentService
  const didResolverMock: DidResolver = {
    resolveDid: () => Promise.resolve({ id: 'did:elem:ushJhdunHuhsecb_hscudTYj2h2e' }),
  } as any
  const password = cryptoRandomString({ length: 32, type: 'ascii-printable' })

  const joloSeed = await randomBytes(32)
  const joloSeedHex = joloSeed.toString('hex')
  const joloSeedWithMethod = `${joloSeedHex}++${'jolo'}`
  const joloPasswordBuffer = KeysService.normalizePassword(password)
  const joloEncryptedSeed = await KeysService.encryptSeed(joloSeedWithMethod, joloPasswordBuffer)

  keysService = new KeysService(joloEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const joloDidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const joloDid = joloDidDocument.id

  const joloPublicKey = KeysService.getPublicKey(joloSeedHex, 'jolo').toString('hex')
  const joloEthereumPublicKey = KeysService.getAnchorTransactionPublicKey(joloSeedHex, 'jolo').toString('hex')

  const elemSeed = await randomBytes(32)
  const elemSeedHex = elemSeed.toString('hex')
  const elemSeedWithMethod = `${elemSeedHex}++${'elem'}`
  const elemPasswordBuffer = KeysService.normalizePassword(password)
  const elemEncryptedSeed = await KeysService.encryptSeed(elemSeedWithMethod, elemPasswordBuffer)

  keysService = new KeysService(elemEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const elemDidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const elemDid = await didDocumentService.getMyDid()
  const elemPublicKey = KeysService.getPublicKey(elemSeedHex, 'elem').toString('hex')

  keysService = new KeysService(elemEncryptedSeed, password, 1)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const elemDidDocumentWithAccountNumber1 = await didDocumentService.getDidDocument(didResolverMock)
  const elemDidWithAccountNumber1 = await didDocumentService.getMyDid()
  const elemPublicKeyWithAccountNumber1 = KeysService.getPublicKey(elemSeedHex, 'elem', 1).toString('hex')

  const polygonSeed = await randomBytes(32)
  const polygonSeedHex = polygonSeed.toString('hex')
  const polygonSeedWithMethod = `${polygonSeedHex}++polygon:testnet`
  const polygonPasswordBuffer = KeysService.normalizePassword(password)
  const polygonEncryptedSeed = await KeysService.encryptSeed(polygonSeedWithMethod, polygonPasswordBuffer)

  keysService = new KeysService(polygonEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const { didDocument: polygonDidDocument, did: polygonDid } = await didDocumentService.buildDidDocumentForRegister()

  const polygonPublicKey = KeysService.getPublicKey(polygonSeedHex, 'polygon').toString('hex')

  const keys = [
    {
      type: 'rsa',
      permissions: ['authentication', 'assertionMethod'],
      private:
        '-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIEowIBAAKCAQEAj+uWAsdsMZhH+DE9d0JekeJ6GVlb8C0tnvT+wW9vNJhg/Zb3\n' +
        'qsT0ENli7GLFvm8wSEt61Ng8Xt8M+ytCnqQP+SqKGx5fdrCeEwR0G2tzsUo2B4/H\n' +
        '3DEp45656hBKtu0ZeTl8ZgfCKlYdDttoDWmqCH3SHrqcmzlVcX3pnE0ARkP2trHO\n' +
        'DQDpX1gFF7Ct/uRyEppplK2c/SkElVuAD5c3JX2wx81dv7Ujhse7ZKX9UEJ1FmrS\n' +
        'a/O3JjdOSa5/hK0/oRHmBDK46RMdr94S7/GUz1I2akGMkSxzBMJEw9wXd01GJXw+\n' +
        'Xv8TkFF5ae+iQ0I7hkrww8x+G9EQCRKylV8wcwIDAQABAoIBAFBNy65RR/WEWuQJ\n' +
        '1Zot1kbgb/ClA7/H9aS0X1Hfs9VNERFuo1MOAoFESwZLNrtDn1U3iJoq7cSiAMRF\n' +
        'Jy8NrDwDmHv5PpsjgZBq8744/pz2I5+kgohChnUTo/kOjiHzujsB8H+d5KFq21vm\n' +
        '4PBa/R0v14Z96dRS8XIaJ7em33hUradmuYQYNn9IgP5Y334DebTaTE4+yeFkR0z5\n' +
        'KLm78o/3uoH7+a2C2u2ERimaLO4mpqQXHtmzhulbW2aBIQsR8wGzrBH/AnIej+h/\n' +
        'FJ2CF1XrChq6a2k+Nu9mLRDKxHYN4uQq9qSB7js6p8ZSUC7HkOT6tge69uNn1jZZ\n' +
        'lpKLNQECgYEAwNtNRphFMA6oYLS5FaUY8l/Th66ToDMzVGK3DWXnoHA3vBU/1LW2\n' +
        'VPwV/PJVdTY5mXoERAI75QHCrLcdH07ppHusc6pFdzdVvO8Q5XnwUTfb6dcG7Ips\n' +
        'vniDd3AMWUFgbK2qNOOOeM7Qe0OPXNWzHHcmtL2uLOno8Y4J32cBwqMCgYEAvwqT\n' +
        'ECUjQmtoWHOWcO5M0SCv6YMBrigBY3Y8zFztDWltFhCKUT9WLAMOIHh5CKGnfLgG\n' +
        '4PV9kjTLEefxtUCqBm00SifkfRujfUQyZjfZIV9UBhSDceiM9phAK8JsTAKbop/h\n' +
        'FTDkknyqzsM7biLZjflGNWXvuwASKu0ssJjRh/ECgYBvsNJhNyCiw2pqj1+9lF8N\n' +
        'R8gXBVkD54MrtPv0q3bo6PSuXdQY2aAeOdx2INazSlMzeoHr7StI5qsbIfWgwy/3\n' +
        'DZUDa7JNZ+OkxwOPEv7F2sbm95xP858k9GCXFHJiYsV4S1+Ov9csSgJd0PO/PRg9\n' +
        'PRhShqPP6Sv6cVtwYZSYZwKBgHMa7Pb6WV9IletNYaSTgEc02ajpnVaQlh2WfRVp\n' +
        'HA9LqUV1G9HORp5oDNf1nn9b3y1fOA3M/Cbelkgop1LdLlSG8c2IcbwLrhrovzEl\n' +
        'jzbzWA39yCEWy/A8VdXH5DZ8D8gRaq248s9sPAIuUZ2Pc+N+ARZlX+cdKNUiaB3T\n' +
        'RdQRAoGBAIc/UaN3A8ya1+dZ5orrQkjuPQXB7+UzR128vzsKb3F8nt4F92bRMu3D\n' +
        'vBHZCT4QDhv4CCyYlu//LqVBQDdUo4BNayZmjK8J0XUQ/YY77CE35YRRqQAphvvz\n' +
        'fCwRbNd/EW88Pg8ioO1WWcIgmA0296qEBv079qOWqPQq/BbUjH/3\n' +
        '-----END RSA PRIVATE KEY-----',
      public:
        '-----BEGIN PUBLIC KEY-----\n' +
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj+uWAsdsMZhH+DE9d0Je\n' +
        'keJ6GVlb8C0tnvT+wW9vNJhg/Zb3qsT0ENli7GLFvm8wSEt61Ng8Xt8M+ytCnqQP\n' +
        '+SqKGx5fdrCeEwR0G2tzsUo2B4/H3DEp45656hBKtu0ZeTl8ZgfCKlYdDttoDWmq\n' +
        'CH3SHrqcmzlVcX3pnE0ARkP2trHODQDpX1gFF7Ct/uRyEppplK2c/SkElVuAD5c3\n' +
        'JX2wx81dv7Ujhse7ZKX9UEJ1FmrSa/O3JjdOSa5/hK0/oRHmBDK46RMdr94S7/GU\n' +
        'z1I2akGMkSxzBMJEw9wXd01GJXw+Xv8TkFF5ae+iQ0I7hkrww8x+G9EQCRKylV8w\n' +
        'cwIDAQAB\n' +
        '-----END PUBLIC KEY-----',
    },
  ]

  const keysBase64 = base64url.encode(JSON.stringify(keys))
  const elemRSASeed = await randomBytes(32)
  const elemRSASeedHex = elemRSASeed.toString('hex')
  const elemRSASeedWithMethod = `${elemRSASeedHex}++${'elem'}++${keysBase64}`
  const elemRSAPasswordBuffer = KeysService.normalizePassword(password)
  const elemRSAEncryptedSeed = await KeysService.encryptSeed(elemRSASeedWithMethod, elemRSAPasswordBuffer)

  keysService = new KeysService(elemRSAEncryptedSeed, password)
  const elemRSAPublicKeyRSA = keysService.getExternalPublicKey('rsa').toString()

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const elemRSADidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const elemRSADid = await didDocumentService.getMyDid()

  const elemRSAPublicKey = KeysService.getPublicKey(elemRSASeedHex, 'elem').toString('hex')

  const webRSASeed = await randomBytes(32)
  const webRSASeedHex = webRSASeed.toString('hex')
  // TODO: add metadata section
  const metadataBase64 =
    ';additionalDataJson:eyJtZXRhIjp7IndlYkRvbWFpbiI6ImRpZC5hY3RvcjphbGljZSJ9LCJrZXlzIjpbeyJ0eXBlIjoicnNhIiwiZm9ybWF0IjoicGVtIiwicHJpdmF0ZSI6InByaXZhdGVyc2EiLCJwdWJsaWMiOiJwdWJsaWNyc2EiLCJwZXJtaXNzaW9ucyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCJdfSx7InR5cGUiOiJiYnMiLCJmb3JtYXQiOiJwZW0iLCJwcml2YXRlIjoicHJpdmF0ZWJicyIsInB1YmxpYyI6InB1YmxpY2JicyIsInBlcm1pc3Npb25zIjpbImF1dGhlbnRpY2F0aW9uIiwiYXNzZXJ0aW9uTWV0aG9kIl19XX0'
  const webRSASeedWithMethod = `${webRSASeedHex}++${'web'}++${keysBase64}++${metadataBase64}`
  const webRSAPasswordBuffer = KeysService.normalizePassword(password)
  const webRSAEncryptedSeed = await KeysService.encryptSeed(webRSASeedWithMethod, webRSAPasswordBuffer)

  keysService = new KeysService(webRSAEncryptedSeed, password)
  const webRSAPublicKeyRSA = keysService.getExternalPublicKey('rsa').toString()

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const webRSADidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const webRSADid = await didDocumentService.getMyDid()

  const webRSAPublicKey = KeysService.getPublicKey(webRSASeedHex, 'web').toString('hex')

  const bbsKeys = [
    {
      type: 'bbs',
      permissions: ['authentication', 'assertionMethod'],
      private: '5D6Pa8dSwApdnfg7EZR8WnGfvLDCZPZGsZ5Y1ELL9VDj',
      public:
        'oqpWYKaZD9M1Kbe94BVXpr8WTdFBNZyKv48cziTiQUeuhm7sBhCABMyYG4kcMrseC68YTFFgyhiNeBKjzdKk9MiRWuLv5H4FFujQsQK2KTAtzU8qTBiZqBHMmnLF4PL7Ytu',
    },
  ]

  const bbskeysBase64 = base64url.encode(JSON.stringify(bbsKeys))
  const elemBBSSeed = await randomBytes(32)
  const elemBBSSeedHex = elemBBSSeed.toString('hex')
  const elemBBSSeedWithMethod = `${elemBBSSeedHex}++${'elem'}++${bbskeysBase64}`
  const elemBBSPasswordBuffer = KeysService.normalizePassword(password)
  const elemBBSEncryptedSeed = await KeysService.encryptSeed(elemBBSSeedWithMethod, elemBBSPasswordBuffer)

  keysService = new KeysService(elemBBSEncryptedSeed, password)
  const elemBBSPublicKeyBBS = keysService.getExternalPublicKey('bbs').toString()

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const elemBBSDidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const elemBBSDid = await didDocumentService.getMyDid()

  const elemBBSPublicKey = KeysService.getPublicKey(elemBBSSeedHex, 'elem').toString('hex')

  const keySeed = await randomBytes(32)
  const keySeedHex = keySeed.toString('hex')
  const keySeedWithMethod = `${keySeedHex}++${'key'}`
  const keyPasswordBuffer = KeysService.normalizePassword(password)
  const keyEncryptedSeed = await KeysService.encryptSeed(keySeedWithMethod, keyPasswordBuffer)

  keysService = new KeysService(keyEncryptedSeed, password)

  didDocumentService = DidDocumentService.createDidDocumentService(keysService)
  const keyDidDocument = await didDocumentService.getDidDocument(didResolverMock)
  const keyDid = await didDocumentService.getMyDid()
  const keyPublicKey = KeysService.getPublicKey(keySeedHex, 'elem').toString('hex')

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
      elemDidForLocalResolving,
    },
    elemAccount1: {
      seed: elemSeed,
      encryptedSeed: elemEncryptedSeed,
      seedHex: elemSeedHex,
      did: elemDidWithAccountNumber1,
      didDocument: elemDidDocumentWithAccountNumber1,
      publicKey: elemPublicKeyWithAccountNumber1,
      elemDidForLocalResolving,
    },
    polygon: {
      seed: polygonSeed,
      encryptedSeed: polygonEncryptedSeed,
      seedHex: polygonSeedHex,
      did: polygonDid,
      didDocument: polygonDidDocument,
      publicKey: polygonPublicKey,
    },
    web: {
      seed: webRSASeed,
      encryptedSeed: webRSAEncryptedSeed,
      seedHex: webRSASeedHex,
      did: webRSADid,
      didDocument: webRSADidDocument,
      publicKey: webRSAPublicKey,
      publicRSAKey: webRSAPublicKeyRSA,
    },
    key: {
      seed: keySeed,
      encryptedSeed: keyEncryptedSeed,
      seedHex: keySeedHex,
      did: keyDid,
      didDocument: keyDidDocument,
      publicKey: keyPublicKey,
    },
    elemWithRSA: {
      seed: elemRSASeed,
      encryptedSeed: elemRSAEncryptedSeed,
      seedHex: elemRSASeedHex,
      did: elemRSADid,
      didDocument: elemRSADidDocument,
      publicKey: elemRSAPublicKey,
      publicRSAKey: elemRSAPublicKeyRSA,
    },
    elemWithBBS: {
      seed: elemBBSSeed,
      encryptedSeed: elemBBSEncryptedSeed,
      seedHex: elemBBSSeedHex,
      did: elemBBSDid,
      didDocument: elemBBSDidDocument,
      publicKey: elemBBSPublicKey,
      publicBBSKey: elemBBSPublicKeyBBS,
    },
  }
}
