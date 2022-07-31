/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Secp256k1Key, Secp256k1Signature } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'
import * as base58 from 'bs58'
// @ts-ignore
import { Ed25519Signature2018 } from '@digitalbazaar/ed25519-signature-2018'
// @ts-ignore
import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018'
import { IPlatformCryptographyTools } from './interfaces'

export const ecdsaCryptographyTools: IPlatformCryptographyTools = {
  signSuites: {
    bbs: () => {
      throw new Error('Not implemented')
    },
    rsa: () => {
      throw new Error('Not implemented')
    },
    ecdsa: ({ keyId, privateKey, controller }) => {
      return new Secp256k1Signature({
        key: new Secp256k1Key({
          id: keyId,
          controller,
          privateKeyHex: privateKey,
        }),
      })
    },
    eddsa: async ({ keyId, privateKey, controller, publicKey }) => {
      // another options is Ed25519VerificationKey2020, not used for now
      const key = await Ed25519VerificationKey2018.from({
        controller,
        type: 'Ed25519VerificationKey2018',
        id: keyId,
        privateKeyBase58: base58.encode(Buffer.from(privateKey, 'hex')),
        publicKeyBase58: base58.encode(Buffer.from(publicKey, 'hex')),
      })
      return new Ed25519Signature2018({ key })
    },
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
    EcdsaSecp256k1Signature2019: (publicKey: Buffer, verificationMethod: string, controller: string) =>
      new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: publicKey.toString('hex'),
          id: verificationMethod,
          controller,
        }),
      }),
    // Ed25519VerificationKey2020 is not used now
    // eslint-disable-next-line no-unused-vars
    Ed25519Signature2018: async (publicKey: Buffer, verificationMethod: string, controller: string) => {
      const keyPair = await Ed25519VerificationKey2018.from({
        controller,
        type: 'Ed25519VerificationKey2018',
        id: verificationMethod,
        publicKeyBase58: base58.encode(publicKey),
        privateKeyBase68: '',
      })
      return new Ed25519Signature2018({ key: keyPair })
    },
  },
}
