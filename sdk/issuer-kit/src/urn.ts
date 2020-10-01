export const genUrn5 = (len = 64) => {
  const arr = new Array(len)
  for (let i = 0; i < len; i++) {
    arr[i] = Math.floor(Math.random() * 256)
  }

  const str = Buffer.from(arr).toString('base64').replace(/\//g, '-').replace(/=/g, '')

  return `urn:urn-5:${str}`
}
