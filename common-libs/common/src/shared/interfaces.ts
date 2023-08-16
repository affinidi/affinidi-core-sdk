/* eslint-disable @typescript-eslint/ban-ts-comment, prettier/prettier */
import { baseDocumentLoader } from '../_baseDocumentLoader'

export interface FreeFormObject {
  [key: string]: any
}

/**
 * Find latest spec https://www.w3.org/TR/did-spec-registries/#did-document-properties
 */
export type DidDocument = {
  '@context': string | { [k: string]: any } | { [k: string]: any }[]
  id: string
  verificationMethod?: {
    id: string
    type: string
    controller: string
    publicKeyJwk?: any
    publicKeyMultibase?: string
    publicKeyHex?: string
    publicKeyPem?: string
    publicKeyBase58?: string
  }[]
  publicKey?: {
    id: string
    type: string
    controller?: string
    usage?: 'signing' | 'recovery' | string
    publicKeyHex?: string
    publicKeyPem?: string
    publicKeyJwk?: any
    publicKeyBase58?: string
  }[]
  authentication?: string[]
  assertionMethod?: string[]
  [k: string]: any
}

type GetSignSuiteOptions = {
  controller: string
  keyId: string
  privateKey: string
  publicKey?: string
}

type SignSuite = {
  createProof(params: any): any
}

type VerifySuite = Partial<{
  matchProof(params: any): boolean | Promise<boolean>
  verifyProof(params: any): Promise<any>
}>

type GetSignSuiteFn = (options: GetSignSuiteOptions) => SignSuite | Promise<SignSuite>

type CreateVerifySuite = (publicKey: Buffer, verificationMethod: string, controller: string) => VerifySuite

export type ProofType = 'EcdsaSecp256k1Signature2019' | 'BbsBlsSignature2020' | 'RsaSignature2018'

type KeyData = {
  privateKey: string
  publicKey: string
  keyFormat: 'pem' | 'base58'
}

type KeyGenerator = () => Promise<KeyData>

export type IPlatformCryptographyTools = Readonly<{
  keyGenerators: Record<'rsa' | 'bbs', KeyGenerator>
  signSuites: Readonly<Record<'ecdsa' | 'rsa' | 'bbs', GetSignSuiteFn>>
  verifySuiteFactories: Readonly<Record<ProofType, CreateVerifySuite>>
  decryptByPrivateKey(privateKeyBuffer: Buffer, encryptedDataString: string): Promise<any>
  encryptByPublicKey(publicKeyBuffer: Buffer, data: unknown): Promise<string>
  computePersonalHash(privateKeyBuffer: Buffer, data: string): Promise<string>
  deriveBbsSegmentProof: (options: {
    credential: any
    revealDocument: any
    documentLoader: typeof baseDocumentLoader
  }) => Promise<any>
  validateBbsSegmentProof: (options: {
    credential: any
    issuerDidDocument: any
    documentLoader: typeof baseDocumentLoader
  }) => Promise<{ result: boolean; error: string }>
}>
