import * as eccrypto from 'eccrypto-js'
import { ecdsaCryptographyTools } from '@affinidi/common'
import { IPlatformCryptographyTools } from '@affinidi/wallet-core-sdk'

const randomBytes = require('../mobileRandomBytes')

const isValidPrivateKey = (privateKey: any) => {
  const { EC_GROUP_ORDER, ZERO32 } = eccrypto

  const isValid = privateKey.compare(ZERO32) > 0 && privateKey.compare(EC_GROUP_ORDER) < 0
  return isValid
}

const getEphemKeyPair = async () => {
  let ephemPrivateKey = await randomBytes(32)

  while (!isValidPrivateKey(ephemPrivateKey)) {
    ephemPrivateKey = await randomBytes(32)
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

    const dataBuffer = await eccrypto.decrypt(privateKeyBuffer, encryptedData)
    const data = JSON.parse(dataBuffer.toString())

    return data
  },

  encryptByPublicKey: async (publicKeyBuffer, data) => {
    const dataString = JSON.stringify(data)
    const dataBuffer = Buffer.from(dataString)

    const randomIv = await randomBytes(16)
    const ephemPrivateKey = await getEphemKeyPair()

    const options = { iv: randomIv, ephemPrivateKey }

    const encryptedData = await eccrypto.encrypt(publicKeyBuffer, dataBuffer, options)

    const { iv, ephemPublicKey, ciphertext, mac } = encryptedData

    const serializedEncryptedData = {
      iv: iv.toString('hex'),
      ephemPublicKey: ephemPublicKey.toString('hex'),
      ciphertext: ciphertext.toString('hex'),
      mac: mac.toString('hex'),
    }

    const serializedEncryptedDataString = JSON.stringify(serializedEncryptedData)

    return serializedEncryptedDataString
  },

  computePersonalHash: async (privateKeyBuffer, data) => {
    const dataBuffer = Buffer.from(data)

    const signatureBuffer = await eccrypto.hmacSha256Sign(privateKeyBuffer, dataBuffer)
    const signature = signatureBuffer.toString('hex')

    return signature
  },

  keyGenerators: {
    bbs: () => {
      throw new Error('Not implemented')
    },
    rsa: () => {
      throw new Error('Not implemented')
    },
  },
}

export default platformCryptographyTools
