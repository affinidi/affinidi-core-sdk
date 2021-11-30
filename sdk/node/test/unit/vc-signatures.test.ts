import { Affinity } from '@affinidi/common'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'

import platformCryptographyTools from '../../src/PlatformCryptographyTools'
import * as rsaFixtures from '../factory/rsa.fixtures'
import * as bbsFixtures from '../factory/bbs.fixtures'

const { expect } = chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

function simpleClonePlainObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object))
}

describe('VC Signatures', () => {
  const affinity = new Affinity({}, platformCryptographyTools)

  async function isValid(credential: any, didDocument?: any): Promise<boolean> {
    const { result } = await affinity.validateCredential(credential, undefined, didDocument)
    return result
  }

  it('#generateRSAKeys', async () => {
    const { publicKey, privateKey } = await platformCryptographyTools.keyGenerators.rsa()

    expect(publicKey).to.be.string
    expect(privateKey).to.be.string
  })

  it('#generateBBSKeys', async () => {
    const { privateKey, publicKey } = await platformCryptographyTools.keyGenerators.bbs()

    expect(privateKey).to.be.string
    expect(publicKey).to.be.string
  })

  describe('[ECDSA]', () => {
    const { issuerEncryptedSeed, issuerEncryptionKey, issuerDidDocument, unsignedCredential } = rsaFixtures

    it('#signUnsignedCredential and #validateCredential with ecdsa', async () => {
      const signedCredential: any = await affinity.signCredential(
        unsignedCredential,
        issuerEncryptedSeed,
        issuerEncryptionKey,
        'ecdsa',
      )
      expect(signedCredential.proof.type).to.be.equal('EcdsaSecp256k1Signature2019')

      expect(await isValid(signedCredential, issuerDidDocument)).to.be.true

      const signedCredential1 = simpleClonePlainObject(signedCredential)
      signedCredential1.issuanceDate = new Date().toISOString()
      expect(await isValid(signedCredential1, issuerDidDocument)).to.be.false

      const signedCredential2 = simpleClonePlainObject(signedCredential)
      signedCredential2.credentialSubject.data.fullName = 'Fake Name'
      expect(await isValid(signedCredential2, issuerDidDocument)).to.be.false
    })
  })

  describe('[RSA]', () => {
    const { issuerEncryptedSeed, issuerEncryptionKey, issuerDidDocument, unsignedCredential } = rsaFixtures

    it('#signUnsignedCredential and #validateCredential with rsa', async () => {
      const signedCredential = await affinity.signCredential(
        unsignedCredential,
        issuerEncryptedSeed,
        issuerEncryptionKey,
        'rsa',
      )

      expect(signedCredential.proof.type).to.be.equal('RsaSignature2018')

      const result = await affinity.validateCredential(signedCredential, undefined, issuerDidDocument)
      expect(result.result).to.be.true

      signedCredential.issuanceDate = new Date().toISOString()
      const errorResult = await affinity.validateCredential(signedCredential, undefined, issuerDidDocument)
      expect(errorResult.result).to.be.false
    })
  })

  describe('[BBS+]', () => {
    const { issuerEncryptedSeed, issuerEncryptionKey, issuerDidDocument, unsignedCredential } = bbsFixtures

    let signedCredential: any
    before(async () => {
      signedCredential = await affinity.signCredential(
        unsignedCredential,
        issuerEncryptedSeed,
        issuerEncryptionKey,
        'bbs',
      )
    })

    it('#signUnsignedCredential and #validateCredential with bbs', async () => {
      expect(signedCredential['@context']).to.contain('https://w3id.org/security/bbs/v1')
      expect(signedCredential.proof.type).to.be.equal('BbsBlsSignature2020')

      expect(await isValid(signedCredential, issuerDidDocument)).to.be.true

      const signedCredential1 = simpleClonePlainObject(signedCredential)
      signedCredential1.issuanceDate = new Date().toISOString()
      expect(await isValid(signedCredential1, issuerDidDocument)).to.be.false
    })

    describe('#deriveSegmentProof', () => {
      let segment: any

      before(async () => {
        segment = await affinity.deriveSegmentProof(signedCredential, ['fullName', 'name/firstName'], issuerDidDocument)
      })

      it('segment should be valid when field does not exist', async () => {
        const segment1 = await affinity.deriveSegmentProof(
          signedCredential,
          ['fullName', 'notExist'],
          issuerDidDocument,
        )

        expect(segment1.proof.type).to.be.equal('BbsBlsSignatureProof2020')
        expect(segment1.credentialSubject.data.fullName).to.eq('Popov')
        expect(segment1.credentialSubject.data.notExist).to.eq(null)
        expect(segment1.credentialSubject.data.name).to.not.exist
        expect(segment1.credentialSubject.data.givenName).to.not.exist
        expect(await isValid(segment1, issuerDidDocument)).to.be.true
      })

      it('should throw an error when credential has "credentialSubject.id"', async () => {
        const credentialWithId = simpleClonePlainObject(signedCredential)
        credentialWithId.credentialSubject.id = 'did:example:1234567890'

        await expect(
          affinity.deriveSegmentProof(credentialWithId, ['fullName'], issuerDidDocument),
        ).to.eventually.be.rejectedWith(Error, 'Segment proof cannot be derived when "credentialSubject.id" is present')
      })

      it('segment should be valid', async () => {
        expect(segment.proof.type).to.be.equal('BbsBlsSignatureProof2020')
        expect(segment.credentialSubject.data.fullName).to.eq('Popov')
        expect(segment.credentialSubject.data.name.firstName).to.eq('Bobby')
        expect(segment.credentialSubject.data.name.lastName).to.not.exist
        expect(segment.credentialSubject.data.givenName).to.not.exist
        expect(await isValid(segment, issuerDidDocument)).to.be.true
      })

      it('modified segment should be invalid', async () => {
        // add unrevealed field
        const modifiedSegment = simpleClonePlainObject(segment)
        modifiedSegment.credentialSubject.data.givenName = 'DenisUpdated'
        expect(await isValid(modifiedSegment, issuerDidDocument)).to.be.false
      })
    })
  })
})
