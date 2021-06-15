'use strict'

import sinon from 'sinon'

import { KeysService } from '@affinidi/common'

export const stubDecryptSeed = (seedHex: string, didMethod: string) => {
  const seedHexWithMethod = `${seedHex}++${didMethod}`
  sinon.stub(KeysService.prototype, 'decryptSeed').returns({
    seed: Buffer.from(seedHex),
    didMethod,
    seedHexWithMethod,
    externalKeys: null,
  })
}
