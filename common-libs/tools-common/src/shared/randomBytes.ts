const getRandomBytes = () => {
  try {
    return require('mobileRandomBytes')
  } catch (error) {
    return require('randombytes')
  }
}

export const randomBytes = getRandomBytes()
