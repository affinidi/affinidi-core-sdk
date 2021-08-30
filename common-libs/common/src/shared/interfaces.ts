import { baseDocumentLoader } from '../_baseDocumentLoader'

export interface FreeFormObject {
  [key: string]: any
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
