import { isBrowser, isNode } from './lib/env'

import { browserSha256, browserSha512 } from './lib/browser'
import { nodeSha256, nodeSha512 } from './lib/node'
import { fallbackSha256, fallbackSha512 } from './lib/fallback'
import { EMPTY_BUFFER } from './constants'

export async function sha256(msg: Buffer): Promise<Buffer> {
  let result = EMPTY_BUFFER
  if (isBrowser()) {
    result = await browserSha256(msg)
  } else if (isNode()) {
    result = nodeSha256(msg)
  } else {
    result = fallbackSha256(msg)
  }

  return result
}

export async function sha512(msg: Buffer): Promise<Buffer> {
  let result = EMPTY_BUFFER
  if (isBrowser()) {
    result = await browserSha512(msg)
  } else if (isNode()) {
    result = nodeSha512(msg)
  } else {
    result = fallbackSha512(msg)
  }

  return result
}
