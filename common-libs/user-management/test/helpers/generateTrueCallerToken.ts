import crypto from 'crypto'
import { ALGO_MAP, ProfileTrueCaller, ProfileTrueCallerPayload } from '../../src'

export const testPayload: ProfileTrueCallerPayload = {
  requestNonce: '27477696-2c27-4850-b0f3-f2a9b7fc602f',
  requestTime: Date.now(),
  phoneNumber: '+919781611000',
  firstName: 'Forav',
  lastName: 'Kubar',
  gender: 'N',
  countryCode: 'IN',
  trueName: true,
  ambassador: false,
  isBusiness: false,
  verifier: '2alivAkHjJD/S5OZ0X9hHZb3PMedUYnj96z6qK9r6yo=',
}

export const generateTrueCallerToken = (payload: ProfileTrueCallerPayload = testPayload): ProfileTrueCaller => {
  // default TrueCaller signature algorithm
  const signatureAlgorithm = 'SHA512withRSA'
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  const stringifiedPubKey = publicKey.split('\n').slice(1, -2).join('')
  process.env.TEST_PUBLICKEY_TRUE_CALLER = stringifiedPubKey
  console.log('`Truecaller` public key was set as TEST_PUBLICKEY_TRUE_CALLER')

  const payloadStr = JSON.stringify(payload)
  const payloadBase64 = Buffer.from(payloadStr).toString('base64')
  const paylodaBuffer = Buffer.from(payloadBase64)

  const signatureBuffer = crypto.sign(ALGO_MAP[signatureAlgorithm], paylodaBuffer, privateKey)
  const signatureBase64 = Buffer.from(signatureBuffer).toString('base64')

  return {
    payload: payloadBase64,
    signature: signatureBase64,
    signatureAlgorithm,
  }
}
