'use strict'
import { expect } from 'chai'

import DidDocumentService from '../../../src/services/DidDocumentService'
import KeyService from '../../../src/services/KeysService'
import { generateTestDIDs } from '../../factory/didFactory'
import { DidResolver } from '../../../src'

/*
 _____  _                        _   __                     ___                _   _         _     _____                    _  _    _
|_   _|| |                      | | / /                    / _ \              | \ | |       | |   /  ___|                  (_)| |  (_)
  | |  | |__    ___  ___   ___  | |/ /   ___  _   _  ___  / /_\ \ _ __   ___  |  \| |  ___  | |_  \ `--.   ___  _ __   ___  _ | |_  _ __   __  ___
  | |  | '_ \  / _ \/ __| / _ \ |    \  / _ \| | | |/ __| |  _  || '__| / _ \ | . ` | / _ \ | __|  `--. \ / _ \| '_ \ / __|| || __|| |\ \ / / / _ \
  | |  | | | ||  __/\__ \|  __/ | |\  \|  __/| |_| |\__ \ | | | || |   |  __/ | |\  || (_) || |_  /\__/ /|  __/| | | |\__ \| || |_ | | \ V / |  __/
  \_/  |_| |_| \___||___/ \___| \_| \_/ \___| \__, ||___/ \_| |_/|_|    \___| \_| \_/ \___/  \__| \____/  \___||_| |_||___/|_| \__||_|  \_/   \___|
                                               __/ |
                                              |___/

The keys below this message are used to test that key cryptographic functionality does not break.
They are fixtures and should not be considered sensitive.
*/

const demoEncryptionPassword = 'JCi+OHEJOJ1e1gjlh1zmRAgyBELXroVR'
const encryptedSeed =
  '2a9a543608ea6b9d5289dbcade47a2eef80546a603cf3a66399c7' +
  '1a214559fe4bc6a02977d42354245f82c5f065e3765010fb499ef1107c915187ad6acbe5556'

const encryptedSeedElem =
  '26fd7d484102945b986b724d0ffbe49894a410d2592046b1b6' +
  'f6d18b619e97a2033f0ec7a6630fdcd3827a0dd70b3c439ab4' +
  '76b3fc264b639c84935d6e5d6fcabb3d027d411ae5d74d570fd16d604b038a9250ce4ac271fd6a86d8401ac52c52'

const encryptedSeedElemAnchored =
  'e7697091e36dc34575bdbaf72dbb2fe608cabbc9ce08978d3f' +
  '6b1b3863c0179c6460bd04ccf9595522ac4860c809abc920a7' +
  'f318a1747f8c3723341d4ead0f09cad7eeb3143555342d9bfd' +
  '24a9ffd4e90a7e016e6ec1b2c3257cfe8f3f290dd0568e3ed1' +
  'd9c439ce628e07a6d2389983bb3217586e8387af08274cab1e' +
  '95f9b4f8476efd3a2d07701333fc79009109341229f1e40d81' +
  '39d553e796560560c6d669ad5e8d3215ef9cd8e80bc624636e' +
  'aba04af70f4287597cfd5b4cdaf9beb8ff34719fa092f9ddae' +
  '8333d97b35727fd0d450385ae42fdf374c5cf0b70675336537449ae9fb004f36505c4055e8a13130'

const encryptedSeedJolo =
  'e172340f2dbed5853dd089ee9a8f4fb5dddb41c275a10a3f749f9' +
  '7cce3564d3b0f31c3d4b3eef993fa4c4c5b0513b9dd00e1870667' +
  '0cf3f37c4d78f4a51d6041847bdfd6bf614c0e1f3b0e707b85e1f0a4e40bcfbeadd51adb28963886b3f9ee'

const joloPublicKeyHex = '03c02f9a44b0eeaa0c50b47d6d670595c898362bcd4987d6d3c16517adc78157eb'
const elemPublicKeyHex = '021abb4bbaaec970d0c25dd46ad36e44b4ab3650458d23a06be0e7128bfd3013b9'

