import { ecdsaCryptographyTools } from '@affinidi/common'
import { crypto } from '../../src'
import randomBytes from 'randombytes'

import { IPlatformCryptographyTools } from '../../src/shared/interfaces'

const isValidPrivateKey = (privateKey: Buffer) => {
  const { EC_GROUP_ORDER, ZERO32 } = crypto

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

export const testPlatformToolsWithEncryption: IPlatformCryptographyTools = {
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
    const data = JSON.parse(dataBuffer.toString())

    return data
  },

  encryptByPublicKey: async (publicKeyBuffer, data) => {
    const dataString = JSON.stringify(data)
    const dataBuffer = Buffer.from(dataString)

    const randomIv = await randomBytes(16)
    const ephemPrivateKey = await getEphemKeyPair()

    const options = { iv: randomIv, ephemPrivateKey }

    const encryptedData = await crypto.encrypt(publicKeyBuffer, dataBuffer, options)

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

    const signatureBuffer = await crypto.hmacSha256Sign(privateKeyBuffer, dataBuffer)
    const signature = signatureBuffer.toString('hex')

    return signature
  },
}
