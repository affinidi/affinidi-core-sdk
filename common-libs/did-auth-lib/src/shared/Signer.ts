import { KeysService, KeyVault } from '@affinidi/common'
import base64url from 'base64url'

type SignerOptions = {
  did: string
  keyId: string
  keyVault: KeyVault
}

export default class Signer {
  private readonly _did: string
  private readonly _keyId: string
  private readonly _keyVault: KeyVault

  /**
   * Construct a Signer based on the given options
   *
   * @param options auth service options
   */
  constructor(options: SignerOptions) {
    this._did = options.did
    this._keyId = options.keyId
    this._keyVault = options.keyVault
  }

  public async fillSignature(jwtObject: any) {
    jwtObject.payload.kid = this._keyId
    jwtObject.payload.iss = this._did
    jwtObject.signature = (await this.sign(jwtObject)).toString('hex')
  }

  private async sign(jwtObject: any): Promise<Buffer> {
    const toSign = [
      base64url.encode(JSON.stringify(jwtObject.header)),
      base64url.encode(JSON.stringify(jwtObject.payload)),
    ].join('.')

    const digest = KeysService.sha256(Buffer.from(toSign))

    return this._keyVault.signAsync(digest)
  }
}
