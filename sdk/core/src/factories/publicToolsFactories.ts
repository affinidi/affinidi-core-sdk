import { EventComponent } from '@affinidi/affinity-metrics-lib'
import { PublicTools } from '../CommonNetworkMember/PublicTools'

import { SdkOptions } from '../dto/shared.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'

export const createPublicToolsFactories = (
  platformCryptographyTools: IPlatformCryptographyTools,
  component: EventComponent,
) => {
  return {
    /**
     * @description Generates a new DID and creates a new instance of SDK using password
     * @param options - parameters with specified environment
     * @param password - password
     * @returns initialized instance of SDK
     */
    createPublicTools: (inputOptions: SdkOptions) => {
      return new PublicTools(platformCryptographyTools, inputOptions, component)
    },
  }
}
