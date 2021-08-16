import { profile } from '@affinidi/common'
import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { SdkOptions } from '../dto/shared.dto'
import { AffinidiCommonConstructor, IPlatformEncryptionTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { getOptionsFromEnvironment, ParsedOptions } from '../shared/getOptionsFromEnvironment'
import { BaseNetworkMember } from './BaseNetworkMember'

type GenericConstructor<T> = new (password: string, encryptedSeed: string, options: ParsedOptions) => T
type Constructor<T> = GenericConstructor<T> & GenericConstructor<NetworkMemberWithoutCognito>
type AbstractStaticMethods = Record<never, never>
type ConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new (...args: unknown[]) => unknown ? P : never
}[keyof T]
type OmitConstructor<T> = Omit<T, ConstructorKeys<T>>
type DerivedTypeForOptions<TInstance> = Constructor<TInstance> &
  AbstractStaticMethods &
  OmitConstructor<typeof NetworkMemberWithoutCognito>
type DerivedType<T extends DerivedType<T>> = DerivedTypeForOptions<InstanceType<T>>
export type UniversalDerivedType = DerivedType<DerivedTypeForOptions<NetworkMemberWithoutCognito>>

@profile()
export abstract class NetworkMemberWithoutCognito extends BaseNetworkMember {
  constructor(
    password: string,
    encryptedSeed: string,
    platformEncryptionTools: IPlatformEncryptionTools,
    affinidiCommon: AffinidiCommonConstructor | null,
    options: ParsedOptions,
    component: EventComponent,
  ) {
    super(password, encryptedSeed, platformEncryptionTools, affinidiCommon, options, component)
  }

  /**
   * @description Creates DID and anchors it
   * 1. generate seed/keys
   * 2. build DID document
   * 3. sign DID document
   * 4. store DID document in IPFS
   * 5. anchor DID with DID document ID from IPFS
   * @param password - encryption key which will be used to encrypt randomly created seed/keys pair
   * @param options - optional parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @returns
   *
   * did - hash from public key (your decentralized ID)
   *
   * encryptedSeed - seed is encrypted by provided password. Seed - it's a source to derive your keys
   */
  static async createWallet<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    password: string,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: password },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const { encryptedSeed } = await NetworkMemberWithoutCognito._register(password, options)
    return new this(password, encryptedSeed, options)
  }

  /**
   * @description Initilizes instance of SDK from seed
   * @param options - parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @param encryptedSeed - seed for derive keys in string hex format
   * @param password - optional password, will be generated, if not provided
   * @returns initialized instance of SDK
   */
  static async openWalletByEncryptedSeed<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    encryptedSeed: string,
    password: string,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: encryptedSeed },
      { isArray: false, type: 'string', isRequired: true, value: password },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    return new this(password, encryptedSeed, options)
  }
}
