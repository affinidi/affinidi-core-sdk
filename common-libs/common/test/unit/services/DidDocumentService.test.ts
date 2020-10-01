'use strict'
import { expect } from 'chai'

import DidDocumentService from '../../../src/services/DidDocumentService'
import KeyService from '../../../src/services/KeysService'

// The following information is not sensitive keys
// These values are hard coded to ensure a core cryptographic utility does not fail
// or change behavior

const demoEncryptionPassword = 'JCi+OHEJOJ1e1gjlh1zmRAgyBELXroVR'
const encryptedSeed =
  '2a9a543608ea6b9d5289dbcade47a2eef80546a603cf3a66399c7' +
  '1a214559fe4bc6a02977d42354245f82c5f065e3765010fb499ef1107c915187ad6acbe5556'

const encryptedSeedElem =
  '26fd7d484102945b986b724d0ffbe49894a410d2592046b1b6' +
  'f6d18b619e97a2033f0ec7a6630fdcd3827a0dd70b3c439ab4' +
  '76b3fc264b639c84935d6e5d6fcabb3d027d411ae5d74d570fd16d604b038a9250ce4ac271fd6a86d8401ac52c52'

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

describe('DidDocumentService', () => {
  it('!parseDid', async () => {
    const [method, methodId] = DidDocumentService.parseDid(joloDid)

    expect(method).to.exist
    expect(methodId).to.exist
    expect(method).to.be.equal(joloMethod)
    expect(methodId).to.be.equal(joloMethodId)
  })

  it('#getMyDid (when old encryptes seed without did method info)', async () => {
    const keyService = new KeyService(encryptedSeed, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(joloDid)
  })

  it('#getMyDid (jolo)', async () => {
    const keyService = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(joloDid)
  })

  it('#getMyDid (elem)', async () => {
    const keyService = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const did = didDocumentService.getMyDid()

    expect(did).to.exist
    expect(did).to.be.equal(elemDid)
  })

  it('#getKeyId (jolo)', async () => {
    const keyService = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const keyId = didDocumentService.getKeyId()

    expect(keyId).to.exist
    expect(keyId).to.be.equal(`${joloDid}#keys-1`)
  })

  it('#getKeyId (elem)', async () => {
    const keyService = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const keyId = didDocumentService.getKeyId()

    expect(keyId).to.exist
    expect(keyId).to.be.equal(`${elemDidShortForm}#primary`)
  })

  it('#buildDidDocument (elem)', async () => {
    const keyService = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const didDocument = await didDocumentService.buildDidDocument()

    expect(didDocument.id).to.exist
    expect(didDocument.id).to.be.equal(elemDidShortForm)
  })

  it('#buildDidDocument (jolo)', async () => {
    const keyService = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const didDocumentService = new DidDocumentService(keyService)
    const didDocument = await didDocumentService.buildDidDocument()

    expect(didDocument.id).to.exist
    expect(didDocument.id).to.be.equal(joloDid)
  })

  it('!getPublicKey', async () => {
    const keyService1 = new KeyService(encryptedSeedJolo, demoEncryptionPassword)
    const keyService2 = new KeyService(encryptedSeedElem, demoEncryptionPassword)
    const didDocumentServiceJolo = new DidDocumentService(keyService1)
    const didDocumentServiceElem = new DidDocumentService(keyService2)
    const didDocumentJolo = await didDocumentServiceJolo.buildDidDocument()
    const didDocumentElem = await didDocumentServiceElem.buildDidDocument()

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
