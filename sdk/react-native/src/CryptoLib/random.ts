import { isValidKeyLength } from './helpers'

import { reactNativeRandomBytes } from './lib/reactnative'

export function randomBytes(length: number): Buffer {
  if (!isValidKeyLength(length)) {
    throw new Error(`randomBytes - invalid key length: ${length}`)
  }

  const result = reactNativeRandomBytes(length)

  return result
}
