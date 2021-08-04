import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { VCV1, VCV1Unsigned, VPV1, VPV1Unsigned } from '@affinidi/vc-common'
import { KeyAlgorithmType } from '../dto/shared.dto'

export interface IPlatformEncryptionTools {
  platformName: string
  decryptByPrivateKey(privateKeyBuffer: Buffer, encryptedDataString: string): Promise<any>
  encryptByPublicKey(publicKeyBuffer: Buffer, data: unknown): Promise<string>
  computePersonalHash(privateKeyBuffer: Buffer, data: string): Promise<string>
  /**
   * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
   */
  buildExternalKeysSectionForSeed?(keyTypes: KeyAlgorithmType[]): Promise<string>
}

/**
 * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
 */
type KeyPair = {
  keyType: string
  keyFormat: string
  publicKey: string
  privateKey: string
}

/**
 * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
 */
export interface IAffinidiCommon {
  signCredential<VC extends VCV1Unsigned>(
    unsignedCredential: VC,
    encryptedSeed: string,
    encryptionKey: string,
  ): Promise<VCV1>

  /**
   * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
   */
  signUnsignedCredential?<VC extends VCV1Unsigned>(
    unsignedCredential: VC,
    encryptedSeed: string,
    encryptionKey: string,
    keyType: KeyAlgorithmType,
  ): Promise<VCV1>

  signPresentation(opts: {
    vp: VPV1Unsigned
    encryption: { seed: string; key: string }
    purpose: { challenge: string; domain: string }
  }): Promise<VPV1>

  validatePresentation(
    vp: any,
    didDocument?: any,
  ): Promise<{ result: true; data: VPV1 } | { result: false; error: string }>

  /**
   * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
   */
  deriveSegmentProof?(credential: VCV1, fields: string[], didDocument?: any): Promise<any>
}

/**
 * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
 */
type AffinidiCommonConstructorOptions = {
  apiKey: string
  registryUrl: string
  metricsUrl: string
  component: EventComponent
}

/**
 * @deprecated Temporary implementation; refactor by 6.0 release (FTL-1707)
 */
export type AffinidiCommonConstructor = new (options: AffinidiCommonConstructorOptions) => IAffinidiCommon
