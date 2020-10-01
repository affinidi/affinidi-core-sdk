'use strict'

const randomBytes = async (length) => {
  let randombytes

  /* istanbul ignore next: skip as expo-random is tricky to cover */
  if (process && process.env && process.env.NODE_ENV === 'test') {
    randombytes = require('randombytes')

    return randombytes(length)
  } else {
    const expoRandom = require('expo-random')
    const randombytes = await expoRandom.getRandomBytesAsync(length)

    return Buffer.from(randombytes.buffer)
  }
}

module.exports = randomBytes
