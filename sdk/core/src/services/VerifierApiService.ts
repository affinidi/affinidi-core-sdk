import { profile } from '@affinidi/common'

import verifierSpec from '../_verifier'
import GenericApiService, { ExtractOperationIdTypes } from './GenericApiService'

type ConstructorOptions = { verifierUrl: string; accessApiKey: string }

@profile()
export default class VerifierApiService extends GenericApiService<ExtractOperationIdTypes<typeof verifierSpec>> {
  constructor(options: ConstructorOptions) {
    super(options.verifierUrl, options, verifierSpec)
  }
}
