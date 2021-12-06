import { wrapJsonldFrameFunction } from '@affinidi/common'
import { IPlatformCryptographyTools, ecdsaCryptographyTools } from '@affinidi/wallet-core-sdk'
import { generateBls12381G2KeyPair } from '@mattrglobal/bbs-signatures'
import {
  BbsBlsSignature2020,
  BbsBlsSignatureProof2020,
  Bls12381G2KeyPair,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs'
import bs58 from 'bs58'
import crypto from 'crypto'
import * as eccrypto from 'eccrypto-js'
import randomBytes from 'randombytes'

const jsonldSignatures = require('jsonld-signatures')
const { RsaSignature2018 } = jsonldSignatures.suites

const cryptoLd = require('crypto-ld')
const { RSAKeyPair } = cryptoLd

wrapJsonldFrameFunction(require('jsonld'))

const isValidPrivateKey = (privateKey: Buffer) => {
  const { EC_GROUP_ORDER, ZERO32 } = eccrypto

  const isValid = privateKey.compare(ZERO32) > 0 && privateKey.compare(EC_GROUP_ORDER) < 0
  return isValid
}

const getEphemKeyPair = async () => {
  let ephemPrivateKey = await randomBytes(32)

  while (!isValidPrivateKey(ephemPrivateKey)) {
    ephemPrivateKey = await randomBytes(32)
  }

  return ephemPrivateKey
}

const platformCryptographyTools: IPlatformCryptographyTools = {
  decryptByPrivateKey: async (privateKeyBuffer, encryptedDataString) => {
    const encryptedDataObject = JSON.parse(encryptedDataString)

    const { iv, ephemPublicKey, ciphertext, mac } = encryptedDataObject

    if (!iv || !ephemPublicKey || !ciphertext || !mac) {
      console.error('Can not decrypt message')
      return encryptedDataObject
    }

    const encryptedData = {
      iv: Buffer.from(iv, 'hex'),
      ephemPublicKey: Buffer.from(ephemPublicKey, 'hex'),
      ciphertext: Buffer.from(ciphertext, 'hex'),
      mac: Buffer.from(mac, 'hex'),
    }

    const dataBuffer = await eccrypto.decrypt(privateKeyBuffer, encryptedData)
    const data = JSON.parse(dataBuffer.toString())

    return data
  },

  encryptByPublicKey: async (publicKeyBuffer, data) => {
    const dataString = JSON.stringify(data)
    const dataBuffer = Buffer.from(dataString)

    const randomIv = await randomBytes(16)
    const ephemPrivateKey = await getEphemKeyPair()

    const options = { iv: randomIv, ephemPrivateKey }

    const encryptedData = await eccrypto.encrypt(publicKeyBuffer, dataBuffer, options)

    const { iv, ephemPublicKey, ciphertext, mac } = encryptedData

    const serializedEncryptedData = {
      iv: iv.toString('hex'),
      ephemPublicKey: ephemPublicKey.toString('hex'),
      ciphertext: ciphertext.toString('hex'),
      mac: mac.toString('hex'),
    }

    const serializedEncryptedDataString = JSON.stringify(serializedEncryptedData)

    return serializedEncryptedDataString
  },

  computePersonalHash: async (privateKeyBuffer, data) => {
    const dataBuffer = Buffer.from(data)

    const signatureBuffer = await eccrypto.hmacSha256Sign(privateKeyBuffer, dataBuffer)
    const signature = signatureBuffer.toString('hex')

    return signature
  },

  signSuites: {
    ecdsa: ecdsaCryptographyTools.signSuites.ecdsa,
    bbs: ({ keyId, privateKey, publicKey, controller }) => {
      return new BbsBlsSignature2020({
        key: new Bls12381G2KeyPair({
          id: keyId,
          controller,
          publicKeyBase58: publicKey,
          privateKeyBase58: privateKey,
        }),
      })
    },
    rsa: ({ keyId, privateKey, controller }) => {
      return new RsaSignature2018({
        key: new RSAKeyPair({
          '@context': jsonldSignatures.SECURITY_CONTEXT_URL,
          type: 'RsaVerificationKey2018',
          id: keyId,
          controller,
          privateKeyPem: privateKey,
        }),
      })
    },
  },
  deriveBbsSegmentProof: async ({ credential, revealDocument, documentLoader }) =>
    deriveProof(credential, revealDocument, {
      suite: new BbsBlsSignatureProof2020(),
      documentLoader,
    }),
  validateBbsSegmentProof: async ({ credential, issuerDidDocument, documentLoader }) => {
    const { verified, error } = await jsonldSignatures.verify(credential, {
      suite: new BbsBlsSignatureProof2020(),
      purpose: new jsonldSignatures.purposes.AssertionProofPurpose({
        controller: issuerDidDocument,
      }),
      documentLoader,
    })

    return { result: verified, error: error?.errors?.join('\n') ?? '' }
  },
  verifySuiteFactories: {
    EcdsaSecp256k1Signature2019: ecdsaCryptographyTools.verifySuiteFactories.EcdsaSecp256k1Signature2019,
    BbsBlsSignature2020: (publicKey, verificationMethod, controller) => {
      return new BbsBlsSignature2020({
        key: new Bls12381G2KeyPair({
          publicKeyBase58: publicKey.toString(),
          id: verificationMethod,
          controller,
        }),
      })
    },
    RsaSignature2018: (publicKey: Buffer, verificationMethod: string, controller: string) => {
      return new RsaSignature2018({
        key: new RSAKeyPair({
          '@context': jsonldSignatures.SECURITY_CONTEXT_URL,
          type: 'RsaVerificationKey2018',
          id: verificationMethod,
          controller,
          publicKeyPem: publicKey.toString(),
        }),
      })
    },
  },

  keyGenerators: {
    bbs: async () => {
      const keyPair = await generateBls12381G2KeyPair()

      return {
        keyFormat: 'base58',
        publicKey: bs58.encode(Buffer.from(keyPair.publicKey)),
        privateKey: bs58.encode(Buffer.from(keyPair.secretKey)),
      }
    },
    rsa: async () => {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      })

      return {
        keyFormat: 'pem',
        publicKey,
        privateKey,
      }
    },
  },
}

export default platformCryptographyTools