const joloMethod = 'jolo'
const joloMethodId = '94f928808d7cbe228a86e6b2ba7549f873e0080be0ed7e04b957c2bcf7db93cb'
const joloDid = `did:${joloMethod}:${joloMethodId}`
const joloDidKey = `${joloDid}#keys-1`
const elemDidShortForm = 'did:elem:EiD5Rx3mRfvGTD-IBzjtOs0k5nLMwiPgZyd2_TYuGBK0cw'
const elemAnchoredDid = elemDidShortForm
const elemDid =
  elemDidShortForm +
  ';elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVl' +
  'YUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnll' +
  'U0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQ' +
  'VkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVm' +
  'pkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9' +
  'pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENK' +
  'MGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyV' +
  'jVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU1XRmlZal' +
  'JpWW1GaFpXTTVOekJrTUdNeU5XUmtORFpoWkRNMlpUUTBZalJoWWp' +
  'NMk5UQTBOVGhrTWpOaE1EWmlaVEJsTnpFeU9HSm1aRE13TVROaU9T' +
  'SjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJb' +
  'kpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY2' +
  '1sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVp' +
  'YZ2lPaUl3TXpObVpEUTFPR1JoWldKbU5HWXpOV0V4TW1ZMU16Vmxa' +
  'RFl6TkdRNVl6ZzBaVGszTVRrek1UWXlOekV4TjJKbU9UTTJNVEJqT' +
  'kRBd1pUWTROVFZqTWpVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dU' +
  'lqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZ' +
  'aQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiZUdU' +
  'TkdGdk5ZU2lOa3FJWUhud2ZCUGM4M2o1ZEI4a3pqeFRQYXVwMkpPU' +
  'WJiNjU1cG92ajFOelk1MXl1WG1XR3Z5aHBiTTNyTmRtaXZJNWVoZ1p4RUEifQ'

const elemDidkey = `${elemDidShortForm}#primary`
const elemDidLongkey = `${elemDid}#primary`

/*
 _____             _           __    __  _        _
|  ___|           | |         / _|  / _|(_)      | |
| |__   _ __    __| |   ___  | |_  | |_  _ __  __| |_  _   _  _ __   ___  ___
|  __| | '_ \  / _` |  / _ \ |  _| |  _|| |\ \/ /| __|| | | || '__| / _ \/ __|
| |___ | | | || (_| | | (_) || |   | |  | | >  < | |_ | |_| || |   |  __/\__ \
\____/ |_| |_| \__,_|  \___/ |_|   |_|  |_|/_/\_\ \__| \__,_||_|    \___||___/


*/

