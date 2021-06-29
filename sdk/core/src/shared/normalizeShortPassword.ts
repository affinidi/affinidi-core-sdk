import { KeysService } from '@affinidi/common'

import { MINIMUM_RECOMMENDED_PASSWORD_LENGTH } from '../_defaultConfig'

export const normalizeShortPassword = (password: string, login: string) => {
  if (password.length < MINIMUM_RECOMMENDED_PASSWORD_LENGTH) {
    const userNameBuffer = KeysService.sha256(Buffer.from(login))
    const userNameHash = userNameBuffer.toString('hex')

    password = `${password}${userNameHash}A!`
  }

  return password
}
