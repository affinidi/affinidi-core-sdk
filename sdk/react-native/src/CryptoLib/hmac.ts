import { reactNativeHmacSha256Sign } from './lib/reactnative'

import { equalConstTime } from './helpers'

export async function hmacSha256Sign(key: Buffer, msg: Buffer): Promise<Buffer> {
  const  result = reactNativeHmacSha256Sign(key, msg)

  return result
}

export async function hmacSha256Verify(key: Buffer, msg: Buffer, sig: Buffer): Promise<boolean> {
  const expectedSig = reactNativeHmacSha256Sign(key, msg)
  const result = equalConstTime(expectedSig, sig)

  return result
}
