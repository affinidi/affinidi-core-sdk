import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { AffinidiCommonConstructor, IPlatformEncryptionTools } from '../shared/interfaces'
import { createCognitoWalletFactories } from './cognitoWalletFactories'
import { createCognitolessWalletFactories } from './cognitolessWalletFactories'
import { createLegacyWalletFactories } from './legacyWalletFactories'

/**
 * Turns any arrow function into a constructor of its return value accepting the same arguments
 * @param inputFunction Original function (e.g. `(arg: string) => ({ arg })`)
 * @returns Constructor (e.g. `C` such that `new C('abc') === { arg: 'abc' }`)
 */
const createConstructor = <T extends (...args: any) => any>(inputFunction: T) => {
  type TF = (...args: Parameters<T>) => ReturnType<T>

  type TConstructor = {
    /**
     * @deprecated use `createFromEncryptedSeedAndPassword` instead
     */
    new (...args: Parameters<T>): ReturnType<T>
  }

  const f: TF = inputFunction

  return (function (...args: Parameters<T>) {
    return f(...args)
  } as any) as TConstructor
}

export const createV5CompatibleWalletFactories = (
  platformEncryptionTools: IPlatformEncryptionTools,
  affinidiCommon: AffinidiCommonConstructor | null,
  component: EventComponent,
) => {
  const { legacyConstructor, ...legacyFactories } = createLegacyWalletFactories(
    platformEncryptionTools,
    affinidiCommon,
    component,
  )
  const cognitoFactories = createCognitoWalletFactories(platformEncryptionTools, affinidiCommon, component)
  const cognitolessFactories = createCognitolessWalletFactories(platformEncryptionTools, affinidiCommon, component)
  return Object.assign(createConstructor(legacyConstructor), cognitoFactories, cognitolessFactories, legacyFactories)
}

export const createV6WalletFactories = (
  platformEncryptionTools: IPlatformEncryptionTools,
  affinidiCommon: AffinidiCommonConstructor | null,
  component: EventComponent,
) => {
  const cognitoFactories = createCognitoWalletFactories(platformEncryptionTools, affinidiCommon, component)
  const cognitolessFactories = createCognitolessWalletFactories(platformEncryptionTools, affinidiCommon, component)
  return {
    ...cognitoFactories,
    ...cognitolessFactories,
  }
}
