import { ecdsaCryptographyTools, IPlatformCryptographyTools, crypto } from '@affinidi/wallet-core-sdk'
import randomBytes from 'randombytes'

const isValidPrivateKey = (privateKey: Buffer) => {
  const { EC_GROUP_ORDER, ZERO32 } = crypto

  return privateKey.compare(ZERO32) > 0 && privateKey.compare(EC_GROUP_ORDER) < 0
}

const getEphemKeyPair = (): Buffer => {
  let ephemPrivateKey = randomBytes(32)

  while (!isValidPrivateKey(ephemPrivateKey)) {
    ephemPrivateKey = randomBytes(32)
  }

  return ephemPrivateKey
}

const platformCryptographyTools: IPlatformCryptographyTools = {
  ...ecdsaCryptographyTools,

  decryptByPrivateKey: async (privateKeyBuffer, encryptedDataString) => {
    const encryptedDataObject = JSON.parse(encryptedDataString)

    const { iv, ephemPublicKey, ciphertext, mac } = encryptedDataObject

    if (!iv || !ephemPublicKey || !ciphertext || !mac) {
      console.error('Can not decrypt message')
      return encryptedDataObject
    }

    const encryptedData = {
      iv: Buffer.from(iv, 'hex'),
      ephemPublicKey: Buffer.from(ephemPublicKey, 'hex'),
      ciphertext: Buffer.from(ciphertext, 'hex'),
      mac: Buffer.from(mac, 'hex'),
    }

    const dataBuffer = await crypto.decrypt(privateKeyBuffer, encryptedData)

    return JSON.parse(dataBuffer.toString())
  },

  encryptByPublicKey: async (publicKeyBuffer, data) => {
    const dataString = JSON.stringify(data)
    const dataBuffer = Buffer.from(dataString)

    const randomIv = randomBytes(16)
    const ephemPrivateKey = getEphemKeyPair()

    const options = { iv: randomIv, ephemPrivateKey }

    const encryptedData = await crypto.encrypt(publicKeyBuffer, dataBuffer, options)

    const { iv, ephemPublicKey, ciphertext, mac } = encryptedData

    const serializedEncryptedData = {
      iv: iv.toString('hex'),
      ephemPublicKey: ephemPublicKey.toString('hex'),
      ciphertext: ciphertext.toString('hex'),
      mac: mac.toString('hex'),
    }

    return JSON.stringify(serializedEncryptedData)
  },

  computePersonalHash: async (privateKeyBuffer, data) => {
    const dataBuffer = Buffer.from(data)

    const signatureBuffer = await crypto.hmacSha256Sign(privateKeyBuffer, dataBuffer)
    const signature = signatureBuffer.toString('hex')

    return signature
  },
}

export default platformCryptographyTools
