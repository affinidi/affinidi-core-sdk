import { Secp256k1Key, Secp256k1Signature } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'
import { IPlatformCryptographyTools } from './interfaces'

export const ecdsaCryptographyTools: IPlatformCryptographyTools = {
  computePersonalHash(): Promise<string> {
    throw new Error('Not implemented')
  },
  decryptByPrivateKey(): Promise<any> {
    throw new Error('Not implemented')
  },
  encryptByPublicKey(): Promise<string> {
    throw new Error('Not implemented')
  },
  signSuites: {
    bbs: () => {
      throw new Error('Not implemented')
    },
    rsa: () => {
      throw new Error('Not implemented')
    },
    ecdsa: ({ keyId, privateKey, controller }) =>
      new Secp256k1Signature({
        key: new Secp256k1Key({
          id: keyId,
          controller,
          privateKeyHex: privateKey,
        }),
      }),
  },
  keyGenerators: {
    bbs: () => {
      throw new Error('Not implemented')
    },
    rsa: () => {
      throw new Error('Not implemented')
    },
  },
  validateBbsSegmentProof: () => {
    throw new Error('Not implemented')
  },
  deriveBbsSegmentProof: () => {
    throw new Error('Not implemented')
  },
  verifySuiteFactories: {
    BbsBlsSignature2020: () => {
      throw new Error('Not implemented')
    },
    RsaSignature2018: () => {
      throw new Error('Not implemented')
    },
    EcdsaSecp256k1Signature2019: (publicKey, verificationMethod, controller) =>
      new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: publicKey.toString('hex'),
          id: verificationMethod,
          controller,
        }),
      }),
  },
}
