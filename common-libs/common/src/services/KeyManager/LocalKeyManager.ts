import {
  buildVCV1,
  buildVPV1,
  removeIfExists,
  VCV1,
  VCV1SubjectBaseMA,
  VCV1Unsigned,
  VPV1,
  VPV1Unsigned,
} from '@affinidi/vc-common'
import { KeyManager, UnsignedJwtObject, JwtObject, KeySuiteType } from './KeyManager'
import { KeysService } from '../index'
import DidDocumentService from '../DidDocumentService'
import { IPlatformCryptographyTools } from '../../shared/interfaces'
import { DocumentLoader } from '../../dto/shared.dto'
import { DidResolver } from '../../shared/DidResolver'

const BBS_CONTEXT = 'https://w3id.org/security/bbs/v1'

export class LocalKeyManager implements KeyManager {
  constructor(
    private readonly keysService: KeysService,
    private readonly platformCryptographyTools: IPlatformCryptographyTools,
    private readonly documentLoader: DocumentLoader,
    private readonly didResolver: DidResolver,
  ) {}
  signCredential<TSubject extends VCV1SubjectBaseMA>(
    unsignedCredentialInput: VCV1Unsigned<TSubject>,
    keySuiteType: KeySuiteType,
  ): Promise<VCV1<TSubject>> {
    const didDocumentService = DidDocumentService.createDidDocumentService(this.keysService)
    const did = didDocumentService.getMyDid()
    const mainKeyId = didDocumentService.getKeyId()
    const issuer = this.getIssuerForSigning(keySuiteType, this.keysService, did, mainKeyId)
    const unsignedCredential = this.postprocessCredentialToSign(unsignedCredentialInput, keySuiteType)

    return buildVCV1<TSubject>({
      unsigned: unsignedCredential,
      issuer,
      compactProof: keySuiteType === 'bbs',
      getSignSuite: this.platformCryptographyTools.signSuites[keySuiteType],
      documentLoader: this.documentLoader,
      getProofPurposeOptions: async () => ({
        controller: await didDocumentService.getDidDocument(this.didResolver),
      }),
    })
  }

  signJWTObject(unsignedJwtObject: UnsignedJwtObject, keyId?: string): Promise<JwtObject> {
    return Promise.resolve(this.keysService.signJWT(unsignedJwtObject, keyId))
  }

  signPresentation(
    vp: VPV1Unsigned,
    purpose: { challenge: string; domain: string },
    keySuiteType: KeySuiteType = 'ecdsa',
  ): Promise<VPV1> {
    const { seed, didMethod } = this.keysService.decryptSeed()

    const didDocumentService = DidDocumentService.createDidDocumentService(this.keysService)
    const did = didDocumentService.getMyDid()

    const signedVp = buildVPV1({
      unsigned: vp,
      holder: {
        did,
        keyId: didDocumentService.getKeyId(),
        privateKey: KeysService.getPrivateKey(seed.toString('hex'), didMethod).toString('hex'),
      },
      getSignSuite: this.platformCryptographyTools.signSuites[keySuiteType],
      documentLoader: this.documentLoader,
      getProofPurposeOptions: () => ({
        challenge: purpose.challenge,
        domain: purpose.domain,
      }),
    })

    return signedVp
  }

  private getIssuerForSigning(keySuiteType: KeySuiteType, keyService: KeysService, did: string, mainKeyId: string) {
    const shortDid = mainKeyId.split('#')[0]

    switch (keySuiteType) {
      case 'ecdsa':
        return {
          did,
          keyId: mainKeyId,
          privateKey: keyService.getOwnPrivateKey().toString('hex'),
        }
      case 'rsa':
        return {
          did,
          keyId: `${shortDid}#secondary`,
          privateKey: keyService.getExternalPrivateKey('rsa'),
        }
      case 'bbs':
        return {
          did,
          keyId: `${shortDid}#bbs`,
          privateKey: keyService.getExternalPrivateKey('bbs'),
          publicKey: keyService.getExternalPublicKey('bbs'),
        }
      default:
        throw new Error(`Unsupported key type '${keySuiteType}`)
    }
  }

  postprocessCredentialToSign<TVC extends VCV1Unsigned>(unsignedCredential: TVC, keySuiteType: KeySuiteType): TVC {
    if (keySuiteType !== 'bbs') return unsignedCredential
    return {
      ...unsignedCredential,
      '@context': [...removeIfExists(unsignedCredential['@context'], BBS_CONTEXT), BBS_CONTEXT],
    }
  }

  decryptByPrivateKey(encryptedMessage: string): Promise<any> {
    const privateKeyBuffer = this.keysService.getOwnPrivateKey()

    return this.platformCryptographyTools.decryptByPrivateKey(privateKeyBuffer, encryptedMessage)
  }

  sign(buffer: Buffer): Buffer {
    return this.keysService.sign(buffer)
  }

  signAsync(buffer: Buffer): Promise<Buffer> {
    return Promise.resolve(this.keysService.sign(buffer))
  }

  getAnchorTransactionPublicKey(): Promise<string> {
    const { seed, didMethod } = this.keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    return Promise.resolve(KeysService.getAnchorTransactionPublicKey(seedHex, didMethod).toString('hex'))
  }

  computePersonalHash(data: string): Promise<string> {
    const privateKeyBuffer = this.keysService.getOwnPrivateKey()
    return this.platformCryptographyTools.computePersonalHash(privateKeyBuffer, data)
  }

  encryptByPublicKey(data: Record<string, any>): Promise<string> {
    const publicKeyBuffer = this.keysService.getOwnPublicKey()
    return this.platformCryptographyTools.encryptByPublicKey(publicKeyBuffer, data)
  }
}
