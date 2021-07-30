import { profile, KeysService } from '@affinidi/common'
import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { SdkOptions } from '../dto/shared.dto'
import { IPlatformEncryptionTools } from '../shared/interfaces'
import { ParametersValidator } from '../shared/ParametersValidator'
import { randomBytes } from '../shared/randomBytes'
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
    options: ParsedOptions,
    component: EventComponent,
  ) {
    super(password, encryptedSeed, platformEncryptionTools, options, component)
  }

  /**
   * @description Initilizes instance of SDK from seed
   * @param options - parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @param seedHexWithMethod - seed for derive keys in string hex format
   * @param password - optional password, will be generated, if not provided
   * @returns initialized instance of SDK
   */
  static async createFromUnencryptedSeed<T extends DerivedType<T>>(
    this: T,
    inputOptions: SdkOptions,
    seedHexWithMethod: string,
    inputPassword?: string,
  ): Promise<InstanceType<T>> {
    await ParametersValidator.validate([
      { isArray: false, type: SdkOptions, isRequired: true, value: inputOptions },
      { isArray: false, type: 'string', isRequired: true, value: seedHexWithMethod },
      { isArray: false, type: 'string', isRequired: false, value: inputPassword },
    ])

    const options = getOptionsFromEnvironment(inputOptions)
    const { password, passwordBuffer } = await NetworkMemberWithoutCognito.createPasswordBuffer(inputPassword)
    const encryptedSeedWithInitializationVector = await KeysService.encryptSeed(seedHexWithMethod, passwordBuffer)
    return new this(password, encryptedSeedWithInitializationVector, options)
  }

  private static async createPasswordBuffer(password?: string) {
    if (password) {
      return {
        password,
        passwordBuffer: KeysService.normalizePassword(password),
      }
    }

    const passwordBuffer = await randomBytes(32)
    return {
      password: passwordBuffer.toString('hex'),
      passwordBuffer,
    }
  }

  /**
   * @description Initilizes instance of SDK from seed
   * @param options - parameter { registryUrl: 'https://affinity-registry.dev.affinity-project.org' }
   * @param encryptedSeed - seed for derive keys in string hex format
   * @param password - optional password, will be generated, if not provided
   * @returns initialized instance of SDK
   */
  static async createFromEncryptedSeedAndPassword<T extends DerivedType<T>>(
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
