import { isBrowser, isNode } from './lib/env'
import { browserHmacSha256Sign } from './lib/browser'
import { fallbackHmacSha256Sign } from './lib/fallback'
import { nodeHmacSha256Sign } from './lib/node'

import { equalConstTime } from './helpers'

export async function hmacSha256Sign(key: Buffer, msg: Buffer): Promise<Buffer> {
  let result
  if (isBrowser()) {
    result = await browserHmacSha256Sign(key, msg)
  } else if (isNode()) {
    result = nodeHmacSha256Sign(key, msg)
  } else {
    result = fallbackHmacSha256Sign(key, msg)
  }

  return result
}

export async function hmacSha256Verify(key: Buffer, msg: Buffer, sig: Buffer): Promise<boolean> {
  let result
  if (isBrowser()) {
    const expectedSig = await browserHmacSha256Sign(key, msg)
    result = equalConstTime(expectedSig, sig)
  } else if (isNode()) {
    const expectedSig = nodeHmacSha256Sign(key, msg)
    result = equalConstTime(expectedSig, sig)
  } else {
    const expectedSig = fallbackHmacSha256Sign(key, msg)
    result = equalConstTime(expectedSig, sig)
  }

  return result
}
