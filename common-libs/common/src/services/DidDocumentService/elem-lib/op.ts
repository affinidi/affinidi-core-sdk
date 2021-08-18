import { encodeJson, signEncodedPayload } from './func'
import base64url from 'base64url'

export const getDidDocumentModel = (primaryPublicKey: string, recoveryPublicKey: string) => ({
  '@context': 'https://w3id.org/did/v1',
  publicKey: [
    {
      id: '#primary',
      usage: 'signing',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: primaryPublicKey,
    },
    {
      id: '#recovery',
      usage: 'recovery',
      type: 'Secp256k1VerificationKey2018',
      publicKeyHex: recoveryPublicKey,
    },
  ],
})

export const getCreatePayload = (didDocumentModel: any, signFn: (payload: Buffer) => Buffer) => {
  // Create the encoded protected header.
  const header = {
    operation: 'create',
    kid: '#primary',
    alg: 'ES256K',
  }
  return makeSignedOperation(header, didDocumentModel, signFn)
}

export const makeSignedOperation = (header: any, payload: any, signFn: (payload: Buffer) => Buffer) => {
  const encodedHeader = encodeJson(header)
  const encodedPayload = encodeJson(payload)
  const signature = base64url.encode(signEncodedPayload(encodedHeader, encodedPayload, signFn))

  return {
    protected: encodedHeader,
    payload: encodedPayload,
    signature,
  }
}
