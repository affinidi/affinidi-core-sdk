import { profile } from '@affinidi/common'

import { RawApiSpec, RequestOptionsForOperation } from '../types/request'
import { BuiltApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'
import { PossibleDidAuthOperationIdsOf } from '../types/didAuth'
import { DidAuthAdapter } from '../helpers/DidAuthAdapter'

export type DidAuthConstructorOptions = GenericConstructorOptions & {
  didAuthAdapter: DidAuthAdapter
}

@profile()
export default abstract class DidAuthApiService<
  TApi extends BuiltApiType,
  TDidAuthOperationId extends PossibleDidAuthOperationIdsOf<TApi>
> extends GenericApiService<TApi> {
  private _responseToken?: string
  private readonly _didAuthAdapter: DidAuthAdapter
  private readonly _getDidAuthOperationId: TDidAuthOperationId

  protected constructor(
    serviceUrl: string,
    getDidAuthOperationId: TDidAuthOperationId,
    options: DidAuthConstructorOptions,
    rawSpec: RawApiSpec<TApi>,
  ) {
    super(serviceUrl, options, rawSpec)
    this._didAuthAdapter = options.didAuthAdapter
    this._getDidAuthOperationId = getDidAuthOperationId
  }

  private async _createDidAuthToken() {
    const didAuthRequestToken = await this.execute(this._getDidAuthOperationId, {
      params: {
        audienceDid: this._didAuthAdapter.did,
      },
    } as RequestOptionsForOperation<TApi, TDidAuthOperationId>)

    return await this._didAuthAdapter.createDidAuthResponseToken(didAuthRequestToken.body)
  }

  private async _getToken() {
    if (!this._responseToken || this._didAuthAdapter.isTokenExpired(this._responseToken)) {
      this._responseToken = await this._createDidAuthToken()
    }

    return this._responseToken
  }

  protected async executeWithDidAuth<TOperationId extends keyof Omit<TApi, TDidAuthOperationId>>(
    serviceOperationId: TOperationId,
    options: RequestOptionsForOperation<TApi, TOperationId>,
  ): Promise<{ body: TApi[TOperationId]['responseBody']; status: number }> {
    return super.execute(serviceOperationId, {
      ...options,
      authorization: await this._getToken(),
    })
  }
}
