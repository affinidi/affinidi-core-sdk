import { profile } from '@affinidi/tools-common'

import { RawApiSpec, RequestOptionsForOperation } from '../types/request'
import { BuiltApiType } from '../types/typeBuilder'
import GenericApiService, { GenericConstructorOptions } from './GenericApiService'
import { PossibleDidAuthOperationIdsOf } from '../types/didAuth'
import { DidAuthAdapter } from '../helpers/DidAuthAdapter'
import { createDidAuthSession, DidAuthSession } from '../helpers/DidAuthManager'

export type DidAuthConstructorOptions = GenericConstructorOptions & {
  didAuthAdapter: DidAuthAdapter
}

@profile()
export default abstract class DidAuthApiService<
  TApi extends BuiltApiType,
  TDidAuthOperationId extends PossibleDidAuthOperationIdsOf<TApi>
> extends GenericApiService<TApi> {
  private readonly _didAuthSession: DidAuthSession
  private readonly _getDidAuthOperationId: TDidAuthOperationId

  protected constructor(
    serviceUrl: string,
    getDidAuthOperationId: TDidAuthOperationId,
    options: DidAuthConstructorOptions,
    rawSpec: RawApiSpec<TApi>,
  ) {
    super(serviceUrl, options, rawSpec)
    this._didAuthSession = createDidAuthSession(options.didAuthAdapter)
    this._getDidAuthOperationId = getDidAuthOperationId
  }

  private async _getToken() {
    return this._didAuthSession.getResponseToken((audienceDid) => this.execute(this._getDidAuthOperationId, {
      params: { audienceDid },
    } as RequestOptionsForOperation<TApi, TDidAuthOperationId>))
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
