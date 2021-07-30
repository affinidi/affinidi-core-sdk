import { profile } from '@affinidi/common'
import { DidAuthService } from '@affinidi/affinidi-did-auth-lib'

import { RawApiSpec, RequestOptionsForOperation } from '../types/request'
import { BuiltApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'

export type DidAuthConstructorOptions = GenericConstructorOptions & {
  audienceDid: string
  didAuthService: DidAuthService
}
@profile()
export default abstract class DidAuthApiService<
  TApi extends BuiltApiType,
  TDidAuthOperationId extends keyof TApi
> extends GenericApiService<TApi> {
  private _responseToken?: string
  private _audienceDid: string
  private _didAuthService: DidAuthService
  private _getDidAuthOperationId: string

  constructor(
    serviceUrl: string,
    getDidAuthOperationId: string,
    options: DidAuthConstructorOptions,
    rawSpec: RawApiSpec<TApi>,
  ) {
    super(serviceUrl, options, rawSpec)
    this._audienceDid = options.audienceDid
    this._didAuthService = options.didAuthService
    this._getDidAuthOperationId = getDidAuthOperationId
  }

  private async _createDidAuthToken() {
    const didAuthRequestToken = await this.execute(this._getDidAuthOperationId, {
      params: {
        audienceDid: this._audienceDid,
      },
    } as RequestOptionsForOperation<TApi, TDidAuthOperationId>)
    return await this._didAuthService.createDidAuthResponseToken(didAuthRequestToken.body)
  }

  private async _getToken() {
    if (!this._responseToken || !this._didAuthService.isTokenExpired(this._responseToken)) {
      this._responseToken = await this._createDidAuthToken()
    }

    return this._responseToken
  }

  protected async executeWithDidAuth<TOperationId extends keyof TApi>(
    serviceOperationId: TOperationId,
    options: RequestOptionsForOperation<TApi, TOperationId>,
  ): Promise<{ body: TApi[TOperationId]['responseBody']; status: number }> {
    return super.execute(serviceOperationId, {
      ...options,
      authorization: await this._getToken(),
    })
  }
}
