import { profile } from '@affinidi/common'

import issuerSpec from '../_issuer'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { issuerUrl: string; accessApiKey: string }

@profile()
export default class IssuerApiService extends GenericApiService<ExtractOperationIdTypes<typeof issuerSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.issuerUrl, options, issuerSpec)
  }
}
