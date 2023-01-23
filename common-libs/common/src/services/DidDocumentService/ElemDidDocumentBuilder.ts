import base64url from 'base64url'
import { parse } from 'did-resolver'

import { func } from './elem-lib'
import { KeyVault } from './KeyVault'
import { computePayloadHash, encodeJson } from './elem-lib/func'

export default class ElemDidDocumentBuilder {
  private readonly _keyVault: KeyVault
  private readonly _signingKey: string

  constructor(keyProvider: KeyVault) {
    this._signingKey = 'primary'
    this._keyVault = keyProvider
  }

  private _extendDIDDocModelByExternalKeys(
    externalKeys: any,
    initialDidDocumentModel: any,
    authentication: string[],
    assertionMethod: string[],
  ) {
    if (externalKeys && Array.isArray(externalKeys) && externalKeys.length > 0) {
      for (const externalKey of externalKeys) {
        if (externalKey.type === 'rsa') {
          const rsaPubKeyId = 'secondary'

          const rsaPubKey = {
            id: `#${rsaPubKeyId}`,
            usage: 'signing',
            type: 'RsaVerificationKey2018',
            publicKeyPem: externalKey.public,
          }

          initialDidDocumentModel.publicKey.push(rsaPubKey)

          const { permissions } = externalKey
          if (permissions && permissions.length > 0) {
            for (const permission of permissions) {
              if (permission === 'authentication') {
                authentication.push(`#${rsaPubKeyId}`)
              }

              if (permission === 'assertionMethod') {
                assertionMethod.push(`#${rsaPubKeyId}`)
              }
            }
          }
        }

        if (externalKey.type === 'bbs') {
          const bbsPubKeyId = 'bbs'

          const bbsPubKey = {
            id: `#${bbsPubKeyId}`,
            type: 'Bls12381G2Key2020',
            usage: 'signing',
            // controller:
            publicKeyBase58: externalKey.public,
          }

          initialDidDocumentModel.publicKey.push(bbsPubKey)

          const { permissions } = externalKey
          if (permissions && permissions.length > 0) {
            for (const permission of permissions) {
              if (permission === 'authentication') {
                authentication.push(`#${bbsPubKeyId}`)
              }

              if (permission === 'assertionMethod') {
                assertionMethod.push(`#${bbsPubKeyId}`)
              }
            }
          }
        }
      }
    }
  }

  public buildDIDDocModel(externalKeys: any = null) {
    if (!this._keyVault.primaryPublicKey) {
      throw new Error('Primary Public Key is mandatory')
    }

    const primaryPublicKey = this._keyVault.primaryPublicKey.toString('hex')
    const recoveryPublicKey = this._keyVault.recoveryPublicKey?.toString('hex')

    const initialDidDocumentModel = this.buildRawDocumentModel(primaryPublicKey, recoveryPublicKey)
    const authentication = [`#${this._signingKey}`]
    const assertionMethod = [`#${this._signingKey}`]

    this._extendDIDDocModelByExternalKeys(externalKeys, initialDidDocumentModel, authentication, assertionMethod)

    return {
      ...initialDidDocumentModel,
      '@context': 'https://w3id.org/security/v2',
      authentication,
      assertionMethod,
    }
  }

  private _getDid(externalKeys?: any) {
    const didDocumentModel = this.buildDIDDocModel(externalKeys)

    const createPayload = this.createPayload(didDocumentModel)
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload)

    const baseElemDID = `did:elem:${didUniqueSuffix}`

    return {
      did: `${baseElemDID};elem:initial-state=${base64url.encode(JSON.stringify(createPayload))}`,
      shortFormDid: baseElemDID,
      didDocModel: didDocumentModel,
    }
  }

  public getMyDidConfig() {
    return this._getDid(this._keyVault.externalKeys)
  }

  async buildDidDocumentInfoFromParams(did: string, didDocModel: any, shortFormDid: string) {
    const { did: parsedDid } = parse(did)

    const prependBaseDID = (field: any) => {
      if (typeof field === 'string') {
        if (field.startsWith('#')) {
          return `${parsedDid}${field}`
        } else {
          return field
        }
      } else if (typeof field === 'object' && 'id' in field && typeof field.id === 'string') {
        if (field.id.startsWith('#')) {
          return { ...field, id: `${parsedDid}${field.id}` }
        } else {
          return field
        }
      } else {
        throw new Error('Unsupported method format')
      }
    }

    const didDocument = {
      id: parsedDid,
      ...didDocModel,
      publicKey: (didDocModel.publicKey || []).map(prependBaseDID),
      assertionMethod: (didDocModel.assertionMethod || []).map(prependBaseDID),
      authentication: (didDocModel.authentication || []).map(prependBaseDID),
    }

    return {
      did,
      didDocument,
      shortFormDid,
    }
  }

  async buildDidDocumentInfo() {
    const { did, didDocModel, shortFormDid } = this._getDid(this._keyVault.externalKeys)
    return this.buildDidDocumentInfoFromParams(did, didDocModel, shortFormDid)
  }

  private createPayload(didDocumentModel: any) {
    // Create the encoded protected header.
    const header = {
      operation: 'create',
      kid: '#primary',
      alg: 'ES256K',
    }

    return this.createSignedOperation(header, didDocumentModel)
  }

  private createSignedOperation(header: any, payload: any) {
    const encodedHeader = encodeJson(header)
    const encodedPayload = encodeJson(payload)
    const payloadHash = computePayloadHash(encodedHeader, encodedPayload)

    const signature = base64url.encode(this._keyVault.sign(payloadHash))

    return {
      protected: encodedHeader,
      payload: encodedPayload,
      signature,
    }
  }

  private buildRawDocumentModel(primaryPublicKey: string, recoveryPublicKey: string) {
    return {
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
    }
  }
}
