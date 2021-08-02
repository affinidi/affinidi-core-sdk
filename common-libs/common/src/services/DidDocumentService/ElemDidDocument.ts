import base64url from 'base64url'
import { parse } from 'did-resolver'

import { op, func } from './elem-lib'

import KeysService from '../KeysService'

export default class ElemDidDocument {
  private readonly _keysService: KeysService
  private readonly _signingKey: string

  constructor(keysService: KeysService) {
    this._signingKey = 'primary'
    this._keysService = keysService
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

  private _buildDIDDocModel(
    seedHex: string,
    publicKeyPrimary: string = null,
    privateKeyPrimary: string = null,
    publicKeyRecovery: string = null,
    privateKeyRecovery: string = null,
    externalKeys: any = null,
  ) {
    const arePublicPrivateKeysDefined = publicKeyPrimary && privateKeyPrimary

    if (!arePublicPrivateKeysDefined) {
      const { publicKey, privateKey } = KeysService.getPublicAndPrivateKeys(seedHex, 'elem')

      publicKeyPrimary = publicKey.toString('hex')
      privateKeyPrimary = privateKey.toString('hex')
    }

    const arePublicPrivateRecoveryKeysDefined = publicKeyRecovery && privateKeyRecovery

    if (!arePublicPrivateRecoveryKeysDefined) {
      const { publicKey, privateKey } = KeysService.getAnchorTransactionPublicAndPrivateKeys(seedHex, 'elem')

      publicKeyRecovery = publicKey.toString('hex')
      privateKeyRecovery = privateKey.toString('hex')
    }

    const primaryKey = { publicKey: publicKeyPrimary, privateKey: privateKeyPrimary }
    const recoveryKey = { publicKey: publicKeyRecovery, privateKey: privateKeyRecovery }

    const initialDidDocumentModel = op.getDidDocumentModel(primaryKey.publicKey, recoveryKey.publicKey)
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

  private _getDid(seedHex: string, externalKeys: any) {
    const { publicKey, privateKey } = KeysService.getPublicAndPrivateKeys(seedHex, 'elem')

    const primaryKey = {
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
    }

    const didDocumentModel = this._buildDIDDocModel(
      seedHex,
      primaryKey.publicKey,
      primaryKey.privateKey,
      null,
      null,
      externalKeys,
    )
    const createPayload = op.getCreatePayload(didDocumentModel, primaryKey)
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload)

    const baseElemDID = `did:elem:${didUniqueSuffix}`

    return {
      did: `${baseElemDID};elem:initial-state=${base64url.encode(JSON.stringify(createPayload))}`,
      shortFormDid: baseElemDID,
      didDocModel: didDocumentModel,
    }
  }

  private _getMyDidConfig() {
    const { seed, externalKeys } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')

    return this._getDid(seedHex, externalKeys)
  }

  async getMyDid(): Promise<string> {
    const { did } = this._getMyDidConfig()

    return did
  }

  async getKeyId(did: string = null) {
    if (!did) {
      const { shortFormDid } = this._getMyDidConfig()
      did = shortFormDid
    }

    return `${did}#${this._signingKey}`
  }

  async buildDidDocument() {
    const { seed, externalKeys } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')

    const { did, didDocModel } = this._getDid(seedHex, externalKeys)
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

    return {
      id: parsedDid,
      ...didDocModel,
      publicKey: (didDocModel.publicKey || []).map(prependBaseDID),
      assertionMethod: (didDocModel.assertionMethod || []).map(prependBaseDID),
      authentication: (didDocModel.authentication || []).map(prependBaseDID),
    }
  }
}
