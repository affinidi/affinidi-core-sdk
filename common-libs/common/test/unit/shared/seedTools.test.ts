// import base64url from "base64url";

import { generateFullSeed, parseDecryptedSeed } from '../../../src/shared/seedTools'
import { IPlatformCryptographyTools } from '../../../src'
import { expect } from 'chai'

describe('didTools', () => {
  let cryptoTools: IPlatformCryptographyTools

  before(() => {
    cryptoTools = {
      keyGenerators: {
        rsa: () => Promise.resolve({ keyFormat: 'pem', privateKey: 'private', publicKey: 'public' }),
        bbs: () => Promise.resolve({ keyFormat: 'pem', privateKey: 'private', publicKey: 'public' }),
      },
    } as any
  })
  describe('#generateFullSeed', () => {
    it('should generate seed with method', async () => {
      const seed = await generateFullSeed(cryptoTools as IPlatformCryptographyTools, 'elem')

      expect(seed).to.be.exist
      expect(/.*(\+\+elem)$/.test(seed)).to.be.true
    })

    it('should generate simple seed with method and additional info (keys)', async () => {
      const seed = await generateFullSeed(cryptoTools as IPlatformCryptographyTools, 'elem', {
        keyTypes: ['rsa', 'bbs'],
      })

      expect(seed).to.be.exist
      expect(/.*(\+\+elem\+\+;additionalData:).*$/.test(seed)).to.be.true
    })

    it('should generate simple seed with method and additional info (meta)', async () => {
      const seed = await generateFullSeed(cryptoTools as IPlatformCryptographyTools, 'elem', undefined, {
        some: { info: { could: { be: 'here' } } },
        anchoredDid: 'did:elem-anchored:dssdfsdfsdfds',
      })

      expect(seed).to.be.exist
      expect(/.*(\+\+elem\+\+;additionalData:).*$/.test(seed)).to.be.true
    })
  })

  describe('#parseDecryptedSeed', () => {
    it('should parse decrypted seed', async () => {
      const meta = {
        some: { info: { could: { be: 'here' } } },
        anchoredDid: 'did:elem-anchored:dssdfsdfsdfds',
      }
      const decryptedSeed = await generateFullSeed(
        cryptoTools as IPlatformCryptographyTools,
        'elem-anchored',
        { keyTypes: ['rsa', 'bbs'] },
        meta,
      )

      const { seed, didMethod, seedHexWithMethod, externalKeys, fullSeedHex, metadata } = parseDecryptedSeed(
        decryptedSeed,
      )

      expect(seed).to.be.exist
      expect(didMethod).to.be.string('elem-anchored')
      expect(seedHexWithMethod).to.be.string(`${seed.toString('hex')}++elem-anchored`)
      expect(externalKeys).to.be.exist
      expect(fullSeedHex).to.be.equal(decryptedSeed)
      expect(JSON.stringify(metadata)).to.be.equal(JSON.stringify(meta))
    })
  })
})
