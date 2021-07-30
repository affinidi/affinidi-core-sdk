import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { IPlatformEncryptionTools } from '../shared/interfaces'
import { createLegacyWalletFactories } from './legacyWalletFactories'

/**
 * Turns any arrow function into a constructor of its return value accepting the same arguments
 * @param inputFunction Original function (e.g. `(arg: string) => ({ arg })`)
 * @returns Constructor (e.g. `C` such that `new C('abc') === { arg: 'abc' }`)
 */
const createConstructor = <T extends (...args: any) => any>(inputFunction: T) => {
  type TF = (...args: Parameters<T>) => ReturnType<T>
  type TConstructor = new (...args: Parameters<T>) => ReturnType<T>

  const f: TF = inputFunction

  return function (...args: Parameters<T>) {
    return f(...args)
  } as any as TConstructor
}

export const createWalletFactories = (platformEncryptionTools: IPlatformEncryptionTools, component: EventComponent) => {
  const { legacyConstructor, ...legacyFactories } = createLegacyWalletFactories(platformEncryptionTools, component)
  return Object.assign(createConstructor(legacyConstructor), legacyFactories)
}
