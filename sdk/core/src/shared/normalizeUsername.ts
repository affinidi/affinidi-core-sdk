import { validateUsername } from './validateUsername'

export function normalizeUsername(username: string) {
  const { isEmailValid, isPhoneNumberValid } = validateUsername(username)

  if (isEmailValid) {
    username = username.replace(/@/g, '_')
  }

  if (isPhoneNumberValid) {
    username = username.replace(/\+/g, '_')
  }

  return username
}