describe('DidDocumentService', () => {
  const didResolverMock: DidResolver = {
    resolveDid: () => Promise.resolve({ id: 'did:elem:ushJhdunHuhsecb_hscudTYj2h2e' }),
  } as any
  let password: string
  let elemRSAEncryptedSeed: string
  let elemBBSEncryptedSeed: string

  before(async () => {
    const testDids = await generateTestDIDs()
    password = testDids.password
    elemRSAEncryptedSeed = testDids.elemWithRSA.encryptedSeed
    elemBBSEncryptedSeed = testDids.elemWithBBS.encryptedSeed
  })

  it('!parseDid', async () => {
    const [method, methodId] = DidDocumentService.parseDid(joloDid)

    expect(method).to.exist
    expect(methodId).to.exist
    expect(method).to.be.equal(joloMethod)
    expect(methodId).to.be.equal(joloMethodId)
  })

  it('#getMyDid (when old encryptes seed without did method info)', async () => {
    const keyService = new KeyService(encryptedSeed, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(joloDid)
  })

  it('#getMyDid (jolo)', async () => {
    const keyService = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(joloDid)
  })

  it('#getMyDid (elem)', async () => {
    const keyService = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(elemDid)
  })

  it('#getMyDid (elem-anchored)', async () => {
    const keyService = new KeyService(encryptedSeedElemAnchored, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(elemAnchoredDid)
  })

  it('#getMyDid and #buildDidDocument and #getPublicKey (elem with externalKeys RSA)', async () => {
    const keyService = new KeyService(elemRSAEncryptedSeed, password)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()
    const didDocument = await didDocumentService.buildDidDocument(didResolverMock)
    const rsaPublicKey = didDocument.publicKey.find((key: any) => key.type === 'RsaVerificationKey2018')

    const rsaKeyId = `${didDocument.id}#secondary`
    const publicKeyBuffer = DidDocumentService.getPublicKey('', didDocument, rsaKeyId)
    const publicKey = publicKeyBuffer.toString()

    expect(did).to.exist
    expect(rsaPublicKey).to.exist
    expect(rsaPublicKey.publicKeyPem).to.exist
    expect(publicKey).to.exist
    expect(publicKey).to.be.equal(rsaPublicKey.publicKeyPem)
  })

  it('#getMyDid and #buildDidDocument and #getPublicKey (elem with externalKeys BBS)', async () => {
    const keyService = new KeyService(elemBBSEncryptedSeed, password)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const did = didDocumentService.getMyDid()
    const didDocument = await didDocumentService.buildDidDocument(didResolverMock)
    const bbsPublicKey = didDocument.publicKey.find((key: any) => key.type === 'Bls12381G2Key2020')

    const bbsKeyId = `${didDocument.id}#bbs`
    const publicKeyBuffer = DidDocumentService.getPublicKey('', didDocument, bbsKeyId)
    const publicKey = publicKeyBuffer.toString()

    expect(did).to.exist
    expect(bbsPublicKey).to.exist
    expect(bbsPublicKey.publicKeyBase58).to.exist
    expect(publicKey).to.exist
    expect(publicKey).to.be.equal(bbsPublicKey.publicKeyBase58)
  })

  it('#getKeyId (jolo)', async () => {
    const keyService = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const keyId = didDocumentService.getKeyId()

    expect(keyId).to.exist
    expect(keyId).to.be.equal(`${joloDid}#keys-1`)
  })

  it('#getKeyId (elem)', async () => {
    const keyService = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const keyId = didDocumentService.getKeyId()

    expect(keyId).to.exist
    expect(keyId).to.be.equal(`${elemDidShortForm}#primary`)
  })

  it('#getKeyId (elem-anchored)', async () => {
    const keyService = new KeyService(encryptedSeedElemAnchored, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const keyId = didDocumentService.getKeyId()

    expect(keyId).to.exist
    expect(keyId).to.be.equal(`${elemAnchoredDid}#primary`)
  })

  it('#buildDidDocument (elem)', async () => {
    const keyService = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const didDocument = await didDocumentService.buildDidDocument(didResolverMock)

    expect(didDocument.id).to.exist
    expect(didDocument.id).to.be.equal(elemDidShortForm)
  })

  it('#buildDidDocument (elem-anchored)', async () => {
    const fakeRegistryResolveDidService = { resolveDid: () => ({ id: elemAnchoredDid }) }
    const keyService = new KeyService(encryptedSeedElemAnchored, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const didDocument = await didDocumentService.buildDidDocument(fakeRegistryResolveDidService as any)

    expect(didDocument.id).to.exist
    expect(didDocument.id).to.be.equal(elemAnchoredDid)
  })

  it('#buildDidDocument (jolo)', async () => {
    const keyService = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const didDocumentService = DidDocumentService.createDidDocumentService(keyService)
    const didDocument = await didDocumentService.buildDidDocument(didResolverMock)

    expect(didDocument.id).to.exist
    expect(didDocument.id).to.be.equal(joloDid)
  })

  it('!getPublicKey', async () => {
    const keyService1 = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const keyService2 = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentServiceJolo = DidDocumentService.createDidDocumentService(keyService1)
    const didDocumentServiceElem = DidDocumentService.createDidDocumentService(keyService2)
    const didDocumentJolo = await didDocumentServiceJolo.buildDidDocument(didResolverMock)
    const didDocumentElem = await didDocumentServiceElem.buildDidDocument(didResolverMock)

    const publicKeyJolo = DidDocumentService.getPublicKey(joloDidKey, didDocumentJolo)
    const publicKeyHexJolo = publicKeyJolo.toString('hex')
    const publicKeyElem = DidDocumentService.getPublicKey(elemDidkey, didDocumentElem)
    const publicKeyElemLong = DidDocumentService.getPublicKey(elemDidLongkey, didDocumentElem)
    const publicKeyHexElem = publicKeyElem.toString('hex')
    const publicKeyHexElemLong = publicKeyElemLong.toString('hex')

    expect(publicKeyHexJolo).to.exist
    expect(publicKeyHexElem).to.exist
    expect(publicKeyHexJolo).to.be.equal(joloPublicKeyHex)
    expect(publicKeyHexElem).to.be.equal(elemPublicKeyHex)
    expect(publicKeyHexElemLong).to.be.equal(elemPublicKeyHex)
  })
})
