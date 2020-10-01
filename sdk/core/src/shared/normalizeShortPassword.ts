import { KeysService } from '@affinidi/common'

import { MINIMUM_RECOMMENDED_PASSWORD_LENGTH } from '../_defaultConfig'

export const normalizeShortPassword = (password: string, userName: string) => {
  if (password.length < MINIMUM_RECOMMENDED_PASSWORD_LENGTH) {
    const userNameBuffer = KeysService.sha256(Buffer.from(userName))
    const userNameHash = userNameBuffer.toString('hex')

    password = `${password}${userNameHash}A!`
  }

  return password
}
