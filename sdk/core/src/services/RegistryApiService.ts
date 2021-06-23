import { profile } from '@affinidi/common'

import registrySpec from '../_registry'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { registryUrl: string; accessApiKey: string }

@profile()
export default class IssuerApiService extends GenericApiService<ExtractOperationIdTypes<typeof registrySpec>> {
  constructor(options: ConstructorOptions) {
    super(options.registryUrl, options, registrySpec)
  }
}
