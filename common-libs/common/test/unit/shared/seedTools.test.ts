import base64url from 'base64url'
import { ADDITIONAL_DATA_SEPARATOR, generateFullSeed, parseDecryptedSeed } from '../../../src/shared/seedTools'
import { IPlatformCryptographyTools } from '../../../src'
import { expect } from 'chai'

describe('didTools', () => {
  let cryptoTools: IPlatformCryptographyTools

  before(() => {
    cryptoTools = {
      keyGenerators: {
        rsa: () => Promise.resolve({ keyFormat: 'pem', privateKey: 'privatersa', publicKey: 'publicrsa' }),
        bbs: () => Promise.resolve({ keyFormat: 'pem', privateKey: 'privatebbs', publicKey: 'publicbbs' }),
      },
    } as any
  })
  describe('#generateFullSeed', () => {
    it('should generate seed with method', async () => {
      const seed = await generateFullSeed(cryptoTools as IPlatformCryptographyTools, 'elem')

      expect(seed).to.be.exist
      expect(seed.includes('++elem')).to.be.true
    })

    it('should generate simple seed with method and additional info (keys)', async () => {
      const seed = await generateFullSeed(cryptoTools as IPlatformCryptographyTools, 'elem', {
        keyTypes: ['rsa', 'bbs'],
      })

      expect(seed).to.be.exist
      expect(seed.includes(`++elem${ADDITIONAL_DATA_SEPARATOR}`)).to.be.true
    })

    it('should generate simple seed with method and additional info (keys) for DID WEB', async () => {
      const seed = await generateFullSeed(
        cryptoTools as IPlatformCryptographyTools,
        'web',
        {
          keyTypes: ['rsa', 'bbs'],
        },
        {
          webDomain: 'did.actor:alice',
        },
      )

      expect(seed).to.be.exist
      expect(seed.includes(`++web${ADDITIONAL_DATA_SEPARATOR}`)).to.be.true
    })

    it('should generate simple seed with method and additional info (meta)', async () => {
      const seed = await generateFullSeed(cryptoTools as IPlatformCryptographyTools, 'elem', undefined, {
        some: { info: { could: { be: 'here' } } },
        anchoredDid: 'did:elem-anchored:dssdfsdfsdfds',
      })

      expect(seed).to.be.exist
      expect(seed.includes(`++elem${ADDITIONAL_DATA_SEPARATOR}`)).to.be.true
    })

    it('should generate keys section for a single key', async () => {
      const seedHexWithMethod = await generateFullSeed(cryptoTools, 'jolo', { keyTypes: ['rsa'] })
      const additionalDataSeedSection = seedHexWithMethod.split(ADDITIONAL_DATA_SEPARATOR)[1]

      expect(JSON.parse(base64url.decode(additionalDataSeedSection))).to.deep.eq({
        keys: [
          {
            type: 'rsa',
            permissions: ['authentication', 'assertionMethod'],
            format: 'pem',
            private: 'privatersa',
            public: 'publicrsa',
          },
        ],
      })
    })
    it('should generate keys section for multiple keys', async () => {
      const seedHexWithMethod = await generateFullSeed(cryptoTools, 'jolo', { keyTypes: ['rsa', 'bbs'] })
      const additionalDataSeedSection = seedHexWithMethod.split(ADDITIONAL_DATA_SEPARATOR)[1]

      expect(JSON.parse(base64url.decode(additionalDataSeedSection))).to.deep.eq({
        keys: [
          {
            type: 'rsa',
            permissions: ['authentication', 'assertionMethod'],
            format: 'pem',
            private: 'privatersa',
            public: 'publicrsa',
          },
          {
            type: 'bbs',
            permissions: ['authentication', 'assertionMethod'],
            format: 'pem',
            private: 'privatebbs',
            public: 'publicbbs',
          },
        ],
      })
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
