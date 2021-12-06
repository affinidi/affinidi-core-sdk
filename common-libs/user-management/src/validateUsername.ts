const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/
const PHONE_NUMBER_REGEX = /^([+])(\d){10,15}$/

export function validateUsername(username: string) {
  const isEmailValid = !!username.match(EMAIL_REGEX)
  const isPhoneNumberValid = !!username.match(PHONE_NUMBER_REGEX)

  let isUsername = true

  if (isEmailValid || isPhoneNumberValid) {
    isUsername = false
  }

  return { isUsername, isEmailValid, isPhoneNumberValid }
}
