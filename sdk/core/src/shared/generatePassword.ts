import { randomBytes } from './randomBytes'

export const generatePassword = async (): Promise<string> => {
  const randomPassword = (await randomBytes(32)).toString('hex')
  // Make first found letter uppercase because hex string doesn't meet password requirements
  // Special characters at the end of password to make comply with cognito requirements
  return randomPassword.replace(/[a-f]/, 'A') + '!'
}
