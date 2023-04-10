import { reactNativeSha256, reactNativeSha512 } from './lib/reactnative'
import { EMPTY_BUFFER } from './constants'

export async function sha256(msg: Buffer): Promise<Buffer> {
  let result = EMPTY_BUFFER
  result = reactNativeSha256(msg)

  return result
}

export async function sha512(msg: Buffer): Promise<Buffer> {
  let result = EMPTY_BUFFER
  result = reactNativeSha512(msg)

  return result
}
