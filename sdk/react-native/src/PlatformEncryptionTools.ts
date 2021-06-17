import * as eccrypto from 'eccrypto-js'
import randomBytes from 'randombytes'

export class PlatformEncryptionTools {
  platformName = 'react-native'

  isValidPrivateKey(privateKey: Buffer) {
    const { EC_GROUP_ORDER, ZERO32 } = eccrypto

    return privateKey.compare(ZERO32) > 0 && privateKey.compare(EC_GROUP_ORDER) < 0
  }

  getEphemKeyPair(): Buffer {
    let ephemPrivateKey = randomBytes(32)

    while (!this.isValidPrivateKey(ephemPrivateKey)) {
      ephemPrivateKey = randomBytes(32)
    }

    return ephemPrivateKey
  }

  async decryptByPrivateKey(privateKeyBuffer: Buffer, encryptedDataString: string): Promise<any> {
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

    return JSON.parse(dataBuffer.toString())
  }

  async encryptByPublicKey(publicKeyBuffer: Buffer, data: unknown): Promise<string> {
    const dataString = JSON.stringify(data)
    const dataBuffer = Buffer.from(dataString)

    const randomIv = randomBytes(16)
    const ephemPrivateKey = this.getEphemKeyPair()

    const options = { iv: randomIv, ephemPrivateKey }

    const encryptedData = await eccrypto.encrypt(publicKeyBuffer, dataBuffer, options)

    const { iv, ephemPublicKey, ciphertext, mac } = encryptedData

    const serializedEncryptedData = {
      iv: iv.toString('hex'),
      ephemPublicKey: ephemPublicKey.toString('hex'),
      ciphertext: ciphertext.toString('hex'),
      mac: mac.toString('hex'),
    }

    return JSON.stringify(serializedEncryptedData)
  }
}

const platformEncryptionTools = new PlatformEncryptionTools()

export default platformEncryptionTools
