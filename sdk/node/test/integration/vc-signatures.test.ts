import { Affinidi, generateFullSeed, KeysService } from '@affinidi/common'
import { expect } from 'chai'

import { getAllOptionsForEnvironment } from '../../../core/test/helpers'
import platformCryptographyTools from '../../src/PlatformCryptographyTools'

import * as rsaFixtures from '../factory/rsa.fixtures'
import * as bbsFixtures from '../factory/bbs.fixtures'

import { employmentVCRevoked } from '../factory/employmentVCRevoked'

const { registryUrl, accessApiKey } = getAllOptionsForEnvironment()
const affinidiOptions = { registryUrl, apiKey: accessApiKey }
const affinidi = new Affinidi(affinidiOptions, platformCryptographyTools)

function simpleClonePlainObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object))
}

async function isValid(credential: any): Promise<boolean> {
  const { result } = await affinidi.validateCredential(credential)
  return result
}

describe('VC Signatures', () => {
  describe('[RSA]', () => {
    const { issuerEncryptionKey, unsignedCredential } = rsaFixtures

    it('should generate RSA keys, seed and did document, sign VC using RSA key and verify it', async () => {
      const fullSeed = await generateFullSeed(platformCryptographyTools, 'elem', { keyTypes: ['rsa'] })

      const encryptedSeed = await KeysService.encryptSeed(fullSeed, KeysService.normalizePassword(issuerEncryptionKey))

      const signedCredential = await affinidi.signCredential(
        unsignedCredential,
        encryptedSeed,
        issuerEncryptionKey,
        'rsa',
      )

      expect(signedCredential.proof.type).to.be.equal('RsaSignature2018')
      expect(await isValid(signedCredential)).to.be.true

      signedCredential.issuanceDate = new Date().toISOString()
      expect(await isValid(signedCredential)).to.be.false
    })
  })

  describe('[BBS+]', () => {
    const { issuerEncryptionKey, unsignedCredential, unsignedCredentialWithNewCtx } = bbsFixtures

    it('should generate BBS keys, seed and did document, sign VC using BBS key and verify it', async () => {
      const fullSeed = await generateFullSeed(platformCryptographyTools, 'elem', { keyTypes: ['bbs'] })
      const encryptedSeed = await KeysService.encryptSeed(fullSeed, KeysService.normalizePassword(issuerEncryptionKey))

      const signedCredential: any = await affinidi.signCredential(
        unsignedCredential,
        encryptedSeed,
        issuerEncryptionKey,
        'bbs',
      )

      expect(signedCredential['@context']).to.contain('https://w3id.org/security/bbs/v1')
      expect(signedCredential.proof.type).to.be.equal('BbsBlsSignature2020')

      expect(await isValid(signedCredential)).to.be.true
      expect(await isValid(simpleClonePlainObject(signedCredential))).to.be.true

      const signedCredential1 = simpleClonePlainObject(signedCredential)
      signedCredential1.issuanceDate = new Date().toISOString()
      expect(await isValid(signedCredential1)).to.be.false

      const signedCredential2 = simpleClonePlainObject(signedCredential)
      delete signedCredential2.credentialSubject.data.fullName
      expect(await isValid(signedCredential2)).to.be.false

      const signedCredential3 = simpleClonePlainObject(signedCredential)
      signedCredential3.credentialSubject.data.givenName = 'DenisUpdated2'
      expect(await isValid(signedCredential3)).to.be.false

      const signedCredential4 = simpleClonePlainObject(signedCredential)
      signedCredential4.credentialSubject.data.someNewProperty = 'Some New Value'
      expect(await isValid(signedCredential4)).to.be.false
    })

    it('should derive segment proof and verify it for cred with new type of jsonld context', async () => {
      const fullSeed = await generateFullSeed(platformCryptographyTools, 'elem', { keyTypes: ['bbs'] })
      const encryptedSeed = await KeysService.encryptSeed(fullSeed, KeysService.normalizePassword(issuerEncryptionKey))

      const signedCredential = await affinidi.signCredential(
        unsignedCredentialWithNewCtx,
        encryptedSeed,
        issuerEncryptionKey,
        'bbs',
      )

      const segment = await affinidi.deriveSegmentProof(signedCredential, ['name', 'Influence/area'])

      expect(segment.proof.type).to.be.equal('BbsBlsSignatureProof2020')
      expect(segment.credentialSubject.data.name).to.eq('Bob Belcher')
      expect(segment.credentialSubject.data.githubLink).to.not.exist
      expect(segment.credentialSubject.data.Influence.area).to.eq('web3')
      expect(segment.credentialSubject.data.Influence.level).to.not.exist
      expect(segment.credentialSubject.data.personal).to.not.exist
      expect(await isValid(segment)).to.be.true

      // delete revealed field
      const segment1 = simpleClonePlainObject(segment)
      delete segment1.credentialSubject.data.name
      expect(await isValid(segment1)).to.be.false

      // change revealed field
      const segment2 = simpleClonePlainObject(segment)
      segment2.credentialSubject.data.name = 'Fake Name'
      expect(await isValid(segment2)).to.be.false

      // add unrevealed field
      const segment3 = simpleClonePlainObject(segment)
      segment3.credentialSubject.data.githubLink = 'https://github.com/bobber'
      expect(await isValid(segment3)).to.be.false
    })

    it('should derive segment proof and verify it', async () => {
      const fullSeed = await generateFullSeed(platformCryptographyTools, 'elem', { keyTypes: ['bbs'] })
      const encryptedSeed = await KeysService.encryptSeed(fullSeed, KeysService.normalizePassword(issuerEncryptionKey))

      const signedCredential = await affinidi.signCredential(
        unsignedCredential,
        encryptedSeed,
        issuerEncryptionKey,
        'bbs',
      )

      const segment = await affinidi.deriveSegmentProof(signedCredential, ['fullName'])

      expect(segment.proof.type).to.be.equal('BbsBlsSignatureProof2020')
      expect(segment.credentialSubject.data.fullName).to.eq('Popov')
      expect(segment.credentialSubject.data.givenName).to.not.exist
      expect(await isValid(segment)).to.be.true

      // delete revealed field
      const segment1 = simpleClonePlainObject(segment)
      delete segment1.credentialSubject.data.fullName
      expect(await isValid(segment1)).to.be.false

      // change revealed field
      const segment2 = simpleClonePlainObject(segment)
      segment2.credentialSubject.data.fullName = 'Fake Name'
      expect(await isValid(segment2)).to.be.false

      // add unrevealed field
      const segment3 = simpleClonePlainObject(segment)
      segment3.credentialSubject.data.givenName = 'DenisUpdated'
      expect(await isValid(segment3)).to.be.false
    })
  })

  describe('#validateCredential', () => {
    it('should return default error message for failed revocation status check', async () => {
      const { result, error } = await affinidi.validateCredential(employmentVCRevoked)

      expect(result).to.be.false
      expect(error).to.eq('claimId:95a6a7edbbe97f13: Credential revocation status check result is negative.')
    })
  })
})

describe('integration', () => it.skip('skip'))
