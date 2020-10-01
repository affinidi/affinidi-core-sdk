'use strict'

const { jsonRequest } = require('@kravc/request')

export const getOtp = async () => {
  const url = 'https://inbox.gdwk.in/api/IndexMessages?limit=1&sort=desc'

  // prettier-ignore
  const { object: { data: messages } } = await jsonRequest(console, { url })
  // prettier-ignore
  const [ message ] = messages
  const { body } = message

  // prettier-ignore
  const otp = body
    .split('Your verification code is ')[1]
    .split('.')[0]

  return otp
}
