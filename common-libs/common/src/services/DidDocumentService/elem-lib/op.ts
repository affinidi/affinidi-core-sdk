import { encodeJson, signEncodedPayload } from './func'

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

export const getCreatePayload = (didDocumentModel: any, primaryKey: any) => {
  // Create the encoded protected header.
  const header = {
    operation: 'create',
    kid: '#primary',
    alg: 'ES256K',
  }
  return makeSignedOperation(header, didDocumentModel, primaryKey.privateKey)
}

export const makeSignedOperation = (header: any, payload: any, privateKey: any) => {
  const encodedHeader = encodeJson(header)
  const encodedPayload = encodeJson(payload)
  const signature = signEncodedPayload(encodedHeader, encodedPayload, privateKey)

  return {
    protected: encodedHeader,
    payload: encodedPayload,
    signature,
  }
}
