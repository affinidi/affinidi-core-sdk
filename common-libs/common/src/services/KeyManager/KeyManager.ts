import { VCV1, VCV1SubjectBaseMA, VCV1Unsigned, VPV1, VPV1Unsigned } from '@affinidi/vc-common'

export type KeySuiteType = 'ecdsa' | 'rsa' | 'bbs'

export type JwtObject = {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
}

export type UnsignedJwtObject = Omit<JwtObject, 'signature'>

export type KeyManager = {
  signCredential<TSubject extends VCV1SubjectBaseMA>(
    unsignedCredentialInput: VCV1Unsigned<TSubject>,
    keySuiteType: 'ecdsa' | 'rsa' | 'bbs',
  ): Promise<VCV1<TSubject>>

  signJWTObject(unsignedJwtObject: UnsignedJwtObject, keyId?: string): Promise<JwtObject>

  signPresentation(vp: VPV1Unsigned, purpose: { challenge: string; domain: string }): Promise<VPV1>

  decryptByPrivateKey(encryptedMessage: string): Promise<any>

  /**
   * This method is supported only by LocalKeyManager, not recommended to use
   * @param buffer
   */
  sign?(buffer: Buffer): Buffer

  /**
   * Signs a digest
   * @param buffer
   */
  signAsync(buffer: Buffer): Promise<Buffer>

  getAnchorTransactionPublicKey(): Promise<string>

  computePersonalHash(data: string): Promise<string>

  /**
   * @param data - json parsable data
   */
  encryptByPublicKey(data: Record<string, any>): Promise<string>
}
